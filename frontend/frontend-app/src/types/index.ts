export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  status: 'sending' | 'complete' | 'error';
}

export type GeminiModel = 'Gemini 1.5 Flash' | 'Gemini 1.5 Pro' | 'Gemini 2.0 Experimental';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: GeminiModel;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  category: 'code' | 'write' | 'explore' | 'analyze';
}
