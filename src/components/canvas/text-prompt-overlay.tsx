'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowUp, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDispatch } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit'
import { addGeneratedUI, updateShape } from '@/redux/slice/shapes'
import { toast } from 'sonner'
import { useAppSelector } from '@/redux/store'

export const TextPromptOverlay = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const dispatch = useDispatch()
    const viewport = useAppSelector((state) => state.viewport)

    // Listen for custom open event
    useEffect(() => {
        const handleOpen = () => setIsVisible(true)
        window.addEventListener('morphiq-open-text-prompt', handleOpen)
        return () => window.removeEventListener('morphiq-open-text-prompt', handleOpen)
    }, [])

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsVisible((prev) => !prev)
            }
            if (e.key === 'Escape' && isVisible) {
                setIsVisible(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isVisible])

    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isVisible])

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return

        setIsGenerating(true)
        const currentPrompt = prompt
        setPrompt('')

        try {
            const urlParams = new URLSearchParams(window.location.search)
            const projectId = urlParams.get('project')

            // Initial position: center of viewport
            const worldCenter = {
                x: (-viewport.translate.x + window.innerWidth / 2) / viewport.scale,
                y: (-viewport.translate.y + window.innerHeight / 2) / viewport.scale,
            }

            const generatedUIId = nanoid()
            dispatch(
                addGeneratedUI({
                    id: generatedUIId,
                    x: worldCenter.x - 400,
                    y: worldCenter.y - 300,
                    w: 800,
                    h: 600,
                    uiSpecData: null,
                    sourceFrameId: 'text-prompt',
                    name: currentPrompt.slice(0, 20) + '...',
                    breakpoint: 'desktop'
                })
            )

            const response = await fetch('/api/generate/text-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt, projectId }),
            })

            if (!response.ok) throw new Error('Failed to generate design')

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let accumulatedTsx = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        const componentName = accumulatedTsx.match(/export\s+default\s+function\s+(\w+)/)?.[1] || 'GeneratedComponent'
                        dispatch(
                            updateShape({
                                id: generatedUIId,
                                patch: {
                                    uiSpecData: accumulatedTsx,
                                    componentName,
                                    streamingTsx: null,
                                },
                            })
                        )
                        break
                    }
                    const chunk = decoder.decode(value)
                    accumulatedTsx += chunk
                    dispatch(
                        updateShape({
                            id: generatedUIId,
                            patch: { streamingTsx: accumulatedTsx },
                        })
                    )
                }
            }

            setIsVisible(false)
        } catch (error) {
            console.error('Text prompt Error:', error)
            toast.error('Failed to generate design from prompt')
        } finally {
            setIsGenerating(false)
        }
    }

    if (!isVisible && !isGenerating) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center pb-32 pointer-events-none">
            <div
                className={cn(
                    "w-full max-w-2xl bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] pointer-events-auto transition-all duration-500 transform translate-y-0 opacity-100",
                    !isVisible && "translate-y-8 opacity-0 scale-95"
                )}
            >
                <div className="relative flex items-center gap-3 px-4 py-2">
                    <Sparkles size={20} className="text-primary shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Describe your design (e.g., 'A modern SaaS landing page with a dark hero section')..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 py-3 text-lg font-light"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        disabled={isGenerating}
                    />
                    <div className="flex items-center gap-2">
                        {isGenerating ? (
                            <div className="flex items-center gap-3 pr-2">
                                <div className="text-[10px] uppercase tracking-widest text-primary font-bold animate-pulse">Generating...</div>
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 text-white/20 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim()}
                                    className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                        prompt.trim()
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100"
                                            : "bg-white/5 text-white/10 scale-95"
                                    )}
                                >
                                    <ArrowUp size={20} strokeWidth={3} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
