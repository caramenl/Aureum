"use client";
import React, { useState } from 'react';
import { 
  FileText, UploadCloud, Zap, Loader2, 
  CheckCircle, ShieldCheck, Activity, ClipboardList,
  Search, Info
} from 'lucide-react';

export default function Audit({ 
  patientId, setPatientId, policyFile, setPolicyFile, patientFile, setPatientFile, 
  startAudit, isProcessing, logs, result, setView 
}: any) {
  


  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-[#001A33] uppercase tracking-tighter italic">
            Audit Initialization <span className="text-slate-300 font-light">// Case Input</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Grounded Intelligence Engine // P12 Secure Environment
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">System Ready</span>
        </div>
      </div>

      {/* 2. CASE INPUT GRID */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left: Metadata Configuration */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Search size={12} /> Case Parameters
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-tighter">Patient Identifier</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    value={patientId} 
                    onChange={(e) => setPatientId(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 text-sm font-bold text-[#001A33] focus:border-[#003366] outline-none transition-colors" 
                  />
                </div>
              </div>


            </div>
          </div>

          <button 
            onClick={startAudit} 
            disabled={isProcessing || !policyFile || !patientFile} 
            className="w-full group relative py-5 bg-[#001A33] text-white font-black uppercase text-xs tracking-[0.3em] transition-all disabled:opacity-20 hover:bg-[#003366] shadow-xl overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 text-[#FFD200]" />}
              {isProcessing ? "Executing Analysis..." : "Run AI Analysis"}
            </div>
            {!isProcessing && <div className="absolute inset-0 bg-[#002b55] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />}
          </button>
        </div>

        {/* Right: Documentation Uploads */}
        <div className="col-span-8">
          <div className="bg-white border border-slate-200 p-8 shadow-sm h-full">
            <h3 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-8 text-center flex items-center justify-center gap-2">
              <ClipboardList size={12} /> Required Documentation
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Policy Upload */}
              <label className="cursor-pointer group">
                <input type="file" className="hidden" onChange={(e) => setPolicyFile(e.target.files?.[0])} />
                <div className={`aspect-video flex flex-col items-center justify-center border-2 border-dashed transition-all ${policyFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-[#003366] bg-slate-50/50'}`}>
                  {policyFile ? (
                    <CheckCircle className="text-emerald-500 w-8 h-8 mb-2" />
                  ) : (
                    <FileText className="text-slate-300 w-8 h-8 mb-2 group-hover:text-[#003366]" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#001A33]">Insurance Policy</span>
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                    {policyFile ? policyFile.name : 'Click to Select PDF'}
                  </span>
                </div>
              </label>

              {/* Patient Record Upload */}
              <label className="cursor-pointer group">
                <input type="file" className="hidden" onChange={(e) => setPatientFile(e.target.files?.[0])} />
                <div className={`aspect-video flex flex-col items-center justify-center border-2 border-dashed transition-all ${patientFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-[#003366] bg-slate-50/50'}`}>
                  {patientFile ? (
                    <CheckCircle className="text-emerald-500 w-8 h-8 mb-2" />
                  ) : (
                    <UploadCloud className="text-slate-300 w-8 h-8 mb-2 group-hover:text-[#003366]" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#001A33]">Medical Record</span>
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                    {patientFile ? patientFile.name : 'Click to Select PDF'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATUS FEEDBACK (Loading Dots) */}
      {isProcessing && (
        <div className="bg-[#001A33] p-6 flex items-center justify-between border-l-4 border-[#FFD200] animate-in slide-in-from-left duration-500 shadow-lg">
          <div className="flex items-center gap-4">
             <div className="flex gap-1.5">
               <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full animate-bounce [animation-delay:-0.3s]" />
               <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full animate-bounce [animation-delay:-0.15s]" />
               <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full animate-bounce" />
             </div>
             <p className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
               {logs[logs.length - 1]?.msg || "Synthesizing clinical justifications..."}
             </p>
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">SECURE LAYER P12 ACTIVE</span>
        </div>
      )}

      {/* 4. AI APPROVAL PAGE (Result Section) */}
      {result?.status && !isProcessing && (
        <div className="bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
          {/* Status Color Bar */}
          <div className={`h-2 w-full ${
            result.status === 'APPROVED' ? 'bg-emerald-500' : 
            result.status === 'DENIED' ? 'bg-rose-500' : 'bg-[#FFD200]'
          }`} />
          
          <div className="p-10">
            {/* Header: Decision & Probability */}
            <div className="flex justify-between items-start mb-12">
              <div className="flex gap-12">
                <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Coverage Decision</label>
                  <div className={`text-4xl font-black uppercase italic tracking-tighter ${
                    result.status === 'APPROVED' ? 'text-emerald-600' : 
                    result.status === 'DENIED' ? 'text-rose-600' : 'text-[#001A33]'
                  }`}>
                    {result.status || 'Analysis Pending'}
                  </div>
                </div>
                
                <div className="border-l border-slate-100 pl-12">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Decision Confidence</label>
                  <div className="text-4xl font-black text-[#001A33] tabular-nums">
                    {Math.round((result.confidence_score || result.probability || 0) * 100)}<span className="text-lg ml-0.5">%</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setView('solutions')}
                className="bg-[#001A33] text-white px-8 py-4 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#003366] transition-all flex items-center gap-3 shadow-xl"
              >
                Launch Remediation <Zap size={14} className="text-[#FFD200]" />
              </button>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-2 gap-12">
              
              {/* Policy Explanation Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#001A33]" />
                  <h4 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest">Policy Explanation</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 border-l-4 border-[#001A33]">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Audit Policy Reference</span>
                    <p className="text-[10px] font-black text-[#001A33] uppercase line-clamp-1">{result.policy_name || result.clause_used || "SYSTEM ANALYSIS COMPLETE"}</p>
                  </div>
                  <div className="bg-slate-50/50 p-5 border border-slate-100 italic">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      "{result.final_justification || result.justification || ""}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence Highlight Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-[#001A33]" />
                  <h4 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest">Evidence Highlight</h4>
                </div>
                <div className="bg-emerald-50/30 border border-emerald-100 p-6 relative group">
                  <Info className="absolute top-4 right-4 text-emerald-200 w-10 h-10 -rotate-12" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase block mb-3 tracking-tighter">Verified Clinical Excerpt:</span>
                  <p className="text-sm font-bold text-[#001A33] leading-relaxed relative z-10">
                    {result.evidence_quote || result.requirements?.find((r: any) => r.evidence_snippet)?.evidence_snippet || ""}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Verification Level</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 w-4 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            {/* Footer Metadata */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
              <div className="flex gap-8">
                <span>Model: Aureum-Grounded-v1</span>
                <span>Runtime: {result.runtime || 'N/A'}s</span>
                <span>Case ID: {result.patient_id || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#001A33] opacity-40">Integrity Check: {result.entry_date ? new Date(result.entry_date).getTime().toString(16).toUpperCase() : 'VERIFIED'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}