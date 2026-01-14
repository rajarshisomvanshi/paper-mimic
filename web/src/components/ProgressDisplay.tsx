'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, FileSearch, BrainCircuit, PenTool } from 'lucide-react';
import { ProgressUpdate, ProgressStage } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressDisplayProps {
    progress?: ProgressUpdate;
    logs: string[];
}

const steps = [
    { id: 'parsing', label: 'Reading PDF', icon: FileSearch },
    { id: 'extracting', label: 'Understanding', icon: BrainCircuit },
    { id: 'generating', label: 'Creating Questions', icon: PenTool },
] as const;

export function ProgressDisplay({ progress, logs }: ProgressDisplayProps) {
    const currentStepIndex = steps.findIndex(s => s.id === progress?.stage);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Steps Visualization */}
            <div className="relative flex justify-between items-center w-full px-4">
                {/* Connection Line */}
                <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full" />
                <div
                    className="absolute left-0 top-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                    style={{
                        width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`
                    }}
                />

                {steps.map((step, idx) => {
                    const isActive = progress?.stage === step.id;
                    const isCompleted = currentStepIndex > idx || (currentStepIndex === idx && progress?.status === 'complete');
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3 bg-background px-4">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isCompleted || isActive ? 'var(--primary)' : 'var(--muted)',
                                }}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 border-background shadow-lg transition-colors duration-300",
                                    (isActive || isCompleted) ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                                )}
                            >
                                {isCompleted && !isActive ? (
                                    <Check className="w-6 h-6" />
                                ) : isActive ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Icon className="w-6 h-6" />
                                )}
                            </motion.div>
                            <div className="text-center">
                                <span className={cn(
                                    "text-sm font-semibold transition-colors duration-300",
                                    isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <p className="text-xs text-muted-foreground animate-pulse mt-1">
                                        {progress?.message || 'Processing...'}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar (Detailed) */}
            {progress?.total && progress?.current !== undefined && (
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress: {progress.current} / {progress.total}</span>
                        <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                            className="h-full bg-primary rounded-full"
                            transition={{ type: 'spring', stiffness: 50 }}
                        />
                    </div>
                </div>
            )}

            {/* Logs Terminal */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 font-mono text-xs overflow-hidden h-[200px] flex flex-col shadow-inner">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-900">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="ml-2 text-muted-foreground opacity-50">System Logs</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            <span className="text-primary/50 mr-2">➜</span>
                            {log}
                        </motion.div>
                    ))}
                    <div id="log-end" />
                </div>
            </div>
        </div>
    );
}
