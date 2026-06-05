import React, { useState } from 'react';
import type { ChatSession } from '../types';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  History, 
  Trash2,
  Sparkles
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  openSettingsModal: () => void;
  openHelpModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  openSettingsModal,
  openHelpModal
}) => {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  return (
    <aside 
      className={`fixed lg:relative z-30 h-full flex flex-col justify-between bg-[#1e1f20] border-r border-[#2f3032] transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col pt-4 px-3">
        {/* Menu Hamburger */}
        <div className="flex items-center h-12 mb-6 pl-1">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {isOpen && (
            <div className="ml-3 flex items-center gap-1.5 font-semibold text-white tracking-wide text-lg select-none">
              <Sparkles className="w-5 h-5 text-blue-400 fill-blue-400" />
              <span>Gem - Zoo Guide</span>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className={`flex items-center gap-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer ${
            isOpen 
              ? 'px-4 py-3 rounded-full w-full justify-start' 
              : 'p-3 rounded-full w-12 h-12 justify-center mx-auto'
          }`}
          title="New chat"
        >
          <Plus className="w-5 h-5 text-zinc-300" />
          {isOpen && <span className="text-sm font-medium">New chat</span>}
        </button>

        {/* Recent Chats Section */}
        {isOpen && (
          <div className="mt-8 flex flex-col h-[calc(100vh-320px)] overflow-y-auto">
            <span className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Recent
            </span>
            <div className="flex flex-col gap-1 px-1">
              {sessions.length === 0 ? (
                <p className="px-4 py-2 text-xs text-zinc-500 italic">No recent chats</p>
              ) : (
                sessions.map((session) => {
                  const isSelected = session.id === currentSessionId;
                  return (
                    <div
                      key={session.id}
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                      className={`group relative flex items-center justify-between w-full rounded-full transition-all duration-200 text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-[#2e3032] text-white' 
                          : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left overflow-hidden rounded-full cursor-pointer"
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`} />
                        <span className="text-sm truncate pr-6">{session.title}</span>
                      </button>
                      
                      {/* Delete button visible on hover */}
                      {(hoveredSessionId === session.id || isSelected) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="absolute right-3 p-1 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Collapsed view clock icon placeholder */}
        {!isOpen && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div 
              className="p-3 text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              title="Recent history"
            >
              <History className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col pb-6 px-3 gap-2">
        <button 
          onClick={openHelpModal}
          className={`flex items-center gap-3 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all duration-200 cursor-pointer ${
            isOpen ? 'px-4 py-3 w-full justify-start' : 'p-3 w-12 h-12 justify-center mx-auto'
          }`}
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Help</span>}
        </button>

        <button 
          onClick={openSettingsModal}
          className={`flex items-center gap-3 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all duration-200 cursor-pointer ${
            isOpen ? 'px-4 py-3 w-full justify-start' : 'p-3 w-12 h-12 justify-center mx-auto'
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Settings</span>}
        </button>

        <div className="border-t border-zinc-800 my-2" />

        {/* User profile */}
        <div 
          className={`flex items-center gap-3 hover:bg-zinc-800/50 rounded-full transition-all duration-200 ${
            isOpen ? 'p-2' : 'p-1 justify-center'
          }`}
        >
          <img 
            src="https://api.dicebear.com/7.x/bottts/svg?seed=GeminiDev" 
            alt="User Avatar" 
            className="w-9 h-9 rounded-full bg-blue-500 border border-zinc-700 p-0.5 object-cover"
          />
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">Developer Workspace</span>
              <span className="text-[10px] text-zinc-500 truncate">active_dev@workspace</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
