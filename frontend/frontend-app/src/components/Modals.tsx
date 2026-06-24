import React from 'react';
import { X, HelpCircle, ExternalLink, Sun, ToggleRight } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = React.useState(() => {
    return localStorage.getItem('gemini_user_email') || 'abdulwahabyusufzai72@gmail.com';
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    localStorage.setItem('gemini_user_email', val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sun className="w-5 h-5 text-emerald-500" />
            <span>Settings</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Section: User Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">User Profile</h3>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 pl-1">User Email (for n8n Webhook)</label>
              <input 
                type="email" 
                value={email}
                onChange={handleEmailChange}
                placeholder="email@example.com"
                className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#01cb65] focus:ring-2 focus:ring-emerald-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
              />
              <p className="text-[10px] text-slate-400 pl-1">This email is sent to n8n when chatting with an uploaded document.</p>
            </div>
          </div>

          {/* Section: General */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">General</h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Light theme</p>
                <p className="text-xs text-slate-500">Enable modern light mode interface</p>
              </div>
              <button className="text-emerald-500 cursor-pointer">
                <ToggleRight className="w-10 h-10" />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Strict Type-Checking Simulator</p>
                <p className="text-xs text-slate-500">Run client validation with TypeScript settings</p>
              </div>
              <button className="text-emerald-500 cursor-pointer">
                <ToggleRight className="w-10 h-10" />
              </button>
            </div>
          </div>

          {/* Section: AI Configuration */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">AI Configuration</h3>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 pl-1">Mock LLM Response Delay (ms)</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#01cb65]">
                <option value="1000">1.0 seconds (Fast)</option>
                <option value="2000">2.0 seconds (Realistic)</option>
                <option value="3000">3.0 seconds (Heavy Thinking)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 pl-1">Default Temperature</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="flex-1 accent-emerald-500 cursor-pointer" />
                <span className="text-xs font-mono font-bold text-slate-500">0.7</span>
              </div>
            </div>
          </div>

          {/* Section: Storage & Environment */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">System & Storage</h3>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-slate-500 pl-1">Environment</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">Vite + React-TS</span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-slate-500 pl-1">Tailwind Engine</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">Tailwind CSS v4.0</span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-slate-500 pl-1">Local Storage Usage</span>
              <span className="font-mono text-slate-600">Active (Saves chats)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#01cb65] hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export const HelpModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <span>Help & FAQ</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* FAQ 1 */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-sm font-bold text-slate-900">What is this project?</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              This is a high-fidelity real estate lead management dashboard. It uses a local Gemma-powered AI engine to qualify incoming leads from WhatsApp, Property Finder, and email inboxes automatically.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-sm font-bold text-slate-900">How do I query different topics?</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You can ask the AI agent about property specifications, lead details, or submit data streams. For specific demo queries, try:
              <span className="block mt-1 font-mono text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                - "Qualify WhatsApp: 3b townhouse dxb hills budget 3.5m urgent"<br />
                - "Extract requirements from CEO investment email"<br />
                - "Summarize average price ranges for villas in Dubai Hills"<br />
                - "How do I configure email IMAP settings?"
              </span>
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-sm font-bold text-slate-900">Are my chats saved?</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Yes, your chat sessions are automatically synchronized locally in your browser's Local Storage, letting you resume conversations at any time.
            </p>
          </div>

          <div className="border-t border-slate-100 my-4" />

          {/* Links */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Useful Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 pl-1">
              <a 
                href="https://cloud.google.com/agent-development-kit" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-slate-950 transition-colors"
              >
                <span>Google ADK Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://n8n.io" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-slate-950 transition-colors"
              >
                <span>n8n Automation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-slate-950 transition-colors col-span-2"
              >
                <span>Supabase Database</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#01cb65] hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
