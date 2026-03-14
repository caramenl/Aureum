"use client";
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Activity, ShieldCheck } from 'lucide-react';

export default function AureumFrontend() {
  const [patientId, setPatientId] = useState('PT-7721');
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [patientFile, setPatientFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'processing' && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/audit-status/${jobId}`);
          const data = await res.json();
          if (data.status === 'COMPLETED') {
            setAuditResult(data.result);
            setStatus('completed');
            clearInterval(interval);
          } else if (data.status === 'FAILED') {
            setStatus('error');
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000); // Check every 2 seconds
    }
    return () => clearInterval(interval);
  }, [status, jobId]);

  const handleStartAudit = async () => {
    if (!policyFile || !patientFile) return alert("Upload both PDFs first!");

    setStatus('processing');
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('policy_pdf', policyFile);
    formData.append('patient_record', patientFile);

    try {
      const response = await fetch('http://localhost:8000/api/audit-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setJobId(data.job_id); //
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-indigo-950 tracking-tight">AUREUM</h1>
          <p className="text-slate-500 font-medium">Agentic Clinical Necessity Audit v1.0</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">HIPAA Compliant Session</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Configuration */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Audit Config
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Patient Reference</label>
                <input 
                  value={patientId} 
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-transparent font-mono text-indigo-700 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Policy (PDF)</label>
                <input type="file" onChange={(e) => setPolicyFile(e.target.files?.[0] || null)} className="text-xs file:bg-indigo-50 file:text-indigo-700 file:border-0 file:rounded-md file:px-3 file:py-1 cursor-pointer" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Patient Records (PDF)</label>
                <input type="file" onChange={(e) => setPatientFile(e.target.files?.[0] || null)} className="text-xs file:bg-indigo-50 file:text-indigo-700 file:border-0 file:rounded-md file:px-3 file:py-1 cursor-pointer" />
              </div>
              <button 
                onClick={handleStartAudit}
                disabled={status === 'processing'}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:bg-slate-300 flex justify-center items-center gap-2"
              >
                {status === 'processing' ? <Activity className="animate-spin" /> : <Upload className="w-5 h-5" />}
                {status === 'processing' ? 'Running AI Agent...' : 'Submit for Audit'}
              </button>
            </div>
          </div>
        </section>

        {/* Audit Intelligence Output */}
        <section className="lg:col-span-2">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl min-h-[500px] border-t-8 border-indigo-500 relative overflow-hidden">
            {/* Background pattern for "Pro" look */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-white text-8xl font-black italic">AI</div>

            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <h3 className="text-indigo-400 font-mono font-bold tracking-widest text-sm uppercase">Verification Console</h3>
              {status === 'completed' && <div className="text-emerald-400 flex items-center gap-2 text-xs font-bold"><CheckCircle className="w-4 h-4" /> AUDIT SUCCESS</div>}
            </div>

            {status === 'idle' && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-mono text-sm">Awaiting clinical data injection...</p>
              </div>
            )}

            {status === 'processing' && (
              <div className="font-mono text-sm space-y-4 text-indigo-300">
                <p className="animate-pulse">{">"} Establishing Moorcheh Memory connection...</p>
                <p className="delay-75 animate-pulse">{">"} Redacting PII from patient stream...</p>
                <p className="delay-150 animate-pulse">{">"} Initiating Gemini 1.5 Flash spatial analysis...</p>
              </div>
            )}

            {status === 'completed' && auditResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Decision</span>
                    <p className={`text-xl font-black ${auditResult.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {auditResult.status}
                    </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Policy Match</span>
                    <p className="text-xl font-black text-indigo-300 truncate">{auditResult.policy_name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clinical Grounding</h4>
                  {auditResult.requirements.map((req: any, i: number) => (
                    <div key={i} className="flex items-start justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-800 gap-4">
                      <div className="flex items-start gap-3">
                        {req.is_met ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 mt-1 shrink-0" />}
                        <span className="text-xs text-slate-300 leading-relaxed">{req.description}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded shrink-0">
                        Pg {req.page_number || '??'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Agent Justification</p>
                  <p className="text-sm text-slate-400 leading-relaxed italic">"{auditResult.final_justification}"</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}