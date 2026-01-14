'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PDFUploadProps {
    onUpload: (file: File) => void;
    isUploading?: boolean;
}

export function PDFUpload({ onUpload, isUploading = false }: PDFUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const validateAndUpload = (file: File) => {
        setError(null);
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }
        // 50MB limit
        if (file.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit.');
            return;
        }
        onUpload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-400">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={cn(
                    "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 text-center",
                    dragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-900/50",
                    isUploading && "pointer-events-none opacity-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleChange}
                />

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-2 ring-8 ring-primary/5">
                        {isUploading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <FileText className="w-8 h-8" />
                            </motion.div>
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">
                            {isUploading ? 'Uploading & Processing...' : 'Upload your exam PDF'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Drag and drop your file here, or click to browse.
                            <br />
                            <span className="text-xs text-muted-foreground/70">Max 50MB • PDF only</span>
                        </p>
                    </div>
                </div>

                {/* Decorative background gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
        </div>
    );
}
