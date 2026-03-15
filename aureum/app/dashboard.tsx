'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, FileCheck, 
  Users, Building2, ShieldCheck, ChevronRight,
  PieChart, Activity, Info
} from 'lucide-react';

interface Stats {
  total_claims: number;
  approval_rate: number;
  doc_gap: number;
  provider_stats: { name: string, rate: number, total: number }[];
}

interface Pattern {
  rule: string;
  denial_count: number;
}

interface DashboardProps {
  onNavigate: (tab: 'audit' | 'solutions' | 'history' | 'timeline' | 'dashboard') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, patternsRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/stats'),
          fetch('http://localhost:8000/api/patterns')
        ]);
        const sData = await statsRes.json();
        const pData = await patternsRes.json();
        setStats(sData);
        setPatterns(pData.patterns || []);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReset = async () => {
    if (!confirm("Are you sure you want to clear all historical audit data? This cannot be undone.")) return;
    setIsLoading(true);
    try {
      await fetch('http://localhost:8000/api/reset', { method: 'POST' });
      // Refresh after wipe
      setStats({ total_claims: 0, approval_rate: 0, doc_gap: 0, provider_stats: [] });
      setPatterns([]);
    } catch (e) {
      console.error("Reset error", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Network-Wide Analysis</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#001A33] tracking-tight">Intelligence Overview</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Cross-Patient Performance Metrics</p>
          </div>
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
          >
            Clear All History
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          title="Total Claims Evaluated" 
          value={stats?.total_claims || 0} 
          icon={<FileCheck className="text-blue-600" />} 
          label="Cumulative Audit History"
        />
        <KPICard 
          title="Network Approval Rate" 
          value={`${stats?.approval_rate || 0}%`} 
          icon={<TrendingUp className="text-emerald-500" />} 
          label="Live Performance Metric"
        />
        <KPICard 
          title="Documentation Gap" 
          value={`${stats?.doc_gap || 0}%`} 
          icon={<AlertTriangle className="text-amber-500" />} 
          label="Manual Review Required"
          isWarning
        />
        <KPICard 
          title="Active Policies" 
          value={stats?.provider_stats.length || 0} 
          icon={<Building2 className="text-slate-400" />} 
          label="Audited Entities"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Provider Performance */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-[#001A33]">Provider Approval Performance</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Success Rate per Policy Reference</p>
              </div>
              <BarChart3 className="text-slate-200" size={24} />
            </div>
            
            <div className="space-y-6">
              {stats?.provider_stats.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-[#001A33] uppercase truncate max-w-[200px]">{p.name}</span>
                    <span className="text-[10px] font-black text-slate-400">{p.rate}% Approval ({p.total} Audits)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${p.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!stats?.provider_stats || stats.provider_stats.length === 0) && (
                <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                  Initializing Provider Data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Denial Hotspots */}
          <div className="bg-[#001A33] rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <PieChart size={20} className="text-[#FFD200]" />
                </div>
                <div>
                   <h2 className="text-lg font-black leading-tight">Denial Hotspots</h2>
                   <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Top policy failure triggers</p>
                </div>
            </div>

            <div className="space-y-4">
              {patterns.map((p, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black text-[#FFD200] uppercase tracking-widest">#{i+1} Rule Path</span>
                    <span className="text-[10px] font-black text-white/40">{p.denial_count} Triggers</span>
                  </div>
                  <p className="text-xs font-bold leading-tight line-clamp-2">{p.rule}</p>
                </div>
              ))}
              {patterns.length === 0 && (
                <div className="py-8 text-center text-white/20 font-bold uppercase text-[10px] tracking-widest">
                  Awaiting Pattern Data...
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('solutions')}
              className="w-full mt-6 py-4 bg-[#FFD200] text-[#001A33] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#FFD200]/10 hover:-translate-y-1 transition-all"
            >
               Generate Remediation Strategy
            </button>
          </div>

          {/* Health Score */}
          {stats && stats.total_claims > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-emerald-500" size={20} />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Network Health Score</span>
               </div>
               <div className="text-3xl font-black text-[#001A33] mb-1">{(100 - stats.doc_gap).toFixed(1)}<span className="text-sm opacity-40 ml-1">v/v</span></div>
               <p className="text-[10px] font-bold text-emerald-600/60 leading-tight">
                  Current audit grounding accuracy based on {stats.total_claims} verified sessions.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, label, isWarning }: any) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isWarning ? 'bg-amber-50' : 'bg-slate-50'}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        <div className="text-3xl font-black text-[#001A33] group-hover:text-blue-600 transition-colors">{value}</div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase italic">
          <Info size={10} />
          {label}
        </div>
      </div>
    </div>
  );
}
