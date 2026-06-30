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
  Sparkles,
  Briefcase
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  openHelpModal: () => void;
  activeView: 'chat' | 'leads' | 'settings';
  setActiveView: (view: 'chat' | 'leads' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  openHelpModal,
  activeView,
  setActiveView
}) => {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  return (
    <aside 
      className={`fixed lg:relative z-30 h-full flex flex-col justify-between bg-white border-r border-slate-200/80 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col pt-4 px-3">
        {/* Menu Hamburger */}
        <div className="flex items-center h-12 mb-6 pl-1">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {isOpen && (
            <div className="ml-3 flex items-center gap-1.5 font-bold text-slate-900 tracking-tight select-none animate-fade-in-up">
              <span className="p-1.5 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] text-white rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="font-extrabold text-slate-900">pixxi</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 ml-1">CRM</span>
            </div>
          )}
        </div>

        {/* Navigation Selector */}
        <div className="flex flex-col gap-1.5 mb-6">
          <button
            onClick={() => setActiveView('leads')}
            className={`flex items-center gap-3 transition-all duration-300 ease-out cursor-pointer ${
              isOpen 
                ? 'px-4 py-2.5 rounded-xl w-full justify-start' 
                : 'p-3 rounded-xl w-12 h-12 justify-center mx-auto'
            } ${
              activeView === 'leads' 
                ? 'bg-emerald-50 text-[#01cb65] border border-emerald-100/60 font-semibold shadow-xs' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-850 border border-transparent'
            }`}
            title="Lead Inbox"
          >
            <Briefcase className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-115" />
            {isOpen && <span className="text-sm font-medium animate-fade-in-up">Lead Inbox</span>}
          </button>

          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-3 transition-all duration-300 ease-out cursor-pointer ${
              isOpen 
                ? 'px-4 py-2.5 rounded-xl w-full justify-start' 
                : 'p-3 rounded-xl w-12 h-12 justify-center mx-auto'
            } ${
              activeView === 'chat' 
                ? 'bg-emerald-50 text-[#01cb65] border border-emerald-100/60 font-semibold shadow-xs' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-850 border border-transparent'
            }`}
            title="AI Chat Assistant"
          >
            <Sparkles className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-115" />
            {isOpen && <span className="text-sm font-medium animate-fade-in-up">Chat Agent</span>}
          </button>
        </div>

        {/* New Chat Button & Recent chats (only visible when in chat view) */}
        {activeView === 'chat' ? (
          <>
            <button
              onClick={onNewChat}
              className={`flex items-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-900 border border-slate-200 transition-all duration-200 cursor-pointer ${
                isOpen 
                  ? 'px-4 py-3 rounded-full w-full justify-start' 
                  : 'p-3 rounded-full w-12 h-12 justify-center mx-auto'
              }`}
              title="New chat"
            >
              <Plus className="w-5 h-5 text-slate-500" />
              {isOpen && <span className="text-sm font-medium">New chat</span>}
            </button>

            {isOpen && (
              <div className="mt-6 flex flex-col h-[calc(100vh-380px)] overflow-y-auto">
                <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Recent Chats
                </span>
                <div className="flex flex-col gap-1 px-1">
                  {sessions.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-slate-400 italic text-left">No recent chats</p>
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
                              ? 'bg-slate-100 text-slate-900 font-medium' 
                              : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <button
                            onClick={() => onSelectSession(session.id)}
                            className="flex items-center gap-3 px-4 py-2.5 w-full text-left overflow-hidden rounded-full cursor-pointer"
                          >
                            <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#01cb65]' : 'text-slate-400'}`} />
                            <span className="text-sm truncate pr-6">{session.title}</span>
                          </button>
                          
                          {(hoveredSessionId === session.id || isSelected) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="absolute right-3 p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
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
          </>
        ) : (
          isOpen && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-150 text-left animate-in fade-in duration-300">
              <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#01cb65]" />
                <span>CRM Dashboard</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Manage incoming real estate leads, assign agents, qualify budgets, and track closure progress.
              </p>
            </div>
          )
        )}

        {/* Collapsed view history icon placeholder */}
        {!isOpen && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div 
              className="p-3 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
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
          className={`flex items-center gap-3 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all duration-300 ease-out cursor-pointer ${
            isOpen ? 'px-4 py-3 w-full justify-start' : 'p-3 w-12 h-12 justify-center mx-auto'
          }`}
          title="Help"
        >
          <HelpCircle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          {isOpen && <span className="text-sm font-medium animate-fade-in-up">Help</span>}
        </button>

        <button 
          onClick={() => setActiveView('settings')}
          className={`flex items-center gap-3 transition-all duration-300 ease-out cursor-pointer ${
            isOpen ? 'px-4 py-3 w-full justify-start' : 'p-3 w-12 h-12 justify-center mx-auto'
          } ${
            activeView === 'settings' 
              ? 'bg-emerald-50 text-[#01cb65] border border-emerald-100/60 font-semibold shadow-xs' 
              : 'hover:bg-slate-50 text-slate-500 hover:text-slate-850 border border-transparent'
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          {isOpen && <span className="text-sm font-medium animate-fade-in-up">Settings</span>}
        </button>

        <div className="border-t border-slate-100 my-2" />

        {/* User profile */}
        <div 
          className={`flex items-center gap-3 hover:bg-slate-50 rounded-full transition-all duration-200 ${
            isOpen ? 'p-2' : 'p-1 justify-center'
          }`}
        >
          <img 
            src="https://api.dicebear.com/7.x/bottts/svg?seed=GeminiDev" 
            alt="User Avatar" 
            className="w-9 h-9 rounded-full bg-emerald-500 border border-slate-200 p-0.5 object-cover"
          />
          {isOpen && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-bold text-slate-900 truncate">Developer Workspace</span>
              <span className="text-[10px] text-slate-400 truncate">active_dev@workspace</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
