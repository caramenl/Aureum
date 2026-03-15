"use client";
import React from 'react';
import { ArrowLeft, Zap, CheckCircle, AlertTriangle, Copy, Shield } from 'lucide-react';

export default function Remediation({ result, onBack }: any) {
  const unmet = result?.requirements?.filter((r: any) => !r.is_met && (r.is_applicable !== false)) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 text-[#003366] font-sans">
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] transition-all shadow-sm"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Audit
        </button>
        <div className="flex items-center gap-4">
          {result?.status && (
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border animate-in fade-in slide-in-from-right-4 ${
              result.status === 'APPROVED' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              Verdict: {result.status?.startsWith('COMPLETED') ? 'DENIED' : result.status}
            </div>
          )}
          <Shield className="w-5 h-5 text-[#FFD200]" />
          <h1 className="text-xl font-black uppercase italic tracking-tight">Remediation <span className="text-slate-300 font-light">Intelligence</span></h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="bg-[#003366] p-10 rounded-[40px] shadow-2xl relative overflow-hidden border-t-8 border-[#FFD200]">
          <div className="relative z-10">
            <h2 className="text-white text-3xl font-black uppercase italic mb-4 leading-none">Denial Prevention Strategy</h2>
            <p className="text-white/60 text-sm font-medium max-w-2xl">
              We've identified {unmet.length} critical gaps in the patient's records. Implementing the bridge actions below will significantly decrease the risk of insurance denial.
            </p>
          </div>
          <Zap className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
        </div>

        <div className="grid gap-6">
          {unmet.map((req: any, i: number) => (
            <div key={i} className="bg-white rounded-[30px] p-8 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 transition-all hover:shadow-md" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Risk Found: {req.requirement_id || `REQ-${i + 1}`}
                  </span>
                </div>
                <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter">
                  Status: Unmet
                </div>
              </div>

              <h3 className="text-lg font-bold mb-6 text-slate-700 leading-snug">
                {req.description}
              </h3>

              {req.bridge_action ? (
                <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-100 group relative">
                  <div className="flex items-center gap-2 text-[#003366] font-black text-[10px] uppercase mb-3 opacity-40">
                    <Zap className="w-3 h-3 text-[#FFD200]" /> Recommended Bridge Action
                  </div>
                  <p className="text-sm font-bold text-[#003366] pr-10 leading-relaxed">
                    {req.bridge_action}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(req.bridge_action);
                      alert("Copied to clipboard!");
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-[#003366] hover:border-[#FFD200] transition-all shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="italic text-slate-400 text-xs">No specific action generated. Review clinical context.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
