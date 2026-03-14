"use client";
import React, { useState, useRef, useEffect } from 'react';
import Home from './home';
import Login from './login';
import Audit from './audit';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'workspace'>('landing');
  
  // Audit & UI States
  const [patientId, setPatientId] = useState('PT-7721');
  const [policyFile, setPolicyFile] = useState<File | undefined>();
  const [patientFile, setPatientFile] = useState<File | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ node: string; msg: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for the terminal logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

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
        buffer = lines.pop() || ""; // Save partial line for next chunk

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              if (!jsonStr) continue;
              const payload = JSON.parse(jsonStr);

              // 1. Handle Specialized Messages or Logs
              if (payload.msg) {
                setLogs(prev => [...prev, { node: payload.node, msg: payload.msg }]);
              } else {
                // Mapping node names to user-friendly messages if msg is missing
                const nodeMessages: Record<string, string> = {
                  'check_cache': '🔍 Checking Semantic Policy Cache...',
                  'parse_policy': '📜 Extracting Clinical Rules...',
                  'redact_pii': '🛡️ Scrubbing PII for Compliance...',
                  'evaluate_patient': '🧠 Auditing Records vs Policy...',
                  'critic_verify': '⚖️ Verifying Clinical Groundedness...',
                  'denial_predictor': '🔮 Predicting Denial Risks...'
                };
                setLogs(prev => [...prev, { 
                  node: payload.node, 
                  msg: nodeMessages[payload.node] || `Processing ${payload.node}...` 
                }]);
              }

              // 2. Capture the Audit Result/Summary (CRITICAL)
              if (payload.update && payload.update.justification) {
                console.log("Summary Received:", payload.update.justification);
                setResult(payload.update);
              }

              // 3. Handle End/Error
              if (payload.node === 'END' || payload.node === 'ERROR') {
                setIsProcessing(false);
                if (payload.node === 'END') {
                  setLogs(prev => [...prev, { node: 'END', msg: '✅ Audit Pipeline Completed.' }]);
                }
              }

            } catch (e) {
              console.error("Stream parsing error:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setLogs(prev => [...prev, { node: 'ERROR', msg: 'CONNECTION INTERRUPTED' }]);
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    setLogs([]);
    setResult(null);
    setIsProcessing(false);
    setView('landing');
  };

  // View Controller Logic
  if (view === 'landing') return <Home onNavigate={() => setView('login')} />;
  if (view === 'login') return <Login onLogin={() => setView('workspace')} />;

  return (
    <Audit 
      patientId={patientId}
      setPatientId={setPatientId}
      setPolicyFile={setPolicyFile}
      setPatientFile={setPatientFile}
      startAudit={handleStartAudit}
      isProcessing={isProcessing}
      logs={logs}
      result={result}
      onLogout={handleLogout}
      logEndRef={logEndRef}
    />
  );
}