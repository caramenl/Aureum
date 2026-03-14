import React from 'react';
import { ArrowRight, Sun, ShieldCheck } from 'lucide-react';

export default function Home({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="min-h-screen bg-white font-sans text-[#003366]">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FFD200] rounded-xl flex items-center justify-center shadow-md">
            <Sun className="w-6 h-6 text-[#003366]" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic">Aureum</span>
        </div>
        <button onClick={onNavigate} className="px-8 py-3 bg-[#003366] text-white rounded-full font-bold hover:bg-[#002244] transition-all text-sm shadow-lg">
          Internal Access
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-12 grid lg:grid-cols-2 gap-20">
        <div className="space-y-10 animate-in slide-in-from-left duration-700">
          <h1 className="text-8xl font-black leading-[0.9] tracking-tighter uppercase italic">
            Audit <br /> <span className="text-[#FFD200]">Faster.</span> <br /> <span className="text-slate-200">Decide</span> Better.
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
            Proprietary clinical intelligence for Sun Life. Automating the complex world of prior authorizations.
          </p>
          <button onClick={onNavigate} className="group bg-[#003366] text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-blue-900/20">
            Launch Workspace <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
        
        <div className="relative flex items-center justify-center animate-in fade-in zoom-in duration-1000">
           <div className="absolute inset-0 bg-gradient-to-br from-[#FFD200]/20 to-transparent rounded-[60px] blur-3xl" />
           <div className="bg-white p-12 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,51,102,0.15)] border border-slate-100 z-10 w-full max-w-md">
              <div className="space-y-6">
                 <div className="flex gap-2"><div className="h-2 w-8 bg-[#FFD200] rounded-full"/><div className="h-2 w-4 bg-slate-100 rounded-full"/></div>
                 <div className="h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                    <ShieldCheck className="w-12 h-12 text-slate-200" />
                    <div className="h-2 w-24 bg-slate-100 rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}