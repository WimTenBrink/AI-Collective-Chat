import React from 'react';
import type { Bot } from '../types';

interface TypingIndicatorProps {
  bots: Bot[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ bots }) => {
  const typingBots = bots.filter(bot => bot.isTyping);

  if (typingBots.length === 0) {
    return null;
  }

  const typingText =
    typingBots.length === 1
      ? `${typingBots[0].name} is typing...`
      : `${typingBots.map(b => b.name).join(', ')} are typing...`;

  return (
    <div className="flex justify-start items-center gap-3 my-4 h-10">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>
      <p className="text-sm text-gray-400 italic">{typingText}</p>
    </div>
  );
};

export default TypingIndicator;
