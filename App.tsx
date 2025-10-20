import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import SettingsDialog from './components/SettingsDialog';
import ConsoleLogDialog from './components/ConsoleLogDialog';
import { getBotResponse } from './services/geminiService';
import { logService } from './services/logService';
import type { Message, Bot } from './types';
import { BOTS_CONFIG, USER_NAME } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isChatActive, setIsChatActive] = useState(true);
  const [introductionsDone, setIntroductionsDone] = useState(false);
  const introInProgressRef = useRef(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    logService.info('App Initialized', { hasApiKey: !!storedKey });
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  const fetchPersonalities = useCallback(async () => {
    try {
      logService.info('Fetching personalities...');
      const botPromises = BOTS_CONFIG.map(async (config) => {
        const response = await fetch(config.personalityFile);
        if (!response.ok) {
          throw new Error(`Failed to fetch personality: ${config.personalityFile}`);
        }
        const personalityText = await response.text();
        return {
          name: config.name,
          personality: personalityText,
          avatar: config.avatar,
          color: config.color,
          isTyping: false,
        };
      });
      const loadedBots = await Promise.all(botPromises);
      setBots(loadedBots);
      logService.info('Personalities loaded successfully', { botCount: loadedBots.length });
    } catch (error) {
      logService.error("Error loading bot personalities", { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonalities();
  }, [fetchPersonalities]);
  
  useEffect(() => {
    const runIntroductions = async () => {
      logService.info('Starting bot introductions...');
      const introPrompt: Message = { id: 0, author: 'System', text: 'Please provide a short, in-character introduction.' };

      for (const bot of bots) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
        setBots(prev => prev.map(b => b.name === bot.name ? { ...b, isTyping: true } : b));
        
        logService.debug(`Bot ${bot.name} is generating its introduction.`);
        const responseText = await getBotResponse(bot.personality, [introPrompt]);
        const newBotMessage: Message = {
          id: Date.now() + Math.random(),
          author: bot.name,
          text: responseText,
        };
        
        setMessages(prev => [...prev, newBotMessage]);
        setBots(prev => prev.map(b => b.name === bot.name ? { ...b, isTyping: false } : b));
      }
      logService.info('Bot introductions complete.');
      setIntroductionsDone(true);
    };
  
    if (bots.length > 0 && apiKey && !introductionsDone && !isLoading && !introInProgressRef.current) {
      introInProgressRef.current = true;
      runIntroductions();
    }
  }, [bots, apiKey, introductionsDone, isLoading]);


  const triggerBotResponse = useCallback(async (currentHistory: Message[]) => {
    if (!apiKey || bots.length === 0) return;

    const recentSpeakers = new Set(currentHistory.slice(-3).map(m => m.author));
    const availableBots = bots.filter(bot => !recentSpeakers.has(bot.name));
    
    if (availableBots.length === 0) {
      logService.warn('No available bots to respond.', { recentSpeakers: Array.from(recentSpeakers) });
      return;
    }

    const botToRespond = availableBots[Math.floor(Math.random() * availableBots.length)];
    logService.info(`Triggering bot response: ${botToRespond.name}`, { 
        availableBots: availableBots.map(b=>b.name),
        recentSpeakers: Array.from(recentSpeakers)
    });

    setBots(prev => prev.map(b => b.name === botToRespond.name ? { ...b, isTyping: true } : b));

    const responseText = await getBotResponse(botToRespond.personality, currentHistory);

    const newBotMessage: Message = {
      id: Date.now(),
      author: botToRespond.name,
      text: responseText,
    };
    
    setMessages(prev => [...prev, newBotMessage]);
    setBots(prev => prev.map(b => b.name === botToRespond.name ? { ...b, isTyping: false } : b));

  }, [bots, apiKey]);

  useEffect(() => {
    const isBotTyping = bots.some(bot => bot.isTyping);
    if (isBotTyping || isLoading || isSettingsOpen || !isChatActive || !introductionsDone) {
      return;
    }
    
    const timer = setTimeout(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.author !== USER_NAME) {
         if (Math.random() < 0.5) {
           logService.debug("Triggering autonomous bot chat.");
           triggerBotResponse(messages);
         }
      }
    }, 15000 + Math.random() * 10000);

    return () => clearTimeout(timer);
  }, [bots, isLoading, messages, triggerBotResponse, isSettingsOpen, isChatActive, introductionsDone]);

  const handleSendMessage = (text: string) => {
    logService.info("User sent a message", { text });
    const newUserMessage: Message = {
      id: Date.now(),
      author: USER_NAME,
      text: text,
    };
    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);

    setTimeout(() => {
      triggerBotResponse(updatedHistory);
    }, 500);
  };
  
  const handleToggleChat = () => {
    logService.info(`Toggling autonomous chat`, { to: !isChatActive });
    setIsChatActive(prev => !prev);
  };

  const handleSaveApiKey = (newKey: string) => {
    logService.info('API Key saved.');
    localStorage.setItem('gemini_api_key', newKey);
    setApiKey(newKey);
    setIsSettingsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500 mx-auto"></div>
            <h2 className="text-3xl font-orbitron mt-4">Initializing AI Collective...</h2>
            <p className="text-gray-400 mt-2">Loading personalities and calibrating consciousness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full h-full max-w-4xl p-4 md:p-8">
        <ChatInterface
          messages={messages}
          bots={bots}
          onSendMessage={handleSendMessage}
          isChatActive={isChatActive}
          onToggleChat={handleToggleChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenConsole={() => setIsConsoleOpen(true)}
        />
      </div>
      <SettingsDialog 
        isOpen={isSettingsOpen}
        onClose={() => apiKey && setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
      <ConsoleLogDialog
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />
    </div>
  );
};

export default App;
