"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, History as HistoryIcon, Search, FileText, Calendar, ChevronRight, Activity } from 'lucide-react';

export default function AuditHistory({ onBack }: { onBack: () => void }) {
  const [patientId, setPatientId] = useState('PT-7721');
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/history/${patientId}`);
      const data = await response.json();
      setRecords(data.history || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 text-[#003366] font-sans">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] transition-all shadow-sm"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Workspace
        </button>
        <div className="flex items-center gap-4">
          <HistoryIcon className="w-5 h-5 text-[#FFD200]" />
          <h1 className="text-xl font-black uppercase italic tracking-tight">Audit <span className="text-slate-300 font-light">Archive</span></h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Search Patient Records</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                value={patientId} 
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID (e.g. PT-7721)"
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[25px] focus:ring-4 ring-[#FFD200]/20 outline-none font-bold text-sm transition-all" 
              />
            </div>
          </div>
          <button 
            onClick={fetchHistory}
            className="px-10 py-5 bg-[#003366] text-white rounded-[25px] font-black uppercase tracking-widest hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/10 active:scale-95 flex items-center gap-2"
          >
            {isLoading ? "Consulting Archive..." : "Retrieve Logs"}
          </button>
        </div>

        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((record, i) => (
              <div 
                key={i} 
                className="bg-white group rounded-[30px] p-8 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#FFD200]/10 transition-colors">
                    <FileText className="w-6 h-6 text-[#003366]/20 group-hover:text-[#FFD200] transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-slate-700">{record.policy_name || "Medical Policy Audit"}</h3>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                        record.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium line-clamp-1 max-w-xl">
                      {record.final_justification}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                     <div className="flex items-center gap-2 text-slate-300 font-black text-[10px] uppercase justify-end">
                       <Calendar className="w-3 h-3" /> Entry Date
                     </div>
                     <p className="font-bold text-slate-500">March 14, 2026</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#003366] group-hover:bg-[#FFD200] transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
                <Activity className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-300 font-bold italic">No historical audits found for this identifier.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
