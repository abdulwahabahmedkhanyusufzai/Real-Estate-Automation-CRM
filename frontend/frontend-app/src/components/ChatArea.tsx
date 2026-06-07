import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession, GeminiModel } from '../types';
import { MessageContent } from './MessageContent';
import { SuggestionCards } from './SuggestionCards';
import { 
  Image as ImageIcon, 
  Mic, 
  ChevronDown, 
  Sparkles, 
  ArrowUp,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Check,
  Menu,
  Paperclip,
  X,
  Loader2,
  FileText
} from 'lucide-react';


interface ChatAreaProps {
  currentSession: ChatSession | null;
  onSendMessage: (content: string, attachment?: { name: string; text?: string }) => void;
  selectedModel: GeminiModel;
  setSelectedModel: (model: GeminiModel) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  currentSession,
  onSendMessage,
  selectedModel,
  setSelectedModel,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const [prompt, setPrompt] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileText, setUploadedFileText] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models: GeminiModel[] = ['Gemini 1.5 Flash', 'Gemini 1.5 Pro', 'Gemini 2.0 Experimental'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are supported at this stage.');
      return;
    }

    setUploadStatus('uploading');
    setUploadedFileName(file.name);
    setUploadedFileText(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://n8n.automationdev.app/webhook/file-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      let textContent = '';
      try {
        const data = await response.json();
        if (data) {
          if (typeof data === 'string') {
            textContent = data;
          } else if (data.text) {
            textContent = data.text;
          } else if (data.content) {
            textContent = data.content;
          } else if (data.data) {
            textContent = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
          } else if (data.extractedText) {
            textContent = data.extractedText;
          } else {
            textContent = JSON.stringify(data);
          }
        }
      } catch {
        textContent = await response.text();
      }

      setUploadedFileText(textContent);
      setUploadStatus('success');
    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus('error');
    }
  };

  const handleRemoveFile = () => {
    setUploadStatus('idle');
    setUploadedFileName(null);
    setUploadedFileText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, currentSession?.messages.length]);

  useEffect(() => {
    // Reset textarea height on change
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && uploadStatus !== 'success') return;
    
    // Check if currently sending to avoid double submission
    const lastMsg = currentSession?.messages[currentSession.messages.length - 1];
    if (lastMsg && lastMsg.status === 'sending') return;

    const attachment = uploadStatus === 'success' && uploadedFileName 
      ? { name: uploadedFileName, text: uploadedFileText || '' } 
      : undefined;

    onSendMessage(prompt || `Analyze attached file: ${uploadedFileName}`, attachment);
    setPrompt('');

    // Reset upload status
    setUploadStatus('idle');
    setUploadedFileName(null);
    setUploadedFileText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyMessageText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#2f3032] bg-[#131314]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#1e1f20] active:bg-zinc-800 border border-[#2f3032] rounded-xl text-zinc-200 hover:text-white transition-all text-sm font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span>{selectedModel}</span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModelDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsModelDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 bg-[#1e1f20] border border-[#2f3032] rounded-2xl shadow-xl z-20 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`flex flex-col w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        selectedModel === model 
                          ? 'bg-zinc-800 text-white font-medium' 
                          : 'hover:bg-zinc-850 text-zinc-300'
                      }`}
                    >
                      <span>{model}</span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        {model === 'Gemini 1.5 Flash' && 'Fast and lightweight for everyday tasks'}
                        {model === 'Gemini 1.5 Pro' && 'Complex reasoning and heavy-duty tasks'}
                        {model === 'Gemini 2.0 Experimental' && 'Next generation preview with advanced capabilities'}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-zinc-200">Workspace User</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Local Server Active
            </span>
          </div>
          <img
            src="https://api.dicebear.com/7.x/bottts/svg?seed=GeminiDev"
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full border border-zinc-700 bg-blue-500"
          />
        </div>
      </header>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 scroll-smooth pb-32">
        {!currentSession || currentSession.messages.length === 0 ? (
          /* Empty Chat Area / Welcome Screen */
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center pt-8 md:pt-16 text-center">
            {/* Logo Sparkle */}
            <div className="mb-6 p-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full animate-bounce duration-1000">
              <Sparkles className="w-10 h-10 text-blue-400 fill-blue-400 pulse-glow" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-2">
              <span className="gemini-gradient-text font-bold">Gem - Zoo Guide 🦁</span>
            </h1>
            <h2 className="text-xl md:text-3xl font-medium text-zinc-400 mb-8">
              What animal would you like to learn about today?
            </h2>

            {/* Suggestions */}
            <SuggestionCards onSelectSuggestion={(text) => setPrompt(text)} />
          </div>
        ) : (
          /* Messages List */
          <div className="max-w-3xl mx-auto space-y-8">
            {currentSession.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div 
                  key={message.id} 
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Model avatar on left */}
                  {!isUser && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center shrink-0 border border-zinc-800 shadow-sm mt-0.5">
                      <Sparkles className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}

                  {/* Message bubble wrapper */}
                  <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`rounded-2xl px-5 py-3.5 text-sm sm:text-base ${
                        isUser 
                          ? 'bg-[#2e3032] text-white rounded-tr-sm' 
                          : 'bg-transparent text-zinc-100'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      ) : message.status === 'sending' ? (
                        /* Pulsing shimmer skeleton for thinking status */
                        <div className="space-y-3.5 w-64 md:w-96 py-2">
                          <div className="h-4 bg-zinc-800 rounded-full w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-zinc-800 rounded-full w-full animate-pulse"></div>
                          <div className="h-4 bg-zinc-800 rounded-full w-5/6 animate-pulse"></div>
                        </div>
                      ) : (
                        /* Beautiful formatted output */
                        <MessageContent content={message.content} />
                      )}
                    </div>

                    {/* Action buttons (only for model responses that are complete) */}
                    {!isUser && message.status === 'complete' && (
                      <div className="flex items-center gap-3 mt-2.5 ml-2 text-zinc-500">
                        <button
                          onClick={() => copyMessageText(message.content, message.id)}
                          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User avatar on right */}
                  {isUser && (
                    <img
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=GeminiDev"
                      alt="User"
                      className="w-9 h-9 rounded-full bg-blue-500 border border-zinc-700 p-0.5 object-cover shrink-0 mt-0.5"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent pt-6 pb-4 px-4 sticky-footer z-15">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Hidden File Input for PDF */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
          />

          {/* Upload Status Badge */}
          {uploadStatus !== 'idle' && (
            <div className="flex items-center justify-between bg-[#1e1f20] border border-[#2f3032] rounded-xl px-4 py-2 text-xs text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2">
                {uploadStatus === 'uploading' && (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                {uploadStatus === 'success' && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
                {uploadStatus === 'error' && (
                  <X className="w-4 h-4 text-rose-500" />
                )}
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{uploadedFileName}</span>
                {uploadStatus === 'uploading' && <span className="text-zinc-500">Uploading...</span>}
                {uploadStatus === 'success' && <span className="text-emerald-400 font-semibold">Ready</span>}
                {uploadStatus === 'error' && <span className="text-rose-400 font-semibold">Upload failed</span>}
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input Box Container */}
          <form 
            onSubmit={handleSubmit}
            className="flex items-end gap-2 bg-[#1e1f20] border border-[#2f3032] hover:border-zinc-700 focus-within:border-zinc-600 rounded-3xl p-2.5 transition-all duration-200"
          >
            {/* PDF Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === 'uploading'}
              className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Upload PDF document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Image Attachment (Mocked) */}
            <button
              type="button"
              className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0"
              title="Upload image (mock)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Microphone/Voice Input (Mocked) */}
            <button
              type="button"
              className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0"
              title="Voice typing (mock)"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Prompt Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedModel}...`}
              className="flex-1 bg-transparent border-0 outline-none text-[#e3e3e3] placeholder-zinc-500 text-sm sm:text-base py-2.5 px-2 resize-none max-h-48 scrollbar-thin overflow-y-auto leading-relaxed"
              style={{ height: 'auto' }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!prompt.trim() && uploadStatus !== 'success') || (currentSession?.messages[currentSession.messages.length - 1]?.status === 'sending')}
              className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
                prompt.trim() || uploadStatus === 'success'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'text-zinc-600 bg-zinc-800/50 cursor-not-allowed'
              }`}
              title="Send prompt"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </form>

          {/* Bottom Fine Print Disclaimer */}
          <p className="text-[11px] text-zinc-500 text-center px-4 leading-normal select-none">
            Gemini may display inaccurate info, including about people, so double-check its responses. 
            <a 
              href="https://support.google.com/gemini?p=privacy_notice" 
              target="_blank" 
              rel="noreferrer" 
              className="text-zinc-400 hover:text-blue-400 ml-1 inline-flex items-center gap-0.5"
            >
              Your privacy & Gemini Apps
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
