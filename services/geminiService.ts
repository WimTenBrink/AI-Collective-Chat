import { GoogleGenAI } from "@google/genai";
import type { Message } from '../types';

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

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formatChatHistory(history),
        config: {
          systemInstruction: personality,
          temperature: 0.8,
          topP: 0.95,
        }
      });
      return response.text;
    } catch (error) {
      lastError = error;
      const errorMessage = (error as any)?.message || '';

      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(delay);
      } else {
        // Not a rate limit error, don't retry
        console.error("Non-retriable error generating content:", error);
        break;
      }
    }
  }

  // After all retries, handle the last known error
  console.error("Failed to get bot response after multiple retries.", lastError);
  if (lastError) {
    const finalErrorMessage = (lastError as any)?.message || '';
    if (finalErrorMessage.includes('API key not valid')) {
       return "Your API Key is invalid. Please check it in the settings.";
    }
    if (finalErrorMessage.includes('429') || finalErrorMessage.includes('RESOURCE_EXHAUSTED')) {
       return "[System message: The chat is temporarily paused due to too many requests. It will resume shortly.]";
    }
  }

  return "[System message: A connection error occurred. Please check your connection or API key.]";
};