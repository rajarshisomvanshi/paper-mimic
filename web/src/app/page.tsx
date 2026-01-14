'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFUpload } from '@/components/PDFUpload';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { ResultsViewer } from '@/components/ResultsViewer';
import { HistorySidebar } from '@/components/HistorySidebar';
import { api } from '@/lib/api';
import { ProgressUpdate, ResultUpdate, WebSocketMessage } from '@/types';
import { Toaster, toast } from 'sonner';

// Install sonner for easy toasts if not already: npm install sonner

export default function Home() {
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETE'>('IDLE');
  const [progress, setProgress] = useState<ProgressUpdate | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<ResultUpdate[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    // Scroll logs to bottom
    const logContainer = document.getElementById('log-end');
    logContainer?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleUpload = async (file: File) => {
    setStatus('UPLOADING');
    setLogs([]);
    setResults([]);
    // Initialize progress to show the first step as active immediately
    setProgress({
      type: 'progress',
      stage: 'parsing',
      status: 'running',
      message: 'Uploading...'
    });

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        await api.connect();

        api.subscribe((msg: WebSocketMessage) => {
          if (msg.type === 'log') {
            setLogs(prev => [...prev, msg.content]);
          } else if (msg.type === 'progress') {
            setStatus('PROCESSING');
            setProgress(msg);
          } else if (msg.type === 'result') {
            setResults(prev => [...prev, msg]);
          } else if (msg.type === 'summary') {
            setSummary(msg);
            setStatus('COMPLETE');
            api.disconnect();
          } else if (msg.type === 'error') {
            toast.error(msg.content);
            setStatus('IDLE');
          }
        });

        api.send({
          mode: 'upload',
          pdf_data: base64Data,
          pdf_name: file.name,
          kb_name: 'default',
          max_questions: 5
        });
      };
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload file');
      setStatus('IDLE');
    }
  };

  // History loading
  const [currentSessionId, setCurrentSessionId] = useState<string>();

  const handleSelectSession = async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId);
      setStatus('PROCESSING'); // Show temporary loading state
      setLogs(['Loading history session...']);

      const res = await fetch(`http://localhost:8000/api/history/${sessionId}`);
      if (!res.ok) throw new Error('Failed to load session');

      const data = await res.json();

      // Transform history data to ResultUpdate[] format for viewer
      const mappedResults: ResultUpdate[] = (data.generated_questions || []).map((item: any, idx: number) => ({
        type: 'result',
        question_id: `hist-${idx}`,
        index: idx + 1,
        success: true,
        question: item.generated_question,
        validation: item.validation,
        reference_number: item.reference_question_number,
        current: idx + 1,
        total: (data.generated_questions || []).length,
        reference_question: item.reference_question_text
      }));

      setResults(mappedResults);

      setSummary({
        total_reference: data.total_reference_questions || 0,
        successful: data.successful_generations || 0,
        failed: data.failed_generations || 0,
        output_file: 'Loaded from history'
      });

      setStatus('COMPLETE');
      toast.success('History loaded successfully');

    } catch (error) {
      console.error(error);
      toast.error('Failed to load session');
      setStatus('IDLE');
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black text-foreground selection:bg-primary/20 flex">
      {/* Sidebar */}
      <HistorySidebar onSelectSession={handleSelectSession} currentSessionId={currentSessionId} />

      <div className="flex-1 container mx-auto px-4 py-8 md:py-16 space-y-16 pl-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
              Paper Mimic
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Upload any exam paper and instantly generate infinite practice questions
            that perfectly match its style and difficulty.
          </motion.p>
        </header>

        {/* Main Content Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">

            {status === 'IDLE' && (
              <motion.section
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <PDFUpload onUpload={handleUpload} />
              </motion.section>
            )}

            {(status === 'UPLOADING' || status === 'PROCESSING') && (
              <motion.section
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ProgressDisplay progress={progress} logs={logs} />
              </motion.section>
            )}

            {status === 'COMPLETE' && (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ResultsViewer results={results} summary={summary} />

                <div className="mt-12 text-center">
                  <button
                    onClick={() => {
                      setStatus('IDLE');
                      setResults([]);
                      setSummary(null);
                      setCurrentSessionId(undefined);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Process another paper
                  </button>
                </div>
              </motion.section>
            )}

          </AnimatePresence>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
