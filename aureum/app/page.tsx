"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, ShieldAlert, History, LogOut, 
  Activity, Bell, Search, Zap 
} from 'lucide-react';

import Home from './home';
import Login from './login';
import Audit from './audit';
import Remediation from './remediation';
import AuditHistory from './audit-history';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<'audit' | 'solutions' | 'history'>('audit');
  const [user, setUser] = useState<string | null>(null);
  
  const [patientId, setPatientId] = useState('PT-7721');
  const [policyFile, setPolicyFile] = useState<File | undefined>();
  const [patientFile, setPatientFile] = useState<File | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ node: string; msg: string }[]>([]);
  const [result, setResult] = useState<any>(null);

  // Login Handler
  const handleLogin = (email: string) => {
    setUser(email);
    setView('dashboard');
  };

  // The Start Audit Logic (Cleaned up from the merge error)
  const handleStartAudit = async () => {
    if (!policyFile || !patientFile) return alert("Please upload both PDFs.");
    setIsProcessing(true);
    setLogs([{ node: 'START', msg: 'ESTABLISHING SECURE GATEWAY...' }]);
    setResult(null); 

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('policy_pdf', policyFile);
    formData.append('patient_record', patientFile);

    try {
      const response = await fetch('http://localhost:8000/api/audit-stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; 

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; 

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.replace('data: ', '').trim());
              if (payload.msg) setLogs(prev => [...prev, { node: payload.node, msg: payload.msg }]);
              if (payload.update?.justification) setResult(payload.update);
              if (payload.node === 'END' || payload.node === 'ERROR') setIsProcessing(false);
            } catch (e) { console.error("Parsing error", e); }
          }
        }
      }
    } catch (err) {
      setIsProcessing(false);
      setLogs(prev => [...prev, { node: 'ERROR', msg: 'CONNECTION LOST' }]);
    }
  };

  // View Routing
  if (view === 'landing') return <Home onNavigate={() => setView('login')} />;
  if (view === 'login') return <Login onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans">
      {/* 1. PERSISTENT SIDEBAR */}
      <aside className="w-64 bg-[#003366] text-white flex flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-12 px-2">
          <Activity className="text-[#FFD200] w-8 h-8" />
          <span className="text-xl font-black italic tracking-tighter uppercase">AUREUM</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarButton 
            icon={<LayoutDashboard size={18}/>} 
            label="Audit Engine" 
            active={activeTab === 'audit'} 
            onClick={() => setActiveTab('audit')} 
          />
          <SidebarButton 
            icon={<ShieldAlert size={18}/>} 
            label="Solutions Hub" 
            active={activeTab === 'solutions'} 
            onClick={() => setActiveTab('solutions')} 
            disabled={!result}
          />
          <SidebarButton 
            icon={<History size={18}/>} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm">
          <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
            Layer: {activeTab} // {user}
          </h2>
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-slate-300" />
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        {/* 3. INTEGRATION POINT: THE TAB SYSTEM */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          {activeTab === 'audit' && (
            <Audit 
              patientId={patientId} setPatientId={setPatientId}
              policyFile={policyFile} setPolicyFile={setPolicyFile}
              patientFile={patientFile} setPatientFile={setPatientFile}
              startAudit={handleStartAudit} isProcessing={isProcessing}
              logs={logs} result={result}
              setView={setActiveTab} // This lets the "View Remediation" button switch tabs
            />
          )}

          {activeTab === 'solutions' && (
            <Remediation result={result} onBack={() => setActiveTab('audit')} />
          )}

          {activeTab === 'history' && (
            <AuditHistory onBack={() => setActiveTab('audit')} />
          )}
        </div>
      </main>
    </div>
  );
}

// Sidebar Button Helper
function SidebarButton({ icon, label, active, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        disabled ? 'opacity-20 cursor-not-allowed' : ''
      } ${
        active ? 'bg-white/10 text-[#FFD200] border-l-4 border-[#FFD200]' : 'text-slate-400 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}