import type { ReactNode } from 'react';

export interface Message {
  id: number;
  author: string;
  text: string;
}

export interface Bot {
  name: string;
  personality: string;
  avatar: ReactNode;
  color: string;
  isTyping: boolean;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'API';

export interface LogEntry {
  id: number;
  timestamp: Date;
  level: LogLevel;
  title: string;
  details: any;
}
