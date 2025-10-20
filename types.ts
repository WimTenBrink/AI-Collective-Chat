// FIX: Import ReactNode to resolve 'Cannot find namespace React'.
import type { ReactNode } from 'react';

export interface Message {
  id: number;
  author: string;
  text: string;
}

export interface Bot {
  name: string;
  personality: string;
  // FIX: Use ReactNode directly.
  avatar: ReactNode;
  color: string;
  isTyping: boolean;
}
