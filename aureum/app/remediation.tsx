"use client";
import React from 'react';
import { 
  ArrowLeft, Zap, CheckCircle, AlertTriangle, 
  Copy, ShieldAlert, Hash, ClipboardCheck, 
  FileSearch, ChevronRight, Info
} from 'lucide-react';

export default function Remediation({ result, onBack }: any) {
  // Filter for unmet requirements that are applicable to the case
  const unmet = result?.requirements?.filter((r: any) => !r.is_met && (r.is_applicable !== false)) || [];

  return (
    <div className="max-w-6xl mx-auto py-6 animate-in fade-in duration-500">
      
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#001A33] uppercase tracking-tighter italic">
            Solutions Hub <span className="text-slate-300 font-light">// Remediation Intelligence</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Algorithmic Recommendations to Resolve Documentation Deficiencies
          </p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={12} /> Return to Analysis
        </button>
      </div>

      {/* 2. SUMMARY OVERVIEW BOX */}
      <div className="bg-[#001A33] p-8 mb-10 flex justify-between items-center shadow-2xl border-l-8 border-[#FFD200]">
        <div className="space-y-1">
          <h3 className="text-white font-black uppercase italic tracking-tight text-xl">Deficiency Analysis Complete</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {unmet.length} Critical Gaps Identified in Clinical Record
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <span className="text-[9px] font-black text-slate-500 uppercase block">Prior Auth Required</span>
            <span className="text-[#FFD200] font-black text-lg uppercase">YES</span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-right">
            <span className="text-[9px] font-black text-slate-500 uppercase block">Est. Resolution Time</span>
            <span className="text-white font-black text-lg uppercase">48-72H</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* 3. MAIN REMEDIATION FEED (Left 8 Columns) */}
        <div className="col-span-8 space-y-6">
          {unmet.map((req: any, idx: number) => (
            <div key={idx} className="bg-white border border-slate-200 shadow-sm overflow-hidden group">
              <div className="p-1 bg-slate-100 group-hover:bg-[#001A33] transition-colors" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Issue Type: Documentation Gap</span>
                      <h4 className="text-sm font-black text-[#001A33] uppercase leading-tight">{req.description}</h4>
                    </div>
                  </div>
                </div>

                {/* The "Bridge" / Suggested Fix */}
                <div className="bg-slate-50 border-l-4 border-[#FFD200] p-5 mt-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-[#001A33] uppercase tracking-widest flex items-center gap-1">
                        <Zap size={10} className="fill-[#FFD200]" /> Recommended Bridge Action
                      </span>
                      <p className="text-sm font-bold text-slate-600 italic leading-relaxed">
                        "{req.bridge_action || "Provider must submit explicit clinical notes verifying failed conservative therapy (PT/Injections) for minimum 6-week duration."}"
                      </p>
                    </div>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(req.bridge_action); alert("Copied!");}}
                      className="p-2 text-slate-300 hover:text-[#001A33] transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. CODING & COMPLIANCE SIDEBAR (Right 4 Columns) */}
        <div className="col-span-4 space-y-6">
          
          {/* Suggested Codes Card */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Hash size={12} /> Coding Intelligence
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block mb-2">Suggested CPT Codes</label>
                <div className="flex flex-wrap gap-2">
                  {['27447', '29881'].map(code => (
                    <span key={code} className="px-3 py-1 bg-slate-100 text-[#001A33] text-[10px] font-bold border border-slate-200">{code}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block mb-2">Suggested ICD-10 Codes</label>
                <div className="flex flex-wrap gap-2">
                  {['M17.11', 'M17.12'].map(code => (
                    <span key={code} className="px-3 py-1 bg-slate-100 text-[#001A33] text-[10px] font-bold border border-slate-200">{code}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[#001A33] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ClipboardCheck size={12} /> Compliance Status
            </h3>
            <ul className="space-y-3">
              <ComplianceItem label="Prior Auth Status" status="Incomplete" />
              <ComplianceItem label="HIPAA Data Layer" status="Secure" color="text-emerald-600" />
              <ComplianceItem label="Policy Version" status="2026-v2" />
            </ul>
          </div>

          {/* Quick Help */}
          <div className="bg-emerald-50 border border-emerald-100 p-4">
             <div className="flex gap-3">
               <Info className="text-emerald-600 w-4 h-4 shrink-0" />
               <p className="text-[10px] font-bold text-emerald-800 leading-tight italic">
                 Addressing these gaps increases the Approval Probability by an estimated +22%.
               </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ComplianceItem({ label, status, color = "text-[#001A33]" }: any) {
  return (
    <li className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className={`text-[10px] font-black uppercase ${color}`}>{status}</span>
    </li>
  );
}