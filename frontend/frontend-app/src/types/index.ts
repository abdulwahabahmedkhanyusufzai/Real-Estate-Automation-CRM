export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  status: 'sending' | 'complete' | 'error';
}

export type GeminiModel = 'Gemma Model' | 'RAG n8n Agent';

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
