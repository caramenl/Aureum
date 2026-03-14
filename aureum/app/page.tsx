"use client";
import React, { useState, useRef, useEffect } from 'react';
import Home from './home';
import Login from './login';
import Audit from './audit';

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'workspace'>('landing');
  
  // Audit States
  const [patientId, setPatientId] = useState('PT-7721');
  const [policyFile, setPolicyFile] = useState<File | undefined>();
  const [patientFile, setPatientFile] = useState<File | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ node: string; msg: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleStartAudit = async () => {
    if (!policyFile || !patientFile) return alert("Please upload both PDFs.");

    setIsProcessing(true);
    setLogs([{ node: 'START', msg: 'ESTABLISHING SECURE GATEWAY...' }]);
    setResult(null); // Clear previous results

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('policy_pdf', policyFile);
    formData.append('patient_record', patientFile);

    try {
      const response = await fetch('http://localhost:8000/api/audit-stream', {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            
            // 1. Update Logs
            if (data.msg) {
              setLogs(prev => [...prev, { node: data.node, msg: data.msg }]);
            }

            // 2. Update Result Summary (The Fix)
            if (data.update && data.update.justification) {
              console.log("Audit Summary Found:", data.update.justification);
              setResult(data.update);
            }

            if (data.node === 'END') setIsProcessing(false);
          }
        }
      }
    } catch (err) {
      setLogs(prev => [...prev, { node: 'ERROR', msg: 'CONNECTION INTERRUPTED' }]);
      setIsProcessing(false);
    }
  };

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
      onLogout={() => setView('landing')}
      logEndRef={logEndRef}
    />
  );
}