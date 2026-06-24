import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg className="w-6 h-6 text-[#25D366] fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.423 0 9.838-4.417 9.84-9.84.002-2.614-1.01-5.071-2.85-6.914C16.42 2.005 13.965.996 11.35.996 5.929.996 1.512 5.413 1.51 10.835c-.001 1.554.411 3.072 1.192 4.412l-.998 3.646 3.733-.979a9.78 9.78 0 001.21.34zm11.304-4.805c-.3-.15-1.774-.875-2.046-.975-.272-.1-.47-.15-.667.15-.197.3-.762.975-.934 1.175-.172.2-.343.225-.643.075-.3-.15-1.266-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.019-.463.13-.612.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.667-1.607-.914-2.203-.24-.579-.485-.5-.667-.51-.173-.008-.371-.01-.57-.01-.197 0-.518.074-.789.374-.272.3-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.2 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.726 2.02-1.429.247-.704.247-1.306.173-1.429-.074-.124-.272-.199-.572-.349z" />
  </svg>
);

const GmailIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" fill="#EA4335" />
    <path d="M22 6V14L12 20L2 14V6L12 12L22 6Z" fill="#4285F4" />
    <path d="M22 6H2L12 12L22 6Z" fill="#FBBC05" />
    <path d="M2 18V6L12 12L22 6V18H2Z" fill="#34A853" opacity="0.15" />
  </svg>
);

const PropertyFinderIcon = () => (
  <svg className="w-6 h-6 text-[#E51B24] fill-current" viewBox="0 0 24 24">
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm4 15h-2v-6H10v6H8v-7.15l4-3.6 4 3.6V18z" />
  </svg>
);

const BayutIcon = () => (
  <svg className="w-6 h-6 text-[#2A9E3A] fill-current" viewBox="0 0 24 24">
    <path d="M12 2L1 12h3v9h16v-9h3L12 2zm6 17H6v-8.15l6-5.4 6 5.4V19z M11 11h2v5h-2z" />
  </svg>
);

export default function IntegrationsManager() {
  const [connections, setConnections] = useState({
    whatsapp: true,
    propertyFinder: false,
    bayut: false,
    email: false,
  });

  const [emailCredentials, setEmailCredentials] = useState({ imap: '', email: '', password: '' });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (url: string, field: string) => {
    navigator.clipboard.writeText(url);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800 font-sans">
      <div className="text-left animate-in fade-in slide-in-from-top-3 duration-300">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Connected Channels</h2>
        <p className="text-sm text-slate-500">Link your communication channels and property portals to activate the AI lead engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch animate-in fade-in zoom-in-95 duration-500">
        
        {/* WHATSAPP CARD */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs group-hover:shadow-sm">
                <WhatsAppIcon />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.whatsapp ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {connections.whatsapp ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-md font-extrabold text-slate-900 transition-colors group-hover:text-[#01cb65]">WhatsApp API</h3>
              <p className="text-xs text-slate-500 mt-1">Ingest live chat messages directly into the AI qualification agent.</p>
            </div>
            
            {connections.whatsapp && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between transition-all duration-300 group-hover:bg-slate-100/50">
                <code className="text-[10px] text-slate-700 font-mono truncate mr-2 select-all">https://n8n.pixxi.ai/webhook/wa?id=ag_771</code>
                <button 
                  onClick={() => handleCopy("https://n8n.pixxi.ai/webhook/wa?id=ag_771", "whatsapp")}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition cursor-pointer active:scale-90"
                  title="Copy webhook URL"
                >
                  {copiedField === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-[#01cb65]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setConnections({...connections, whatsapp: !connections.whatsapp})}
            className={`mt-6 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97 ${connections.whatsapp ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs'}`}
          >
            {connections.whatsapp ? 'Disconnect' : 'Connect Channel'}
          </button>
        </div>

        {/* PROPERTY FINDER CARD */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs group-hover:shadow-sm">
                <PropertyFinderIcon />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.propertyFinder ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {connections.propertyFinder ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-md font-extrabold text-slate-900 transition-colors group-hover:text-[#E51B24]">Property Finder</h3>
              <p className="text-xs text-slate-500 mt-1">Synchronize official portal lead payloads into your broker pipelines.</p>
            </div>
            
            {connections.propertyFinder && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between transition-all duration-300 group-hover:bg-slate-100/50">
                <code className="text-[10px] text-slate-700 font-mono truncate mr-2 select-all">https://n8n.pixxi.ai/webhook/pf?id=ag_771</code>
                <button 
                  onClick={() => handleCopy("https://n8n.pixxi.ai/webhook/pf?id=ag_771", "pf")}
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
            className={`mt-6 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97 ${connections.propertyFinder ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs'}`}
          >
            {connections.propertyFinder ? 'Disconnect' : 'Connect Portal'}
          </button>
        </div>

        {/* BAYUT CARD */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs group-hover:shadow-sm">
                <BayutIcon />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.bayut ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {connections.bayut ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-md font-extrabold text-slate-900 transition-colors group-hover:text-[#2A9E3A]">Bayut Portal</h3>
              <p className="text-xs text-slate-500 mt-1">Connect your Bayut agency dashboard to capture portal leads.</p>
            </div>
            
            {connections.bayut && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between transition-all duration-300 group-hover:bg-slate-100/50">
                <code className="text-[10px] text-slate-700 font-mono truncate mr-2 select-all">https://n8n.pixxi.ai/webhook/bayut?id=ag_771</code>
                <button 
                  onClick={() => handleCopy("https://n8n.pixxi.ai/webhook/bayut?id=ag_771", "bayut")}
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
            className={`mt-6 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97 ${connections.bayut ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs'}`}
          >
            {connections.bayut ? 'Disconnect' : 'Connect Portal'}
          </button>
        </div>

        {/* EMAIL INBOX CARD */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="space-y-4 flex-grow flex flex-col">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs group-hover:shadow-sm">
                <GmailIcon />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all duration-300 ${connections.email ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {connections.email ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-md font-extrabold text-slate-900 transition-colors group-hover:text-[#EA4335]">Email Ingestion</h3>
              <p className="text-xs text-slate-500 mt-1">Interceptions of incoming mail streams to parse disclosures.</p>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              {!connections.email ? (
                <div className="space-y-2.5 pt-1">
                  <input 
                    type="text" 
                    placeholder="IMAP Host (imap.gmail.com)" 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#01cb65] focus:ring-1 focus:ring-emerald-200 transition-all placeholder-slate-400 animate-in fade-in duration-200"
                    value={emailCredentials.imap}
                    onChange={(e) => setEmailCredentials({...emailCredentials, imap: e.target.value})}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#01cb65] focus:ring-1 focus:ring-emerald-200 transition-all placeholder-slate-400 animate-in fade-in duration-200"
                    value={emailCredentials.email}
                    onChange={(e) => setEmailCredentials({...emailCredentials, email: e.target.value})}
                  />
                  <input 
                    type="password" 
                    placeholder="App Password" 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#01cb65] focus:ring-1 focus:ring-emerald-200 transition-all placeholder-slate-400 animate-in fade-in duration-200"
                    value={emailCredentials.password}
                    onChange={(e) => setEmailCredentials({...emailCredentials, password: e.target.value})}
                  />
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-left space-y-1.5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-[#01cb65] animate-pulse" />
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
              onClick={() => setConnections({...connections, email: true})}
              className="mt-6 w-full py-2 rounded-xl text-xs font-bold bg-[#01cb65] text-white hover:bg-emerald-600 shadow-xs transition-all duration-200 cursor-pointer active:scale-97"
            >
              Authenticate Mailbox
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
