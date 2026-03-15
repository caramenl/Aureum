"use client";
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, FileText, Calendar, 
  ChevronRight, Activity, ShieldCheck, Database 
} from 'lucide-react';

export default function AuditHistory({ onBack, onSelect }: { onBack: () => void, onSelect: (record: any) => void }) {
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
    if (patientId) fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-6 animate-in fade-in duration-500">
      
      {/* Institutional Header */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#001A33] uppercase tracking-tighter italic">
            Audit Archive <span className="text-slate-300 font-light">// Data Logs</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Historical Compliance Records & Intelligence Retrieval
          </p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={12} /> Return to Engine
        </button>
      </div>

      {/* Search Bar - Professional/Technical Style */}
      <div className="bg-white border border-slate-200 p-4 mb-8 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Patient ID (e.g., PT-7721)"
            className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 text-sm font-bold text-[#001A33] outline-none focus:border-[#003366]"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchHistory}
          className="px-8 py-3 bg-[#001A33] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#003366] transition-all"
        >
          Query Database
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header Labels */}
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-6 py-3">
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Case Reference</div>
          <div className="col-span-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Intelligence Summary</div>
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Timestamp</div>
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin w-8 h-8 text-slate-200 mx-auto mb-4" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Retrieving Log Entries...</p>
            </div>
          ) : records.length > 0 ? (
            records.map((record, idx) => (
              <div 
                key={idx} 
                className="grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => onSelect(record)}
              >
                {/* Case Reference */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-[#001A33] rounded">
                      <Database size={14} />
                    </div>
                    <span className="font-black text-sm text-[#001A33]">{patientId}</span>
                  </div>
                </div>

                {/* Summary Snippet */}
                <div className="col-span-6">
                  <p className="text-xs font-bold text-slate-500 line-clamp-1 pr-10 italic">
                    "{record.final_justification}"
                  </p>
                </div>

                {/* Timestamp */}
                <div className="col-span-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#001A33]">MAR 14, 2026</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">02:14:31 EST</span>
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-2 text-right">
                  <button className="inline-flex items-center gap-2 text-[#001A33] font-black text-[9px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    Access Report <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center bg-slate-50/30">
              <ShieldCheck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-300 text-xs font-black uppercase tracking-widest italic">No records found for query parameter</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Footer */}
      <div className="mt-4 flex justify-between items-center px-2">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">
          Authorized retrieval only // encrypted session
        </p>
        <div className="flex items-center gap-4">
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter italic underline decoration-[#FFD200] decoration-2 underline-offset-4">
             Export Audit Log (PDF)
           </span>
        </div>
      </div>
    </div>
  );
}

// Simple Loader Component if needed
function Loader2({ className }: { className?: string }) {
  return <Activity className={className} />;
}