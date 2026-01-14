"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronLeft, ChevronRight, FileClock, Calendar, CheckCircle2, ChevronRightCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface HistoryItem {
    id: string
    timestamp: string
    paper_name: string
    total_questions: number
    success_count: number
}

interface HistorySidebarProps {
    onSelectSession: (id: string) => void
    currentSessionId?: string
}

export function HistorySidebar({ onSelectSession, currentSessionId }: HistorySidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(false)

    const fetchHistory = async () => {
        try {
            setLoading(true)
            const res = await fetch('http://localhost:8000/api/history')
            if (!res.ok) throw new Error('Failed to fetch history')
            const data = await res.json()
            setHistory(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load history')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this session?')) return

        try {
            const res = await fetch(`http://localhost:8000/api/history/${id}`, {
                method: 'DELETE',
            })
            if (!res.ok) throw new Error('Failed to delete')

            setHistory(prev => prev.filter(item => item.id !== id))
            toast.success('Session deleted')
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete session')
        }
    }

    // Reload history when sidebar is opened
    useEffect(() => {
        if (isOpen) {
            fetchHistory()
        }
    }, [isOpen])

    return (
        <>
            <div
                className={cn(
                    "fixed left-0 top-0 h-full bg-white/10 backdrop-blur-xl border-r border-white/20 z-50 transition-all duration-300 shadow-2xl overflow-hidden",
                    isOpen ? "w-80" : "w-12"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header / Toggle */}
                    <div className="p-2 border-b border-white/10 flex items-center justify-between">
                        {isOpen && <span className="text-white font-bold ml-2 flex items-center gap-2"><History className="w-4 h-4" /> History</span>}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {isOpen && (
                            <>
                                {loading ? (
                                    <div className="text-white/50 text-center py-4 text-sm animate-pulse">Loading...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-white/30 text-center py-4 text-sm">No history found</div>
                                ) : (
                                    history.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => onSelectSession(item.id)}
                                            className={cn(
                                                "group p-3 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-all text-left relative overflow-hidden pr-10",
                                                currentSessionId === item.id ? "bg-white/10 border-indigo-500/50" : "bg-black/20"
                                            )}
                                        >
                                            <h3 className="text-white/90 text-sm font-medium truncate" title={item.paper_name}>
                                                {item.paper_name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {item.timestamp}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {item.success_count} / {item.total_questions} Generated
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="absolute right-2 top-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                title="Delete this session"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay to close on mobile or check focus */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
