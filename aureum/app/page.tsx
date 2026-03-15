"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, ShieldAlert, History, LogOut, 
  Activity, Bell, Search, Zap 
} from 'lucide-react';

// Import your sub-components
import Home from './home';
import Login from './login';
import Audit from './audit';
import Remediation from './remediation';
import AuditHistory from './audit-history';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<'audit' | 'solutions' | 'history'>('audit');
  const [user, setUser] = useState<string | null>(null);
  
  // Shared Audit & Engine States
  const [patientId, setPatientId] = useState('PT-7721');
  const [policyFile, setPolicyFile] = useState<File | undefined>();
  const [patientFile, setPatientFile] = useState<File | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ node: string; msg: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Scoped handleStartAudit with result-scoping fix
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
              const jsonStr = line.replace('data: ', '').trim();
              if (!jsonStr) continue;
              
              const payload = JSON.parse(jsonStr); // payload is defined here

              if (payload.msg) {
                setLogs(prev => [...prev, { node: payload.node, msg: payload.msg }]);
              } else if (payload.node) {
                const messages: Record<string, string> = {
                  'check_cache': '🔍 Checking Policy Cache...',
                  'evaluate_patient': '🧠 Analyzing Clinical Context...',
                  'critic_verify': '⚖️ Verifying Groundedness...'
                };
                setLogs(prev => [...prev, { node: payload.node, msg: messages[payload.node] || `Processing ${payload.node}...` }]);
              }

              // FIXED: Payload check is inside the parsing scope
              if (payload.update && payload.update.justification) {
                setResult(payload.update);
              }

              if (payload.node === 'END' || payload.node === 'ERROR') {
                setIsProcessing(false);
              }
            } catch (e) { console.error("Parse error", e); }
          }
        }
      }
    } catch (err) {
      setIsProcessing(false);
      setLogs(prev => [...prev, { node: 'ERROR', msg: 'CONNECTION LOST' }]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  // View Routing
  if (view === 'landing') return <Home onNavigate={() => setView('login')} />;
<<<<<<< HEAD
  if (view === 'login') return <Login onLogin={(email) => { setUser(email); setView('dashboard'); }} />;
=======
  if (view === 'login') return <Login onLogin={handleLogin} />;
  if (view === 'remediation') return <Remediation result={result} onBack={() => setView('workspace')} />;
  if (view === 'history') return (
    <AuditHistory 
      onBack={() => setView('workspace')} 
      onSelect={(record) => {
        setResult(record);
        setView('remediation');
      }}
    />
  );
>>>>>>> ffafc5ed4e380f272d5e5c05fd335be2a41fe47a

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans">
      {/* 1. SIDEBAR (Persistent Navigation) */}
      <aside className="w-64 bg-[#003366] text-white flex flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-[#FFD200] rounded-xl flex items-center justify-center">
            <Activity className="text-[#003366] w-6 h-6" />
          </div>
          <span className="text-xl font-black italic tracking-tighter">AUREUM</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'audit' ? 'bg-white/10 text-[#FFD200] border-l-4 border-[#FFD200]' : 'text-slate-300 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18}/>
            <span className="text-xs font-bold uppercase tracking-widest">Audit Engine</span>
          </button>
          
          <button 
            disabled={!result}
            onClick={() => setActiveTab('solutions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!result ? 'opacity-30 cursor-not-allowed' : ''} ${activeTab === 'solutions' ? 'bg-white/10 text-[#FFD200] border-l-4 border-[#FFD200]' : 'text-slate-300 hover:bg-white/5'}`}
          >
            <ShieldAlert size={18}/>
            <span className="text-xs font-bold uppercase tracking-widest">Solutions Hub</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white/10 text-[#FFD200] border-l-4 border-[#FFD200]' : 'text-slate-300 hover:bg-white/5'}`}
          >
            <History size={18}/>
            <span className="text-xs font-bold uppercase tracking-widest">History</span>
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase">
          <LogOut size={16}/> Terminate Session
        </button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Environment: HIPAA-Secure P12</span>
          </div>
          <div className="flex items-center gap-6">
            <Bell size={18} className="text-slate-400 cursor-pointer" />
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          {activeTab === 'audit' && (
            <Audit 
              patientId={patientId} setPatientId={setPatientId}
              policyFile={policyFile} setPolicyFile={setPolicyFile}
              patientFile={patientFile} setPatientFile={setPatientFile}
              startAudit={handleStartAudit} isProcessing={isProcessing}
              logs={logs} result={result} logEndRef={logEndRef}
              setView={setActiveTab} // Links "View Remediation" button to tab switch
            />
          )}
          {activeTab === 'solutions' && <Remediation result={result} onBack={() => setActiveTab('audit')} />}
          {activeTab === 'history' && <AuditHistory onBack={() => setActiveTab('audit')} />}
        </div>
      </main>
    </div>
  );
}