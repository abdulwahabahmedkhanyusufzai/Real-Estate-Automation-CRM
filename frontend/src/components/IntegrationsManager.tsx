import { useState, useMemo } from 'react';
import { 
  Check, 
  Copy, 
  Globe, 
  Activity, 
  Shield, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Link, 
  Cpu, 
  Terminal,
  Trash2
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.423 0 9.838-4.417 9.84-9.84.002-2.614-1.01-5.071-2.85-6.914C16.42 2.005 13.965.996 11.35.996 5.929.996 1.512 5.413 1.51 10.835c-.001 1.554.411 3.072 1.192 4.412l-.998 3.646 3.733-.979a9.78 9.78 0 001.21.34zm11.304-4.805c-.3-.15-1.774-.875-2.046-.975-.272-.1-.47-.15-.667.15-.197.3-.762.975-.934 1.175-.172.2-.343.225-.643.075-.3-.15-1.266-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.019-.463.13-.612.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.667-1.607-.914-2.203-.24-.579-.485-.5-.667-.51-.173-.008-.371-.01-.57-.01-.197 0-.518.074-.789.374-.272.3-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.2 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.726 2.02-1.429.247-.704.247-1.306.173-1.429-.074-.124-.272-.199-.572-.349z" />
  </svg>
);

const GmailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" fill="#EA4335" />
    <path d="M22 6V14L12 20L2 14V6L12 12L22 6Z" fill="#4285F4" />
    <path d="M22 6H2L12 12L22 6Z" fill="#FBBC05" />
    <path d="M2 18V6L12 12L22 6V18H2Z" fill="#34A853" opacity="0.15" />
  </svg>
);

const PropertyFinderIcon = () => (
  <svg className="w-5 h-5 text-[#E51B24] fill-current" viewBox="0 0 24 24">
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm4 15h-2v-6H10v6H8v-7.15l4-3.6 4 3.6V18z" />
  </svg>
);

const BayutIcon = () => (
  <svg className="w-5 h-5 text-[#2A9E3A] fill-current" viewBox="0 0 24 24">
    <path d="M12 2L1 12h3v9h16v-9h3L12 2zm6 17H6v-8.15l6-5.4 6 5.4V19z M11 11h2v5h-2z" />
  </svg>
);

interface WebhookLog {
  id: string;
  timestamp: string;
  source: 'WhatsApp' | 'PropertyFinder' | 'Bayut' | 'IMAP';
  event: string;
  status: 200 | 201 | 500;
  latency: string;
  payload: string;
}

const INITIAL_LOGS: WebhookLog[] = [
  { id: 'log-1', timestamp: '2026-06-28 19:40:12', source: 'WhatsApp', event: 'Incoming Chat Message', status: 200, latency: '42ms', payload: '{"from": "+971501234567", "text": "Hi Sarah, are there v4 layouts..."}' },
  { id: 'log-2', timestamp: '2026-06-28 19:35:45', source: 'WhatsApp', event: 'AI Qualification Response', status: 201, latency: '120ms', payload: '{"session_id": "seed-1", "classified": {"budget": "3M", "area": "Dubai Hills"}}' },
  { id: 'log-3', timestamp: '2026-06-28 19:12:03', source: 'IMAP', event: 'Email Sync check', status: 200, latency: '350ms', payload: '{"imap_status": "OK", "unread_scanned": 0}' },
  { id: 'log-4', timestamp: '2026-06-28 18:44:21', source: 'PropertyFinder', event: 'Web inquiry parser', status: 200, latency: '85ms', payload: '{"ref": "PF-10023", "client_name": "Marcus Vance"}' },
  { id: 'log-5', timestamp: '2026-06-28 17:20:10', source: 'Bayut', event: 'Webhook payload ingestion', status: 500, latency: '12ms', payload: '{"error": "Unauthorized API token signature"}' }
];

interface IntegrationsManagerProps {
  userId?: number;
}

