"use client";
import React from 'react';
import { FileUp, CheckCircle2, Zap, Loader2, ShieldCheck, FileText } from 'lucide-react';

export default function Audit({ 
  patientId, setPatientId, policyFile, setPolicyFile, patientFile, setPatientFile, 
  startAudit, isProcessing, logs, result, setView 
}: any) {
  
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-[#003366] uppercase italic tracking-tight">Audit Initialization</h2>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Global Intelligence Layer // P12 Secure</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-12 space-y-10">
        {/* Patient Input */}
        <div className="max-w-md mx-auto">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 block text-center">Patient Identifier</label>
          <input 
            type="text" 
            value={patientId} 
            onChange={(e) => setPatientId(e.target.value)} 
            className="w-full text-center p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-[#FFD200] outline-none font-black text-[#003366] text-xl" 
          />
        </div>

        {/* Simplified Upload Buttons */}
        <div className="flex justify-center gap-16">
          <div className="flex flex-col items-center gap-4">
            <label className="cursor-pointer group relative">
              <input type="file" className="hidden" onChange={(e) => setPolicyFile(e.target.files?.[0])} />
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${policyFile ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300 hover:bg-[#FFD200] hover:text-[#003366]'}`}>
                {policyFile ? <CheckCircle2 size={32} /> : <FileText size={32} />}
              </div>
              {policyFile && <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 className="text-emerald-500 w-4 h-4" /></div>}
            </label>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Policy Bulletin</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <label className="cursor-pointer group relative">
              <input type="file" className="hidden" onChange={(e) => setPatientFile(e.target.files?.[0])} />
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${patientFile ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300 hover:bg-[#FFD200] hover:text-[#003366]'}`}>
                {patientFile ? <CheckCircle2 size={32} /> : <FileUp size={32} />}
              </div>
              {patientFile && <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 className="text-emerald-500 w-4 h-4" /></div>}
            </label>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Medical Record</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 flex justify-center">
          <button 
            onClick={startAudit} 
            disabled={isProcessing} 
            className="group relative px-12 py-5 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl disabled:bg-slate-100 disabled:text-slate-300 transition-all overflow-hidden"
          >
            <div className="relative z-10 flex items-center gap-3">
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="text-[#FFD200]" />}
              {isProcessing ? "Analyzing Core..." : "Initiate Audit"}
            </div>
            {!isProcessing && <div className="absolute inset-0 bg-[#FFD200] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
            {!isProcessing && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 text-[#003366]">Execute Engine</div>}
          </button>
        </div>
      </div>

      {/* Loading State / Results Section */}
      {isProcessing && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-[#FFD200] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-[#FFD200] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-[#FFD200] rounded-full animate-bounce" />
          </div>
          <p className="text-[#003366] font-black uppercase italic text-xs tracking-widest animate-pulse">
            {logs[logs.length - 1]?.msg || "Syncing with LangGraph Core..."}
          </p>
        </div>
      )}

      {result && !isProcessing && (
        <div className="bg-[#003366] p-10 rounded-[40px] shadow-2xl border-t-8 border-[#FFD200] animate-in slide-in-from-bottom-10 duration-700">
           <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
               <ShieldCheck className="text-[#FFD200] w-8 h-8" />
               <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter">Evaluation Finalized</h3>
             </div>
             <button 
               onClick={() => setView('solutions')}
               className="bg-[#FFD200] text-[#003366] px-8 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-transform"
             >
               Explore Solutions Hub
             </button>
           </div>
           <p className="text-white/80 font-medium leading-relaxed italic border-l-4 border-white/10 pl-6 py-2">
             "{result.justification}"
           </p>
        </div>
      )}
    </div>
  );
}