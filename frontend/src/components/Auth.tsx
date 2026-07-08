import React, { useState } from 'react';
import { Sparkles, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'register';
  navigate: (path: string) => void;
  onAuthSuccess: (user: { id: number; username: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, navigate, onAuthSuccess }) => {
  const isLogin = mode === 'login';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Username is required');
      triggerShake();
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      triggerShake();
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (data.status === 'success' && data.user) {
        onAuthSuccess(data.user);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    if (isLogin) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-white font-sans overflow-hidden">
      {/* Left panel: Product Showcase (visible on lg screens and up) */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-12 bg-slate-50 border-r border-slate-100 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#01cb65]/5 blur-[100px] animate-pulse-subtle" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#00aed0]/5 blur-[100px] animate-float" />
        </div>
        
        {/* Top: Branding */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] text-white rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight select-none">
            pixxi
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60 ml-1">CRM</span>
          </span>
        </div>

        {/* Center: Showcase Content */}
        <div className="relative z-10 max-w-lg my-auto space-y-8">
          <div className="space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100/40">Gemma-Powered Assistant</span>
            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight select-none">
              Dubai's Elite <br />
              <span className="bg-gradient-to-r from-[#01cb65] to-[#00aed0] bg-clip-text text-transparent">AI Lead Qualifier</span>
            </h2>
            <p className="text-slate-500 leading-relaxed text-base">
              Say goodbye to manual lead qualification. Paste raw WhatsApp chats, portal template receipts, or emails, and let our fine-tuned Gemma model extract budgets, areas, and intent scoring instantly.
            </p>
          </div>

          {/* Simulated CRM Preview Card */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 shadow-xl shadow-slate-100/40 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider select-none">Live Capture Channel</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md select-none">WhatsApp</span>
            </div>
            
            <div className="text-left text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-150/50 text-slate-550 italic leading-relaxed">
              "Hi, looking for a 4 bed villa in dxb hills. Budget around 3m. Let me know asap."
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Budget</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">AED 3,000,000</div>
              </div>
              <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Location</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Dubai Hills</div>
              </div>
              <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Property</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">4-Bedroom Villa</div>
              </div>
              <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Urgency</div>
                <div className="text-xs font-bold text-emerald-650 mt-0.5 flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> High
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="relative z-10 text-xs text-slate-400 font-medium text-left select-none">
          Powered by Google Gemma 3.5 & Google ADK v2
        </div>
      </div>

      {/* Right panel: Login/Register Form (Full width on small, 5/12 on large) */}
      <div className="w-full lg:w-5/12 min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-12 xl:px-20 relative bg-white">
        {/* Decorative Grid on right side */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a02_1px,transparent_1px),linear-gradient(to_bottom,#0f172a02_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        
        {/* Subtle background blob just on right side */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#00aed0]/5 to-[#9b72cb]/5 blur-[80px] pointer-events-none" />

        {/* Mobile Header (hidden on large screens) */}
        <div className="lg:hidden flex items-center gap-2 mb-10 absolute top-8 left-6">
          <div className="p-2 bg-gradient-to-tr from-[#01cb65] to-[#00aed0] text-white rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">pixxi</span>
        </div>

        {/* Form Container */}
        <div className={`relative z-10 w-full max-w-md mx-auto ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              {isLogin ? 'Sign in to pixxi' : 'Create an account'}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isLogin ? 'Enter your details below to access your real estate portal.' : 'Register below to start qualifying leads instantly.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 focus:border-emerald-500/50 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm focus:shadow-[0_0_20px_rgba(1,203,101,0.04)]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 focus:border-emerald-500/50 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm focus:shadow-[0_0_20px_rgba(1,203,101,0.04)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5 text-left animate-fade-in-up">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 focus:border-emerald-500/50 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 text-sm focus:shadow-[0_0_20px_rgba(1,203,101,0.04)]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#01cb65] to-[#00aed0] hover:brightness-105 disabled:brightness-75 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {isLogin ? (
                <>
                  Don't have an account? <span className="text-[#00aed0] hover:underline font-bold">Register here</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-[#01cb65] hover:underline font-bold">Log in here</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
