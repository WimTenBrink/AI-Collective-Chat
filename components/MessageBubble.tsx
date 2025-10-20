import React from 'react';
import type { Message, Bot } from '../types';
import { BOTS_CONFIG, USER_NAME } from '../constants';

interface MessageBubbleProps {
  message: Message;
}

const getAuthorConfig = (author: string): { avatar: React.ReactNode; color: string } | null => {
  if (author === USER_NAME) return null;
  const botConfig = BOTS_CONFIG.find(bot => bot.name === author);
  return botConfig ? { avatar: botConfig.avatar, color: botConfig.color } : null;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.author === USER_NAME;
  const authorConfig = getAuthorConfig(message.author);

  if (isUser) {
    return (
      <div className="flex justify-end items-start gap-3 my-4">
        <div className="flex flex-col items-end">
          <p className="font-bold text-right text-gray-400 font-orbitron">{message.author}</p>
          <div className="mt-1 bg-blue-600 rounded-lg rounded-br-none p-3 max-w-lg">
            <p className="text-white">{message.text}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 text-white text-xl">
          U
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start items-start gap-3 my-4">
      {authorConfig?.avatar}
      <div className="flex flex-col items-start">
        <p className={`font-bold ${authorConfig?.color || 'text-gray-400'} font-orbitron`}>{message.author}</p>
        <div className="mt-1 bg-gray-700 rounded-lg rounded-bl-none p-3 max-w-lg">
          <p className="text-gray-200">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
