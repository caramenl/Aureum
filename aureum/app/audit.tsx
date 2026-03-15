"use client";
import React, { useState } from 'react';
import { 
  FileText, UploadCloud, Zap, Loader2, 
  CheckCircle, ShieldAlert, Activity, ClipboardList 
} from 'lucide-react';

export default function Audit({ 
  patientId, setPatientId, policyFile, setPolicyFile, patientFile, setPatientFile, 
  startAudit, isProcessing, logs, result, setView 
}: any) {
  
  const [procedure, setProcedure] = useState('Knee Arthroplasty');

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 animate-in fade-in duration-500">
      
      {/* Institutional Header */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-[#001A33] uppercase tracking-tighter italic">
            Case Initiation <span className="text-slate-300 font-light">// Node 01</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Grounded Intelligence Engine for Clinical Compliance
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">System Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column: Metadata & Configuration */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
              Case Parameters
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-tighter">Patient Identifier</label>
                <input 
                  type="text" 
                  value={patientId} 
                  onChange={(e) => setPatientId(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 p-3 text-sm font-bold text-[#001A33] focus:border-[#003366] outline-none transition-colors" 
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-tighter">Clinical Procedure</label>
                <select 
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 text-sm font-bold text-[#001A33] outline-none"
                >
                  <option>Knee Arthroplasty</option>
                  <option>Lumbar Fusion</option>
                  <option>MRI Brain w/ Contrast</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={startAudit} 
            disabled={isProcessing || !policyFile || !patientFile} 
            className="w-full group relative py-5 bg-[#001A33] text-white font-black uppercase text-xs tracking-[0.3em] transition-all disabled:opacity-20 hover:bg-[#003366] shadow-xl"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4 text-[#FFD200]" />}
              {isProcessing ? "Executing Analysis..." : "Run AI Analysis"}
            </div>
          </button>
        </div>

        {/* Right Column: Documentation Uploads */}
        <div className="col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 p-8 shadow-sm h-full flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-8 text-center">
              Required Documentation
            </h3>
            
            <div className="grid grid-cols-2 gap-10">
              {/* Insurance Policy Upload */}
              <label className="cursor-pointer group">
                <input type="file" className="hidden" onChange={(e) => setPolicyFile(e.target.files?.[0])} />
                <div className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed transition-all ${policyFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-[#003366] bg-slate-50/50'}`}>
                  {policyFile ? (
                    <CheckCircle className="text-emerald-500 w-10 h-10 mb-2" />
                  ) : (
                    <FileText className="text-slate-300 w-10 h-10 mb-2 group-hover:text-[#003366]" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#001A33]">Insurance Policy</span>
                  <span className="text-[8px] font-medium text-slate-400 mt-1 max-w-[120px] truncate">
                    {policyFile ? policyFile.name : 'Upload PDF'}
                  </span>
                </div>
              </label>

              {/* Medical Record Upload */}
              <label className="cursor-pointer group">
                <input type="file" className="hidden" onChange={(e) => setPatientFile(e.target.files?.[0])} />
                <div className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed transition-all ${patientFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-[#003366] bg-slate-50/50'}`}>
                  {patientFile ? (
                    <CheckCircle className="text-emerald-500 w-10 h-10 mb-2" />
                  ) : (
                    <UploadCloud className="text-slate-300 w-10 h-10 mb-2 group-hover:text-[#003366]" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#001A33]">Medical Record</span>
                  <span className="text-[8px] font-medium text-slate-400 mt-1 max-w-[120px] truncate">
                    {patientFile ? patientFile.name : 'Upload PDF'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Status Area */}
      {isProcessing && (
        <div className="bg-[#001A33] p-6 flex items-center justify-between border-l-4 border-[#FFD200] animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-4">
             <div className="flex gap-1">
               <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full animate-pulse" />
               <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full animate-pulse [animation-delay:200ms]" />
               <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full animate-pulse [animation-delay:400ms]" />
             </div>
             <p className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
               {logs[logs.length - 1]?.msg || "Synthesizing clinical justifications..."}
             </p>
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Processing Data Layer 04</span>
        </div>
      )}

      {/* Result Card: Enterprise Layout */}
      {result && !isProcessing && (
        <div className="bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500">
           <div className="p-1 bg-[#001A33]" />
           <div className="p-8">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-3">
                 <ClipboardList className="text-[#001A33] w-6 h-6" />
                 <h3 className="text-xl font-black uppercase italic text-[#001A33]">Intelligence Summary</h3>
               </div>
               <button 
                 onClick={() => setView('solutions')}
                 className="flex items-center gap-2 bg-[#FFD200] text-[#001A33] px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:brightness-95 transition-all shadow-lg"
               >
                 Explore Solutions <Zap size={14} />
               </button>
             </div>
             
             <div className="bg-slate-50 p-6 border-l-2 border-slate-200">
                <p className="text-sm font-bold text-[#001A33]/70 leading-relaxed italic">
                  "{result.justification}"
                </p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}