'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, CheckCircle2, ChevronDown, ChevronUp, BrainCircuit, FileText, Sparkles } from 'lucide-react';
import { GeneratedQuestion, ResultUpdate } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import { generateExamPDF } from '@/utils/pdfGenerator';

interface ResultsViewerProps {
    results: ResultUpdate[];
    summary: any;
}

export function ResultsViewer({ results, summary }: ResultsViewerProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const downloadJson = () => {
        const data = JSON.stringify({ summary, results }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paper-mimic-results-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        generateExamPDF(results);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Generated Questions
                    </h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        Successfully generated {results.length} unique questions
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 group"
                    >
                        <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Download PDF
                    </button>

                    <button
                        onClick={downloadJson}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl font-medium hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <Download className="w-4 h-4" />
                        JSON
                    </button>
                </div>
            </div>

            {/* Question Text List Removed as per user request */}
        </div>
    );
}
