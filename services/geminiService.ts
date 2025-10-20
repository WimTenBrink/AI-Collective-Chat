import { GoogleGenAI } from "@google/genai";
import type { Message } from '../types';
import { logService } from './logService';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAiClient = (): GoogleGenAI | null => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

function formatChatHistory(history: Message[]): string {
  // Take last 15 messages to keep context reasonable and prevent large payloads
  return history.slice(-15).map(msg => `${msg.author}: ${msg.text}`).join('\n');
}

export const getBotResponse = async (personality: string, history: Message[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key not found. Please set it in the settings.";
  }

  let lastError: any = null;

  const requestPayload = {
    model: "gemini-2.5-flash",
    contents: formatChatHistory(history),
    config: {
      systemInstruction: personality,
      temperature: 0.8,
      topP: 0.95,
    }
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      logService.api('Gemini API Request', { attempt: attempt + 1, payload: requestPayload });
      const response = await ai.models.generateContent(requestPayload);
      logService.api('Gemini API Success Response', { response });
      return response.text;
    } catch (error) {
      lastError = error;
      logService.api('Gemini API Error Response', { error });

      const errorMessage = JSON.stringify(error) || '';

      if (errorMessage.includes('API_KEY_HTTP_REFERRER_BLOCKED') || errorMessage.includes('Requests from referer')) {
          logService.error("Referrer block error detected", error);
          return "[System message: Your API Key has HTTP referrer restrictions that are blocking requests from this app. Please go to your Google Cloud Console, edit the API key, and remove all website restrictions.]";
      }

      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 1000;
        logService.warn(`Rate limit hit. Retrying in ${Math.round(delay / 1000)}s...`, { attempt: attempt + 1, maxRetries: MAX_RETRIES });
        await sleep(delay);
      } else {
        logService.error("Non-retriable error generating content", error);
        break;
      }
    }
  }

  logService.error("Failed to get bot response after multiple retries.", lastError);
  if (lastError) {
    const finalErrorMessage = JSON.stringify(lastError);
    
    if (finalErrorMessage.includes('API key not valid')) {
       return "Your API Key is invalid. Please check it in the settings.";
    }
    if (finalErrorMessage.includes('429') || finalErrorMessage.includes('RESOURCE_EXHAUSTED')) {
       return "[System message: The chat is temporarily paused due to too many requests. It will resume shortly.]";
    }
  }

  return "[System message: A connection error occurred. Please check your connection or API key.]";
};
