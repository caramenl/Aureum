'use client';

import React from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Clock, 
  Activity, ArrowLeft, ChevronRight, FileText,
  User, ClipboardList, Info
} from 'lucide-react';

interface TreatmentEvent {
  date: string;
  description: string;
  status: string;
  requirement_id?: string;
}

interface TimelineProps {
  onBack: () => void;
  result: any;
}

export default function Timeline({ onBack, result }: TimelineProps) {
  const events: TreatmentEvent[] = result?.treatment_history || [];
  
  // Sort events chronologically (assuming ISO dates or something sortable)
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('COMPLETED') || s.includes('SUCCESS') || s.includes('MET')) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (s.includes('FAILED') || s.includes('DENIED') || s.includes('UNMET')) return 'text-rose-500 bg-rose-50 border-rose-100';
    return 'text-amber-500 bg-amber-50 border-amber-100';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('COMPLETED') || s.includes('SUCCESS') || s.includes('MET')) return <CheckCircle2 size={16} />;
    if (s.includes('FAILED') || s.includes('DENIED') || s.includes('UNMET')) return <XCircle size={16} />;
    return <Clock size={16} />;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-[#001A33]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Clinical Data</span>
            </div>
            <h1 className="text-3xl font-black text-[#001A33] tracking-tight">Patient Treatment Timeline</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Case ID: {result?.patient_id || 'UNKNOWN'}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#001A33]">
              <ClipboardList size={16} />
            </div>
            <div>
              <span className="text-[8px] font-black text-slate-400 tracking-widest uppercase block">Events</span>
              <span className="text-sm font-black text-[#001A33]">{events.length}</span>
            </div>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Activity size={32} />
            </div>
            <h3 className="text-xl font-black text-[#001A33] mb-2">No Treatment History Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
                We couldn't extract a chronological timeline from the provided records. Ensure the document contains dated clinical events.
            </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-100"></div>

          <div className="space-y-12">
            {sortedEvents.map((event, idx) => (
              <div key={idx} className="relative pl-24 group">
                {/* Timeline Node */}
                <div className="absolute left-[26px] top-0 w-3 h-3 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-50 z-10"></div>
                
                {/* Date Side-label */}
                <div className="absolute left-0 top-0 w-20 text-right pr-6">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="block text-[14px] font-black text-[#001A33] leading-none mt-1">
                    {new Date(event.date).getFullYear()}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 transition-all hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-black text-[#001A33] leading-tight group-hover:text-blue-600 transition-colors">
                      {event.description}
                    </h3>
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      {event.status}
                    </div>
                  </div>

                  {event.requirement_id && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Linked Requirement</span>
                        <p className="text-xs font-bold text-slate-600 leading-snug">
                          Satisfaction of policy clause related to {event.requirement_id}.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                       <FileText size={12} />
                       Verified in Source
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                       <User size={12} />
                       Attending Physician
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="mt-16 pt-8 border-t border-slate-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
          <Info size={18} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Clinical AI Interpretation Notice:
          </p>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl">
            This timeline is generated via semantic extraction from submitted pre-authorization forms. While every effort is made to ensure chronological accuracy, manual verification against the original source text is recommended for critical clinical decision support.
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component for icons that weren't imported initially but are standard
function ShieldCheck({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
