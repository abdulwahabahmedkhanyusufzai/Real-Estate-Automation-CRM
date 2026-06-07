import React from 'react';
import { X, HelpCircle, ExternalLink, Moon, ToggleRight } from 'lucide-react';


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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#1e1f20] border border-[#2f3032] rounded-3xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-400" />
            <span>Settings</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Section: User Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">User Profile</h3>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">User Email (for n8n Webhook)</label>
              <input 
                type="email" 
                value={email}
                onChange={handleEmailChange}
                placeholder="email@example.com"
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-700 focus:border-zinc-650 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition-all"
              />
              <p className="text-[10px] text-zinc-500">This email is sent to n8n when chatting with an uploaded document.</p>
            </div>
          </div>

          {/* Section: General */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">General</h3>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
              <div>
                <p className="text-sm font-medium text-white">Dark theme</p>
                <p className="text-xs text-zinc-500">Enable modern dark mode interface</p>
              </div>
              <button className="text-blue-400 cursor-pointer">
                <ToggleRight className="w-10 h-10" />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-zinc-850">
              <div>
                <p className="text-sm font-medium text-white">Strict Type-Checking Simulator</p>
                <p className="text-xs text-zinc-500">Run client validation with TypeScript settings</p>
              </div>
              <button className="text-blue-400 cursor-pointer">
                <ToggleRight className="w-10 h-10" />
              </button>
            </div>
          </div>

          {/* Section: AI Configuration */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Configuration</h3>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">Mock LLM Response Delay (ms)</label>
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-700">
                <option value="1000">1.0 seconds (Fast)</option>
                <option value="2000">2.0 seconds (Realistic)</option>
                <option value="3000">3.0 seconds (Heavy Thinking)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">Default Temperature</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="flex-1 accent-blue-500" />
                <span className="text-xs font-mono text-zinc-400">0.7</span>
              </div>
            </div>
          </div>

          {/* Section: Storage & Environment */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System & Storage</h3>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-zinc-400">Environment</span>
              <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20">Vite + React-TS</span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-zinc-400">Tailwind Engine</span>
              <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs border border-blue-500/20">Tailwind CSS v4.0</span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-zinc-400">Local Storage Usage</span>
              <span className="font-mono text-zinc-300">Active (Saves chats)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-[#2c2d30] border-t border-zinc-800">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-full text-sm transition-colors cursor-pointer"
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#1e1f20] border border-[#2f3032] rounded-3xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span>Help & FAQ</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* FAQ 1 */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-white">What is this project?</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              This is a high-fidelity frontend clone of Google Gemini. It is fully built using React, 
              TypeScript (strict typing), and the next-generation Tailwind CSS v4 framework.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-white">How do I query different topics?</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              You can type anything in the chat input. For specific demo content, try asking about:
              <span className="block mt-1 font-mono text-xs text-blue-400">
                - "what is react" (Framework details)<br />
                - "python web scraper" (Scraper code snippet)<br />
                - "tokyo itinerary" (Travel guide)<br />
                - "quantum computing" (Superposition/qubit details)
              </span>
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-white">Are my chats saved?</h4>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Yes, chat history is automatically saved to your browser's Local Storage, so you can leave 
              and come back right where you left off.
            </p>
          </div>

          <div className="border-t border-zinc-800 my-4" />

          {/* Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Useful Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
              <a 
                href="https://gemini.google.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Google Gemini</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://tailwindcss.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Tailwind CSS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-[#2c2d30] border-t border-zinc-800">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-full text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