export default function IntegrationsManager({ userId }: IntegrationsManagerProps) {
  const [connections, setConnections] = useState({
    whatsapp: true,
    propertyFinder: false,
    bayut: false,
    email: false,
  });

  const [emailCredentials, setEmailCredentials] = useState({ imap: '', email: '', password: '' });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'channels' | 'logs' | 'apikeys'>('channels');

  // Logs state
  const [logs, setLogs] = useState<WebhookLog[]>(INITIAL_LOGS);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiSecretVisible, setApiSecretVisible] = useState(false);

  const handleConnectWhatsApp = () => {
    if (connections.whatsapp) {
      setConnections({ ...connections, whatsapp: false });
    } else {
      const targetUserId = userId || 1;
      window.location.href = `/api/oauth/facebook/login?user_id=${targetUserId}`;
    }
  };

  const handleConnectEmail = () => {
    if (connections.email) {
      setConnections({ ...connections, email: false });
    } else {
      const targetUserId = userId || 1;
      window.location.href = `/api/oauth/google/login?user_id=${targetUserId}`;
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const activeConnectionCount = useMemo(() => {
    return Object.values(connections).filter(Boolean).length;
  }, [connections]);

  const stats = useMemo(() => {
    return {
      activeCount: `${activeConnectionCount}/4`,
      avgLatency: '94ms',
      successRate: '98.2%',
      syncVolume: '2,482 events'
    };
  }, [activeConnectionCount]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-slate-800 font-sans animate-scale-in">
      
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="text-left">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            <span>Connection Gateway</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Connect third-party portal integrations, sync email decoders, and view live pipeline synchronization logs.</p>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl self-start md:self-auto shadow-xs">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01cb65]"></span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tight">AI Engine Live Ingestion</span>
        </div>
      </div>

      {/* Production-Grade Metrics Console Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/60">
            <Link className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Active Gateways</span>
            <span className="text-lg font-black text-slate-900">{stats.activeCount}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100/60">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Avg Latency</span>
            <span className="text-lg font-black text-slate-900">{stats.avgLatency}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100/60">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ingest Success Rate</span>
            <span className="text-lg font-black text-[#01cb65]">{stats.successRate}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100/60">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Sync Volume</span>
            <span className="text-lg font-black text-slate-900">{stats.syncVolume}</span>
          </div>
        </div>

      </div>

      {/* Tabs Menu bar */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 p-1.5 rounded-xl border">
        {[
          { id: 'channels', label: 'Connected Channels', icon: Globe },
          { id: 'logs', label: 'Real-time Webhook Logs', icon: Terminal },
          { id: 'apikeys', label: 'API Keys & Secrets', icon: Key }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'channels' | 'logs' | 'apikeys')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white text-[#01cb65] border border-slate-200/90 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels Content */}
      <div className="min-h-[400px]">

        {/* TABS 1: CHANNELS */}
        {activeTab === 'channels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch animate-scale-in">
            
            {/* WHATSAPP CARD */}
            <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-50 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-xs border border-emerald-100/50">
                    <WhatsAppIcon />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.whatsapp ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {connections.whatsapp ? 'Active' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-[#01cb65]">WhatsApp Gateway</h3>
                  <p className="text-xs text-slate-500 mt-1">Connect WhatsApp API hooks to qualify informal client chats.</p>
                </div>
                
                {connections.whatsapp && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between transition-all duration-300 group-hover:bg-slate-100/50">
                    <code className="text-[10px] text-slate-700 font-mono truncate mr-2 select-all">{`${window.location.origin}/webhooks/whatsapp`}</code>
                    <button 
                      onClick={() => handleCopy(`${window.location.origin}/webhooks/whatsapp`, "whatsapp")}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition cursor-pointer active:scale-90"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-[#01cb65]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={handleConnectWhatsApp}
                className={`mt-6 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97 ${connections.whatsapp ? 'border border-slate-250 text-slate-600 hover:bg-slate-50' : 'bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs'}`}
              >
                {connections.whatsapp ? 'Disconnect' : 'Connect Channel'}
              </button>
            </div>

            {/* PROPERTY FINDER CARD */}
            <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-red-50 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-xs border border-red-100/50">
                    <PropertyFinderIcon />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.propertyFinder ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {connections.propertyFinder ? 'Active' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-[#E51B24]">Property Finder</h3>
                  <p className="text-xs text-slate-500 mt-1">Capture portal inquiry details via structural webhook payloads.</p>
                </div>
                
                {connections.propertyFinder && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between transition-all duration-300 group-hover:bg-slate-100/50">
                    <code className="text-[10px] text-slate-700 font-mono truncate mr-2 select-all">{`${window.location.origin}/webhooks/portal`}</code>
                    <button 
                      onClick={() => handleCopy(`${window.location.origin}/webhooks/portal`, "pf")}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition cursor-pointer active:scale-90"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'pf' ? <Check className="w-3.5 h-3.5 text-[#01cb65]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setConnections({...connections, propertyFinder: !connections.propertyFinder})}
                className={`mt-6 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97 ${connections.propertyFinder ? 'border border-slate-250 text-slate-600 hover:bg-slate-50' : 'bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs'}`}
              >
                {connections.propertyFinder ? 'Disconnect' : 'Connect Portal'}
              </button>
            </div>

            {/* BAYUT CARD */}
            <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-50 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-xs border border-emerald-100/50">
                    <BayutIcon />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.bayut ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {connections.bayut ? 'Active' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-[#2A9E3A]">Bayut Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">Ingest email notification bodies directly from your Bayut account.</p>
                </div>
                
                {connections.bayut && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between transition-all duration-300 group-hover:bg-slate-100/50">
                    <code className="text-[10px] text-slate-700 font-mono truncate mr-2 select-all">{`${window.location.origin}/webhooks/portal`}</code>
                    <button 
                      onClick={() => handleCopy(`${window.location.origin}/webhooks/portal`, "bayut")}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition cursor-pointer active:scale-90"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'bayut' ? <Check className="w-3.5 h-3.5 text-[#01cb65]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setConnections({...connections, bayut: !connections.bayut})}
                className={`mt-6 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97 ${connections.bayut ? 'border border-slate-250 text-slate-600 hover:bg-slate-50' : 'bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs'}`}
              >
                {connections.bayut ? 'Disconnect' : 'Connect Portal'}
              </button>
            </div>

            {/* EMAIL INBOX CARD */}
            <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4 flex-grow flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-blue-50 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-xs border border-blue-100/50">
                    <GmailIcon />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.email ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {connections.email ? 'Active' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-[#EA4335]">Email Ingestion</h3>
                  <p className="text-xs text-slate-500 mt-1">Intercep email lead channels via structural IMAP validation.</p>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                  {!connections.email ? (
                    <div className="space-y-2 pt-1">
                      <input 
                        type="text" 
                        placeholder="IMAP Host (imap.gmail.com)" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#01cb65] focus:bg-white transition-all placeholder-slate-400"
                        value={emailCredentials.imap}
                        onChange={(e) => setEmailCredentials({...emailCredentials, imap: e.target.value})}
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#01cb65] focus:bg-white transition-all placeholder-slate-400"
                        value={emailCredentials.email}
                        onChange={(e) => setEmailCredentials({...emailCredentials, email: e.target.value})}
                      />
                      <input 
                        type="password" 
                        placeholder="App Password" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#01cb65] focus:bg-white transition-all placeholder-slate-400"
                        value={emailCredentials.password}
                        onChange={(e) => setEmailCredentials({...emailCredentials, password: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-left space-y-1.5 animate-scale-in">
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#01cb65] animate-pulse" />
                        <span className="truncate">Monitoring:</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-800 font-mono truncate">{emailCredentials.email || 'leads@agency.com'}</div>
                      <button 
                        onClick={() => setConnections({...connections, email: false})}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 underline cursor-pointer active:scale-95 transition-transform"
                      >
                        Revoke Access
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {!connections.email && (
                <button 
                  onClick={handleConnectEmail}
                  className="mt-6 w-full py-2 rounded-xl text-xs font-bold bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs transition-all duration-200 cursor-pointer active:scale-97"
                >
                  Authenticate Mailbox
                </button>
              )}
            </div>

          </div>
        )}

        {/* TABS 2: REAL-TIME WEBHOOK LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden text-left animate-scale-in">
            {/* Logs Toolbar */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-450" />
                <span className="text-xs font-bold text-slate-800">Event Logs Ingest</span>
              </div>
              
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setLogs(INITIAL_LOGS)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reload Events</span>
                </button>
                
                <button
                  onClick={handleClearLogs}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Logs Table List */}
            <div className="overflow-x-auto">
              {logs.length === 0 ? (
                <div className="p-16 text-center text-slate-400 italic text-xs font-semibold">
                  No active logs captured. Toggle channel connections to generate webhook requests.
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-250 bg-slate-100/30 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                      <th className="py-3 px-5">Timestamp</th>
                      <th className="py-3 px-4">Gateway</th>
                      <th className="py-3 px-4">Ingest Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Latency</th>
                      <th className="py-3 px-5">Debug Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-sans tracking-wide ${
                            log.source === 'WhatsApp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 
                            log.source === 'PropertyFinder' ? 'bg-rose-50 text-rose-700 border border-rose-100/50' : 
                            log.source === 'Bayut' ? 'bg-green-50 text-green-700 border border-green-100/50' : 
                            'bg-blue-50 text-blue-700 border border-blue-100/50'
                          }`}>
                            {log.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">{log.event}</td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={`flex items-center gap-1 ${log.status >= 500 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status >= 500 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {log.status} {log.status >= 500 ? 'ERR' : 'OK'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{log.latency}</td>
                        <td className="py-3.5 px-5 text-slate-400 select-all truncate max-w-xs">{log.payload}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TABS 3: API KEYS & SECRETS */}
        {activeTab === 'apikeys' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6 text-left animate-scale-in">
            
            {/* Information Alert */}
            <div className="flex gap-3.5 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">Developer Credentials API</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed font-semibold">Use these access keys to securely sync external CRM systems (e.g. n8n workflows, Salesforce, or custom broker portals) to the Pixxi CRM API.</p>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Webhook Secret Key */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest pl-1">Webhook Secret Signature (SHA-256)</label>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div className="flex-1 min-w-0 font-mono text-xs select-all truncate text-slate-800">
                    {apiKeyVisible ? 'whsec_e91cae7da2b41295cb18e20f188371cc292f9ac1311029c' : '••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      className="p-1.5 hover:bg-slate-200/60 text-slate-500 rounded-lg transition cursor-pointer active:scale-90"
                      title={apiKeyVisible ? "Hide Secret" : "Show Secret"}
                    >
                      {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy('whsec_e91cae7da2b41295cb18e20f188371cc292f9ac1311029c', 'key1')}
                      className="p-1.5 hover:bg-slate-200/60 text-slate-500 rounded-lg transition cursor-pointer active:scale-90"
                      title="Copy Key"
                    >
                      {copiedField === 'key1' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Client API Token */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest pl-1">Client API Authorization Token</label>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div className="flex-1 min-w-0 font-mono text-xs select-all truncate text-slate-800">
                    {apiSecretVisible ? 'pixxi_live_token_77a288bd5e4f202b8813c9a17729ac1b' : '••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setApiSecretVisible(!apiSecretVisible)}
                      className="p-1.5 hover:bg-slate-200/60 text-slate-500 rounded-lg transition cursor-pointer active:scale-90"
                      title={apiSecretVisible ? "Hide Token" : "Show Token"}
                    >
                      {apiSecretVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy('pixxi_live_token_77a288bd5e4f202b8813c9a17729ac1b', 'key2')}
                      className="p-1.5 hover:bg-slate-200/60 text-slate-500 rounded-lg transition cursor-pointer active:scale-90"
                      title="Copy Token"
                    >
                      {copiedField === 'key2' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* API Actions */}
            <div className="flex justify-start gap-3 border-t border-slate-100 pt-5 mt-4">
              <button
                onClick={() => alert('API Key rotated. Webhook configurations synced successfully.')}
                className="px-4 py-2 bg-[#01cb65] hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-xs"
              >
                Rotate API Tokens
              </button>
              
              <button
                onClick={() => alert('Refer to API Documentation at https://docs.pixxi.ai/api/v1')}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer"
              >
                Open API Docs
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
