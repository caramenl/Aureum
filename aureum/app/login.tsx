import React from 'react';
import { Sun, User, Lock } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-[45px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-12 space-y-8">
          <div className="text-center space-y-2">
            <Sun className="w-12 h-12 text-[#FFD200] mx-auto mb-4" />
            <h2 className="text-3xl font-black text-[#003366] uppercase italic tracking-tighter">Identity Check</h2>
            <p className="text-slate-400 text-sm font-medium italic">Authorized Personnel Only</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="email" required placeholder="Employee Email" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 ring-[#FFD200]/20 outline-none font-medium text-sm transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="password" required placeholder="Security Key" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 ring-[#FFD200]/20 outline-none font-medium text-sm transition-all" />
            </div>
            <button className="w-full bg-[#FFD200] text-[#003366] py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#ffe04d] transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
              Enter Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}