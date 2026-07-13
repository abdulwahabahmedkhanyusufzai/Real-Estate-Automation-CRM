import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { LeadInbox } from './components/LeadInbox';
import { SettingsModal, HelpModal } from './components/Modals';
import type { ChatSession, GeminiModel, Message, Lead } from './types';
import { Menu, Settings } from 'lucide-react';
import IntegrationsManager from './components/IntegrationsManager';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('Gemma Model');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [user, setUser] = useState<{ id: number; username: string } | null>(() => {
    const stored = localStorage.getItem('pixxi_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    return null;
  });

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Determine active view based on current path
  const activeView: 'chat' | 'leads' | 'settings' = (() => {
    if (currentPath === '/chat') return 'chat';
    if (currentPath === '/settings' || currentPath.startsWith('/integrations')) return 'settings';
    return 'leads'; // Default/Fallback to leads for '/' or '/leads'
  })();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  // Redirect logic based on auth status and current url path
  useEffect(() => {
    if (user) {
      // If logged in and on auth pages or root, redirect to leads
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
        Promise.resolve().then(() => navigate('/leads'));
      }
    } else {
      // If logged out and trying to access internal routes, redirect to landing page '/'
      if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register') {
        Promise.resolve().then(() => navigate('/'));
      }
    }
  }, [user, currentPath]);

  const userId = user ? `user_${user.username}` : '';
  const LOCAL_STORAGE_KEY = user ? `pixxi_crm_chats_${user.username}` : 'pixxi_crm_chats_v1';


  // Load chats from localStorage on mount/user change
  useEffect(() => {
    if (!user) return;

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
        Promise.resolve().then(() => {
          setSessions(hydrated);
          if (hydrated.length > 0) {
            setCurrentSessionId(hydrated[0].id);
          } else {
            setCurrentSessionId(null);
          }
        });
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    } else {
      // Seed with an initial welcome chat session matching index.html setup
      const seedSession: ChatSession = {
        id: 'seed-1',
        title: 'pixxi CRM AI Welcome',
        model: 'Gemma Model',
        createdAt: new Date(),
        messages: [
          {
            id: 'm-seed-model',
            role: 'model',
            content: `Welcome to pixxi CRM! I'm your AI lead qualification specialist. Paste a WhatsApp chat, input portal templates, or upload lead emails, and I will extract budgets, locations, bedrooms, and urgency for you instantly. How can I assist you with your real estate pipeline today? 🏢`,
            timestamp: new Date(),
            status: 'complete'
          }
        ]
      };
      Promise.resolve().then(() => {
        setSessions([seedSession]);
        setCurrentSessionId(seedSession.id);
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([seedSession]));
    }
  }, [user, LOCAL_STORAGE_KEY]);

  // Handle window resizing
  useEffect(() => {
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
    if (currentSessionId && userId) {
      const sessionUrl = `/api/apps/production_agent/users/${userId}/sessions/${currentSessionId}`;
      fetch(sessionUrl)
        .then(res => {
          if (res.status === 404) {
            // Session does not exist, initialize it
            return fetch(sessionUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ state: { user_type: "web_ui_user" } })
            });
          }
          return res;
        })
        .catch(err => console.error('Error auto-initializing session:', err));
    }
  }, [currentSessionId, userId]);

  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pixxi_user');
    setSessions([]);
    setCurrentSessionId(null);
    navigate('/login');
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

  const handleQualifyLead = (lead: Lead) => {
    navigate('/chat');
    const promptMessage = `Help me analyze and qualify this real estate lead:
- Client Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Budget: ${lead.budget}
- Preferred Area: ${lead.area}
- Property Type: ${lead.propertyType}
- Urgency: ${lead.urgency}
- AI Intent Score: ${lead.leadScore}

Can you give me a summary profile and recommend next steps for this client?`;

    // Start a new chat session for this lead
    setCurrentSessionId(null);
    handleSendMessage(promptMessage);
  };

  if (!user) {
    if (currentPath === '/login') {
      return (
        <Auth
          key="login"
          mode="login"
          navigate={navigate}
          onAuthSuccess={(authenticatedUser) => {
            setUser(authenticatedUser);
            localStorage.setItem('pixxi_user', JSON.stringify(authenticatedUser));
            navigate('/');
          }}
        />
      );
    }
    if (currentPath === '/register') {
      return (
        <Auth
          key="register"
          mode="register"
          navigate={navigate}
          onAuthSuccess={(authenticatedUser) => {
            setUser(authenticatedUser);
            localStorage.setItem('pixxi_user', JSON.stringify(authenticatedUser));
            navigate('/');
          }}
        />
      );
    }
    return <LandingPage navigate={navigate} />;
  }



  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        openHelpModal={() => setIsHelpOpen(true)}
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'chat') navigate('/chat');
          else if (view === 'leads') navigate('/leads');
          else if (view === 'settings') navigate('/settings');
        }}
        user={user}
        onLogout={handleLogout}
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
          onToggleView={() => navigate('/chat')}
          onQualifyLead={handleQualifyLead}
        />
      ) : (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 transition-colors duration-300 font-sans overflow-y-auto animate-fade-in-up">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors duration-200 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col text-left">
                <h1 className="text-lg font-black tracking-tight flex items-center gap-2 select-none text-slate-900">
                  <span className="p-1.5 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] text-white rounded-lg flex items-center justify-center shadow-sm">
                    <Settings className="w-4 h-4" />
                  </span>
                  <span className="font-extrabold text-slate-900">pixxi</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 ml-1">Settings</span>
                </h1>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-400">Integrations Control Panel</span>
              </div>
            </div>
          </header>

          <IntegrationsManager userId={user?.id} />
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
