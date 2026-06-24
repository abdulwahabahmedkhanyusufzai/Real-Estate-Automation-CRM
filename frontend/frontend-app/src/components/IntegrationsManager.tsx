import React, { useState } from 'react';
import { Check, Copy, Mail, MessageSquare, Building2 } from 'lucide-react';

export default function IntegrationsManager() {
  // Mock state for active connections—hook this up to Supabase later
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
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-[#e3e3e3]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Connected Channels</h1>
        <p className="text-sm text-zinc-400">Link your communication channels and property portals to activate the AI lead engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WHATSAPP CARD */}
        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${connections.whatsapp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {connections.whatsapp ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">WhatsApp Business API</h3>
            <p className="text-sm text-zinc-400 mt-1 mb-4">Ingest live chat messages directly into the AI qualification agent via Twilio or Meta webhooks.</p>
            
            {connections.whatsapp && (
              <div className="mt-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                <code className="text-xs text-zinc-300 truncate mr-2">https://n8n.pixxi.ai/webhook/wa?id=ag_771</code>
                <button 
                  onClick={() => handleCopy("https://n8n.pixxi.ai/webhook/wa?id=ag_771", "whatsapp")}
                  className="p-1.5 text-zinc-450 hover:text-white transition cursor-pointer"
                >
                  {copiedField === 'whatsapp' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setConnections({...connections, whatsapp: !connections.whatsapp})}
            className={`mt-6 w-full py-2 rounded-xl text-sm font-medium transition cursor-pointer ${connections.whatsapp ? 'border border-zinc-700 text-zinc-300 hover:bg-zinc-850' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
          >
            {connections.whatsapp ? 'Disconnect' : 'Connect Channel'}
          </button>
        </div>

        {/* PROPERTY FINDER CARD */}
        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${connections.propertyFinder ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {connections.propertyFinder ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Property Finder</h3>
            <p className="text-sm text-zinc-400 mt-1 mb-4">Synchronize official portal lead payloads directly into your broker pipelines with instant mapping.</p>
            
            {connections.propertyFinder && (
              <div className="mt-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                <code className="text-xs text-zinc-300 truncate mr-2">https://n8n.pixxi.ai/webhook/pf?id=ag_771</code>
                <button 
                  onClick={() => handleCopy("https://n8n.pixxi.ai/webhook/pf?id=ag_771", "pf")}
                  className="p-1.5 text-zinc-450 hover:text-white transition cursor-pointer"
                >
                  {copiedField === 'pf' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setConnections({...connections, propertyFinder: !connections.propertyFinder})}
            className={`mt-6 w-full py-2 rounded-xl text-sm font-medium transition cursor-pointer ${connections.propertyFinder ? 'border border-zinc-700 text-zinc-300 hover:bg-zinc-850' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
          >
            {connections.propertyFinder ? 'Disconnect' : 'Connect Portal'}
          </button>
        </div>

        {/* EMAIL INBOX CARD (IMAP FORM BASED) */}
        <div className="bg-[#1e1f20] border border-[#2f3032] rounded-2xl p-6 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email Ingestion (IMAP / Gmail)</h3>
                <p className="text-sm text-zinc-400 mt-0.5">Allow the system agent to read incoming mail streams to intercept and parse text disclosures.</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${connections.email ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {connections.email ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {!connections.email ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <input 
                type="text" 
                placeholder="IMAP Host (e.g., imap.gmail.com)" 
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                value={emailCredentials.imap}
                onChange={(e) => setEmailCredentials({...emailCredentials, imap: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Agency Email Address" 
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                value={emailCredentials.email}
                onChange={(e) => setEmailCredentials({...emailCredentials, email: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="App Password" 
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                value={emailCredentials.password}
                onChange={(e) => setEmailCredentials({...emailCredentials, password: e.target.value})}
              />
              <button 
                onClick={() => setConnections({...connections, email: true})}
                className="md:col-span-3 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition cursor-pointer"
              >
                Authenticate & Connect Mailbox
              </button>
            </div>
          ) : (
            <div className="pt-2 flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-2 text-sm text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Monitoring <strong>{emailCredentials.email || 'leads@agency.com'}</strong> asynchronously</span>
              </div>
              <button 
                onClick={() => setConnections({...connections, email: false})}
                className="text-xs font-medium text-rose-450 hover:text-rose-450 underline cursor-pointer"
              >
                Revoke Access
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
