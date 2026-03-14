"use client";
import React from 'react';
import { Activity, Terminal, LogOut, ShieldCheck, Zap } from 'lucide-react';

export default function Audit({ 
  patientId, setPatientId, setPolicyFile, setPatientFile, 
  startAudit, isProcessing, logs, result, onLogout, logEndRef 
}: any) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 text-[#003366] font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFD200] rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-[#003366]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Workspace <span className="text-slate-300 font-light">Aureum</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Session: HIPAA-P12</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-all shadow-sm">
          <LogOut className="w-3 h-3" /> Terminate Session
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10">
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-8 flex items-center gap-2 italic">
                <Terminal className="w-3 h-3 text-[#FFD200]"/> Configuration
            </h3>
            <div className="space-y-6">
              <input 
                type="text" 
                value={patientId} 
                onChange={(e) => setPatientId(e.target.value)} 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-[#FFD200] outline-none font-bold text-sm" 
              />
              <div className="space-y-4">
                 <input type="file" onChange={(e) => setPolicyFile(e.target.files?.[0])} className="text-[10px] w-full" />
                 <input type="file" onChange={(e) => setPatientFile(e.target.files?.[0])} className="text-[10px] w-full" />
              </div>
              <button 
                onClick={startAudit} 
                disabled={isProcessing} 
                className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#002244] shadow-xl disabled:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? "Processing..." : "Initiate Global Audit"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 min-h-[600px] flex flex-col relative overflow-hidden">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-10 italic">Intelligence Layer Stream</h3>
             
             <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px]">
               {logs.map((log: any, i: number) => (
                 <div key={i} className="flex gap-4 items-center animate-in slide-in-from-left-4">
                   <div className="w-1 h-1 rounded-full bg-[#FFD200]" />
                   <p className="font-mono text-[10px] font-bold text-[#003366]/40 tracking-tight">
                     [{new Date().toLocaleTimeString([], {hour12: false, second: '2-digit'})}] 
                     <span className="text-[#003366] uppercase italic font-sans ml-4 font-black">{log.msg}</span>
                   </p>
                 </div>
               ))}
               <div ref={logEndRef} />
             </div>

              {/* THE SUMMARY CARD */}
              {result && result.justification && (
                <div className="space-y-6">
                   <div className="mt-10 p-8 bg-[#003366] rounded-[30px] shadow-[0_20px_50px_rgba(0,51,102,0.3)] border-t-4 border-[#FFD200] animate-in slide-in-from-bottom-8 duration-700">
                      <h4 className="text-white font-black uppercase italic text-lg tracking-tight mb-4">Audit Result Finalized</h4>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 italic">
                        <p className="text-white/90 text-sm leading-relaxed font-medium">
                          "{result.justification}"
                        </p>
                      </div>
                   </div>

                   {result.requirements && result.requirements.some((r: any) => !r.is_met) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {result.requirements.filter((r: any) => !r.is_met && r.bridge_action).map((req: any, i: number) => (
                          <div key={i} className="bg-white border-l-4 border-rose-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded uppercase font-mono tracking-tighter">
                                Denial Risk: {req.requirement_id || `REQ-${i + 1}`}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mb-4 line-clamp-2">
                              {req.description}
                            </p>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 relative group">
                              <div className="flex items-center gap-2 text-amber-700 font-bold text-[10px] uppercase mb-1">
                                <Zap className="w-3 h-3" /> Bridge Action
                              </div>
                              <p className="text-xs text-amber-900 leading-tight pr-8">
                                {req.bridge_action}
                              </p>
                              <button
                                onClick={() => {
                                  if (req.bridge_action) {
                                    navigator.clipboard.writeText(req.bridge_action);
                                    alert("Action copied to clipboard!");
                                  }
                                }}
                                className="absolute right-2 top-2 p-1 text-amber-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy to clipboard"
                              >
                                <Zap className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}