import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { LeadInbox } from './components/LeadInbox';
import { SettingsModal, HelpModal } from './components/Modals';
import type { ChatSession, GeminiModel, Message } from './types';
import { Menu } from 'lucide-react';
import IntegrationsManager from './components/IntegrationsManager';

const LOCAL_STORAGE_KEY = 'gemini_clone_chats';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('Gemma Model');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'leads' | 'settings'>('leads');

  // Generate / retrieve a stable user ID for session tracking
  const [userId] = useState(() => {
    const stored = localStorage.getItem('gemini_user_id');
    if (stored) return stored;
    const newId = 'web_user_' + Math.floor(Math.random() * 10000);
    localStorage.setItem('gemini_user_id', newId);
    return newId;
  });

  // Load chats from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatSession[];
        // Convert timestamp strings back to Date objects
        const hydrated = parsed.map(session => {
          let model: GeminiModel = 'Gemma Model';
          if (session.model === 'RAG n8n Agent') {
            model = 'RAG n8n Agent';
          }
          return {
            ...session,
            model,
            createdAt: new Date(session.createdAt),
            messages: session.messages.map(m => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          };
        });
        setSessions(hydrated);
        if (hydrated.length > 0) {
          setCurrentSessionId(hydrated[0].id);
        }
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    } else {
      // Seed with an initial welcome chat session matching index.html setup
      const seedSession: ChatSession = {
        id: 'seed-1',
        title: 'Gem - Zoo Tour Guide',
        model: 'Gemma Model',
        createdAt: new Date(),
        messages: [
          {
            id: 'm-seed-model',
            role: 'model',
            content: `Hi there! I'm Gem, your zoo tour guide! What animal would you like to learn about today? 🦒`,
            timestamp: new Date(),
            status: 'complete'
          }
        ]
      };
      setSessions([seedSession]);
      setCurrentSessionId(seedSession.id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([seedSession]));
    }

    // Auto collapse sidebar on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync active sessions to backend when selected
  useEffect(() => {
    if (currentSessionId) {
      fetch(`/api/apps/production_agent/users/${userId}/sessions/${currentSessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: { user_type: "web_ui_user" } })
      }).catch(err => console.error('Error auto-initializing session:', err));
    }
  }, [currentSessionId, userId]);

  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    // On mobile, close sidebar after clicking new chat
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSetSelectedModel = (model: GeminiModel) => {
    setSelectedModel(model);
    if (currentSessionId) {
      const updated = sessions.map(session => {
        if (session.id === currentSessionId) {
          return { ...session, model };
        }
        return session;
      });
      saveSessionsToStorage(updated);
    }
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      setSelectedModel(session.model);
    }
    // On mobile, close sidebar after selecting
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessionsToStorage(updated);
    
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setSelectedModel(updated[0].model);
      } else {
        setCurrentSessionId(null);
      }
    }
  };

  const handleSendMessage = async (content: string, attachment?: { name: string; text?: string }) => {
    const userMessage: Message = {
      id: `m-usr-${Date.now()}`,
      role: 'user',
      content: attachment ? `${content}\n\n📎 Attached PDF: ${attachment.name}` : content,
      timestamp: new Date(),
      status: 'complete'
    };

    const modelPlaceholderMessage: Message = {
      id: `m-mod-${Date.now()}`,
      role: 'model',
      content: '',
      timestamp: new Date(Date.now() + 10),
      status: 'sending'
    };

    let updatedSessions = [...sessions];
    let activeSessionId = currentSessionId;
    let isNewSession = false;

    if (!activeSessionId) {
      isNewSession = true;
      // Create new session
      const truncatedTitle = content.split(' ').slice(0, 4).join(' ') + (content.split(' ').length > 4 ? '...' : '');
      activeSessionId = `s-${Date.now()}`;
      const newSession: ChatSession = {
        id: activeSessionId,
        title: truncatedTitle || 'New Chat',
        model: selectedModel,
        createdAt: new Date(),
        messages: [userMessage, modelPlaceholderMessage]
      };
      updatedSessions = [newSession, ...updatedSessions];
      setCurrentSessionId(activeSessionId);
      saveSessionsToStorage(updatedSessions);
    } else {
      // Append to current session
      updatedSessions = sessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, userMessage, modelPlaceholderMessage]
          };
        }
        return session;
      });
      saveSessionsToStorage(updatedSessions);
    }

    try {
      if (isNewSession) {
        // Initialize backend session first
        await fetch(`/api/apps/production_agent/users/${userId}/sessions/${activeSessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: { user_type: "web_ui_user" } })
        });
      }

      let agentReply = "Sorry, I couldn't understand the format.";

      if (selectedModel === 'RAG n8n Agent') {
        // Chatting with the document using n8n chat-lead webhook
        const userEmail = localStorage.getItem('gemini_user_email') || 'abdulwahabyusufzai72@gmail.com';
        const response = await fetch('https://n8n.automationdev.app/webhook/chat-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: userEmail,
            message: content
          })
        });

        if (!response.ok) {
          throw new Error(`Webhook chat-lead failed: ${response.statusText}`);
        }

        try {
          const data = await response.json();
          if (data) {
            if (typeof data === 'string') {
              agentReply = data;
            } else if (data.response) {
              agentReply = data.response;
            } else if (data.output) {
              agentReply = data.output;
            } else if (data.text) {
              agentReply = data.text;
            } else if (data.message) {
              agentReply = data.message;
            } else if (Array.isArray(data) && data[0]) {
              const first = data[0];
              agentReply = first.output || first.response || first.text || JSON.stringify(first);
            } else {
              agentReply = JSON.stringify(data);
            }
          }
        } catch {
          agentReply = await response.text();
        }
      } else {
        // Standard chat using local Ollama model
        let promptText = content;
        if (attachment) {
          promptText = `${content}\n\n[Attached Document: ${attachment.name}]\n${attachment.text || '(No text extracted)'}`;
        }

        const response = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_name: 'production_agent',
            user_id: userId,
            session_id: activeSessionId,
            new_message: { role: 'user', parts: [{ text: promptText }] }
          })
        });

        const data = await response.json();
        
        if (Array.isArray(data)) {
          const lastEvent = data[data.length - 1];
          if (lastEvent.content && lastEvent.content.parts) {
            agentReply = lastEvent.content.parts[0].text;
          }
        } else if (data.content && data.content.parts) {
          agentReply = data.content.parts[0].text;
        }
      }

      setSessions(prevSessions => {
        const updated = prevSessions.map(session => {
          if (session.id === activeSessionId) {
            const messagesWithResponse = session.messages.map(msg => {
              if (msg.id === modelPlaceholderMessage.id) {
                return {
                  ...msg,
                  content: agentReply,
                  status: 'complete' as const,
                  timestamp: new Date()
                };
              }
              return msg;
            });
            return {
              ...session,
              messages: messagesWithResponse
            };
          }
          return session;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      console.error('API execution error:', error);
      setSessions(prevSessions => {
        const updated = prevSessions.map(session => {
          if (session.id === activeSessionId) {
            const messagesWithResponse = session.messages.map(msg => {
              if (msg.id === modelPlaceholderMessage.id) {
                return {
                  ...msg,
                  content: 'Sorry, I lost connection to the server! 🔌',
                  status: 'error' as const,
                  timestamp: new Date()
                };
              }
              return msg;
            });
            return {
              ...session,
              messages: messagesWithResponse
            };
          }
          return session;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#e3e3e3]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        openSettingsModal={() => setIsSettingsOpen(true)}
        openHelpModal={() => setIsHelpOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main panel - conditionally render Chat Area, Lead Inbox, or Integrations Settings Page */}
      {activeView === 'chat' ? (
        <ChatArea
          currentSession={currentSession}
          onSendMessage={handleSendMessage}
          selectedModel={selectedModel}
          setSelectedModel={handleSetSelectedModel}
          isSidebarOpen={sidebarOpen}
          setIsSidebarOpen={setSidebarOpen}
        />
      ) : activeView === 'leads' ? (
        <LeadInbox
          isSidebarOpen={sidebarOpen}
          setIsSidebarOpen={setSidebarOpen}
          onToggleView={() => setActiveView('chat')}
        />
      ) : (
        <div className="flex-1 overflow-y-auto bg-[#131314]">
          <div className="flex items-center justify-between p-4 border-b border-[#2f3032] lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-white">Settings</span>
            <div className="w-9" />
          </div>
          <IntegrationsManager />
        </div>
      )}

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />

      {/* Mobile Sidebar overlay backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-xs transition-opacity"
        />
      )}
    </div>
  );
}

export default App;
