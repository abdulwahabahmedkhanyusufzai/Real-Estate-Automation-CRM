import React, { useState } from 'react';
import { Sparkles, ArrowRight, MessageSquare, Mail, Layers, CheckCircle2, ChevronRight, Zap, Target, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'portal'>('whatsapp');
  const [playgroundInput, setPlaygroundInput] = useState(
    "Hi, looking for a 4 bed villa in dxb hills. Budget around 3m. Let me know asap."
  );
  const [extractedData, setExtractedData] = useState({
    budget: "AED 3M",
    area: "Dubai Hills",
    propertyType: "Villa",
    bedrooms: 4,
    urgency: "High"
  });
  const [isParsing, setIsParsing] = useState(false);

  const sampleInputs = {
    whatsapp: "Hi, looking for a 4 bed villa in dxb hills. Budget around 3m. Let me know asap.",
    email: "Dear Agent,\n\nI am writing to inquire about premium real estate options in Dubai Marina. I am looking for a 2 bedroom apartment. My budget is AED 1.5M max.\n\nBest regards,\nSarah",
    portal: "Inquiry for property REF-88392. Client message: Interested in the luxury penthouse in MBR City. Budget is around 5m. Please call urgently."
  };

  const handleTabChange = (tab: 'whatsapp' | 'email' | 'portal') => {
    setActiveTab(tab);
    setPlaygroundInput(sampleInputs[tab]);
    triggerMockParse(sampleInputs[tab]);
  };

  const triggerMockParse = (inputVal: string) => {
    setIsParsing(true);
    setTimeout(() => {
      const cleaned = inputVal.toLowerCase();
      const extracted = {
        budget: "Not Specified",
        area: "Not Specified",
        propertyType: "Not Specified",
        bedrooms: "Not Specified" as string | number,
        urgency: "Normal"
      };

      if (cleaned.includes("3m") || cleaned.includes("3 million")) extracted.budget = "AED 3M";
      else if (cleaned.includes("1.5m") || cleaned.includes("1.5 million")) extracted.budget = "AED 1.5M";
      else if (cleaned.includes("5m") || cleaned.includes("5 million")) extracted.budget = "AED 5M";

      if (cleaned.includes("dxb hills") || cleaned.includes("dubai hills")) extracted.area = "Dubai Hills";
      else if (cleaned.includes("marina")) extracted.area = "Dubai Marina";
      else if (cleaned.includes("mbr city") || cleaned.includes("mbrc")) extracted.area = "MBR City";

      if (cleaned.includes("villa")) extracted.propertyType = "Villa";
      else if (cleaned.includes("apartment") || cleaned.includes("apt")) extracted.propertyType = "Apartment";
      else if (cleaned.includes("penthouse")) extracted.propertyType = "Penthouse";

      if (cleaned.includes("4 bed") || cleaned.includes("4-bedroom")) extracted.bedrooms = 4;
      else if (cleaned.includes("2 bed") || cleaned.includes("2-bedroom")) extracted.bedrooms = 2;
      else if (cleaned.includes("3 bed") || cleaned.includes("3-bedroom")) extracted.bedrooms = 3;

      if (cleaned.includes("urgent") || cleaned.includes("asap") || cleaned.includes("now")) extracted.urgency = "High";

      setExtractedData(extracted);
      setIsParsing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen bg-[#ffffff] text-slate-800 font-sans overflow-x-hidden relative">
      {/* Background soft gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[70%] rounded-full bg-gradient-to-tr from-[#01cb65]/5 to-[#00aed0]/5 blur-[120px] animate-pulse-subtle" />
        <div className="absolute top-[40%] -right-[10%] w-[70%] h-[60%] rounded-full bg-gradient-to-br from-[#9b72cb]/5 to-[#d96570]/5 blur-[120px] animate-float" />
        <div className="absolute -bottom-[20%] left-[10%] w-[70%] h-[60%] rounded-full bg-gradient-to-tr from-[#00aed0]/4 to-[#01cb65]/4 blur-[130px] animate-pulse-subtle" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a02_1px,transparent_1px),linear-gradient(to_bottom,#0f172a02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10">
            <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight select-none">
            pixxi
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60 ml-1">CRM</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#playground" className="hover:text-slate-900 transition-colors">Try Playground</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">Workflow</a>
        </nav>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:brightness-105 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/5 transition-all cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 animate-fade-in-up">
          <Zap className="w-3.5 h-3.5" /> Introducing Gemma 3.5 Fine-Tuning
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight select-none">
          Qualify Your Dubai Real Estate Leads <br />
          <span className="bg-gradient-to-r from-[#01cb65] to-[#00aed0] bg-clip-text text-transparent">Instantly & Automatically</span>
        </h1>

        <p className="text-slate-550 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          The ultimate multi-channel qualification system. Parse messy WhatsApp chats, portal messages, and emails into structured property search parameters using locally-run LLM models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:brightness-105 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group transition-all cursor-pointer text-sm"
          >
            Make Your Leads Automated Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a 
            href="#playground"
            className="w-full sm:w-auto px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            Try Live Demo
          </a>
        </div>
      </section>

      {/* Interactive Playground Section */}
      <section id="playground" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Interactive AI Playground</h2>
          <p className="text-sm text-slate-500">Test how the parser normalizes raw communication channels in real-time.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/50 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Playground Left: Input */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            {/* Source selectors */}
            <div className="flex gap-2 border-b border-slate-100 pb-4">
              <button
                onClick={() => handleTabChange('whatsapp')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'whatsapp' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                onClick={() => handleTabChange('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'email' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Inbox
              </button>
              <button
                onClick={() => handleTabChange('portal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'portal' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Portal Form
              </button>
            </div>

            {/* Input box */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Raw Message Payload</label>
              <textarea
                value={playgroundInput}
                onChange={(e) => {
                  setPlaygroundInput(e.target.value);
                  triggerMockParse(e.target.value);
                }}
                rows={4}
                className="w-full p-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500/50 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm focus:shadow-[0_0_20px_rgba(1,203,101,0.04)] resize-none"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>Try typing keywords like 3m, Marina, penthouse, or urgent.</span>
            </div>
          </div>

          {/* Playground Right: Live Output Extraction */}
          <div className="md:col-span-5 bg-slate-50/70 border-l border-slate-200/50 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider select-none">AI Extraction Results</span>
                {isParsing ? (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold select-none">Parsing...</span>
                ) : (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold select-none">Ready</span>
                )}
              </div>

              {/* Parsed fields */}
              <div className="space-y-3.5 text-left">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Budget Target</span>
                  <div className={`text-sm font-bold text-slate-800 mt-0.5 transition-opacity ${isParsing ? 'opacity-40' : 'opacity-100'}`}>
                    {extractedData.budget}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Preferred Area</span>
                  <div className={`text-sm font-bold text-slate-800 mt-0.5 transition-opacity ${isParsing ? 'opacity-40' : 'opacity-100'}`}>
                    {extractedData.area}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Property Type</span>
                  <div className={`text-sm font-bold text-slate-800 mt-0.5 transition-opacity ${isParsing ? 'opacity-40' : 'opacity-100'}`}>
                    {extractedData.propertyType}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Bedrooms</span>
                  <div className={`text-sm font-bold text-slate-800 mt-0.5 transition-opacity ${isParsing ? 'opacity-40' : 'opacity-100'}`}>
                    {extractedData.bedrooms}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Urgency Status</span>
                  <div className={`text-sm font-bold mt-0.5 flex items-center gap-1.5 transition-opacity ${isParsing ? 'opacity-40' : 'opacity-100'} ${
                    extractedData.urgency === 'High' ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${extractedData.urgency === 'High' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
                    {extractedData.urgency}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/register')}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] hover:brightness-105 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Qualify Leads in App <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00aed0]">Engine Specs</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Built For High-Velocity Sales</h2>
          <p className="text-slate-500">Every feature is designed to cut deal response latency down to zero.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#01cb65]/10 to-[#01cb65]/20 text-[#01cb65] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">Omnichannel Normalization</h3>
            <p className="text-sm text-slate-550 leading-relaxed">
              Accept WhatsApp, portal templates, or email. Clean out greetings, Pleasantries, disclaimers, and convert local real estate slang (like "3m" to AED 3M) automatically.
            </p>
          </div>

          <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00aed0]/10 to-[#00aed0]/20 text-[#00aed0] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">Local LLM Inference</h3>
            <p className="text-sm text-slate-550 leading-relaxed">
              Powered by Google Gemma models running locally on our GPU stack, ensuring low-latency parsing and absolute privacy for client query content.
            </p>
          </div>

          <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#9b72cb]/10 to-[#9b72cb]/20 text-[#9b72cb] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">Secured SQLite Storage</h3>
            <p className="text-sm text-slate-550 leading-relaxed">
              Isolated user workspace storage schemas ensure your real estate contacts, conversations, and leads are safely locked behind secure logins.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Workflow Section */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#01cb65]">System Blueprint</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">The 3-Step Lifecycle</h2>
          <p className="text-slate-500">How leads navigate from raw inputs to your qualified CRM funnel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="space-y-4 text-left relative">
            <div className="text-6xl font-black text-slate-100 select-none">01</div>
            <h3 className="text-lg font-bold text-slate-900">Ingest Lead</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paste conversations or allow automatic email/WhatsApp listeners to capture new, unqualified incoming messages.
            </p>
          </div>

          <div className="space-y-4 text-left relative">
            <div className="text-6xl font-black text-slate-100 select-none">02</div>
            <h3 className="text-lg font-bold text-slate-900">Analyze & Extract</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemma structures critical criteria: budgets, locations, bedrooms, and urgency parameters, while calculating priority scoring.
            </p>
          </div>

          <div className="space-y-4 text-left relative">
            <div className="text-6xl font-black text-slate-100 select-none">03</div>
            <h3 className="text-lg font-bold text-slate-900">Action & Close</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The qualified profile loads directly into the CRM panel, ready for instant agent reachout and deal closing.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Call-To-Action (CTA) Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-28 pt-8">
        <div className="bg-gradient-to-tr from-slate-50 to-slate-100/50 border border-slate-200/50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-xl shadow-slate-100/20">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ready to double your pipeline qualification rate?</h2>
          <p className="text-sm text-slate-550 max-w-md mx-auto leading-relaxed">
            Create an account in less than 30 seconds and experience local, GPU-powered Gemma leads qualifying.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:brightness-105 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 py-8 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <div>&copy; 2026 pixxi CRM. All rights reserved.</div>
        <div className="flex gap-6">
          <span>Ollama API</span>
          <span>Google ADK Framework</span>
          <span>React SPA</span>
        </div>
      </footer>
    </div>
  );
};
