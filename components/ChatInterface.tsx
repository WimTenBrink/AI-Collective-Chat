import React, { useState, useRef, useEffect } from 'react';
import type { Message, Bot } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface ChatInterfaceProps {
  messages: Message[];
  bots: Bot[];
  onSendMessage: (text: string) => void;
  isChatActive: boolean;
  onToggleChat: () => void;
  onOpenSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, bots, onSendMessage, isChatActive, onToggleChat, onOpenSettings }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, bots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="w-16"></div> {/* Spacer */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-center font-orbitron">AI Collective Chat</h1>
          <p className="text-sm text-gray-400 text-center">A conversation on science & technology</p>
        </div>
        <div className="flex items-center gap-2 w-16">
          <button onClick={onToggleChat} title={isChatActive ? "Pause Bot Chat" : "Resume Bot Chat"} className="text-gray-400 hover:text-cyan-400 transition-colors">
            {isChatActive ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={onOpenSettings} title="Settings" className="text-gray-400 hover:text-cyan-400 transition-colors">
            <SettingsIcon />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <TypingIndicator bots={bots} />
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Set a topic or send a message..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;