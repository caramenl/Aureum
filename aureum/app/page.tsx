"use client";
// 1. Added useEffect and useRef to the React import
import React, { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle, FileText, Activity, Terminal } from 'lucide-react';

export default function AureumStreamAudit() {
  const [patientId, setPatientId] = useState('PT-7721');
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [patientFile, setPatientFile] = useState<File | null>(null);
  
  // UI State for Streaming
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ node: string; msg: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  
  // Auto-scroll ref for the terminal console
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const startStreamingAudit = async () => {
    if (!policyFile || !patientFile) return alert("Please upload both PDFs.");

    setIsProcessing(true);
    setLogs([{ node: 'START', msg: '🚀 Initializing Aureum Agent Stream...' }]);
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

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              if (!jsonStr) continue;
              
              const payload = JSON.parse(jsonStr);
              
              if (payload.node === 'END') {
                setIsProcessing(false);
                setLogs(prev => [...prev, { node: 'END', msg: '✅ Audit Pipeline Completed.' }]);
                continue;
              }

              if (payload.node === 'ERROR') {
                setIsProcessing(false);
                setLogs(prev => [...prev, { node: 'ERROR', msg: `❌ Error: ${payload.error}` }]);
                continue;
              }

              // Map node names to user-friendly messages
              const nodeMessages: Record<string, string> = {
                'check_cache': '🔍 Checking Moorcheh Semantic Cache...',
                'parse_policy': '📜 Extracting Clinical Rules from Policy...',
                'redact_pii': '🛡️ Scrubbing PII from Medical Records...',
                'evaluate_patient': '🧠 Auditing Patient Records vs Policy...',
                'critic_verify': '⚖️ Critic Node: Verifying Groundedness...'
              };

              setLogs((prev) => [...prev, { 
                node: payload.node, 
                msg: nodeMessages[payload.node] || `Processing ${payload.node}...` 
              }]);

              // Update result if the payload contains data from the audit nodes
              if (payload.update && payload.update.justification) {
                setResult(payload.update);
              }
            } catch (e) {
              console.error("Stream parsing error:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream connection failed:", err);
      setLogs(prev => [...prev, { node: 'ERROR', msg: '❌ Connection to Backend Failed.' }]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600"/> Audit Config
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Reference</label>
                <input 
                  type="text" 
                  value={patientId} 
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy (PDF)</label>
                <input type="file" onChange={(e) => setPolicyFile(e.target.files?.[0] || null)} className="text-xs w-full mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Records (PDF)</label>
                <input type="file" onChange={(e) => setPatientFile(e.target.files?.[0] || null)} className="text-xs w-full mt-1" />
              </div>
              <button 
                onClick={startStreamingAudit}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
              >
                {isProcessing ? "Agent Working..." : "Run Stream Audit"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Console & Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl min-h-[450px] border-t-4 border-indigo-500 relative overflow-hidden">
            <div className="flex justify-between items-center text-indigo-400 font-mono text-xs mb-4 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4"/> 
                <span>AUREUM_CORE_v1.0.STREAM</span>
              </div>
              <span className="text-slate-500">HIPAA_ENCRYPTED_CHANNEL</span>
            </div>

            <div className="font-mono text-sm space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`${log.node === 'ERROR' ? 'text-rose-400' : 'text-emerald-400'} animate-in fade-in slide-in-from-left-2`}>
                  <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString([], {hour12: false})}]</span> 
                  {log.msg}
                </div>
              ))}
              {isProcessing && (
                <div className="text-indigo-400 animate-pulse mt-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
                  {">"} Awaiting LangGraph Node completion...
                </div>
              )}
              <div ref={logEndRef} />
            </div>

            {result && (
              <div className="mt-8 p-5 bg-slate-800/50 rounded-xl border border-indigo-500/30 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-indigo-300 font-bold uppercase text-xs tracking-widest">Audit Summary</h3>
                  <div className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-[10px] font-bold">
                    REQ_MET: {result.req_count}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{result.justification || "Clinical review finalized."}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}