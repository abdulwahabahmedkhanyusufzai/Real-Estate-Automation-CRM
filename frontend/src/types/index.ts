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

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  author: string;
}

export interface Lead {
  id: string;
  name: string;
  budget: string;
  area: string;
  propertyType: string;
  urgency: 'Low' | 'Medium' | 'High';
  leadScore: number;
  assignedBroker: string;
  status: 'New' | 'In Progress' | 'Contacted' | 'Closed';
  email: string;
  phone: string;
  createdAt: Date;
  notes: Note[];
}

