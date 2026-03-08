'use client'
import { LiquidGlassButton } from '@/components/buttons/liquid-glass'
import { GeneratedUIShape } from '@/redux/slice/shapes'
import { Download, MessageCircle, Workflow, Monitor, Smartphone, Tablet, Edit2, Check, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { IframeRenderer } from './iframe-renderer'
import { cn } from '@/lib/utils'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { useSearchParams } from 'next/navigation'
import { Id } from '../../../../../convex/_generated/dataModel'
import { useDispatch } from 'react-redux'
import { updateShape } from '@/redux/slice/shapes'

type Props = {
    shape: GeneratedUIShape
    toggleChat: (generatedUIId: string) => void
    generateWorkflow: (generatedUIId: string) => void
    exportDesign: (generatedUIId: string, element: HTMLElement | null) => void
    isSelected?: boolean
}

const GeneratedUI = ({
    shape,
    toggleChat,
    generateWorkflow,
    exportDesign,
    isSelected,
}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project')
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState(shape.name || shape.componentName || 'Generated UI')

    const styleGuide = useQuery(
        api.projects.getProjectStyleGuide,
        projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
    )
    const [isInteracting, setIsInteracting] = useState(false)

    const handleExportDesign = () => {
        if (!shape.uiSpecData) return
        exportDesign(shape.id, containerRef.current)
    }

    const handleGenerateWorkflow = () => {
        if (!shape.uiSpecData) return
        generateWorkflow(shape.id)
    }

    const handleBreakpoint = (type: 'mobile' | 'tablet' | 'desktop') => {
        let width = 1200
        if (type === 'mobile') width = 375
        if (type === 'tablet') width = 768
        if (type === 'desktop') width = 1280

        dispatch(updateShape({
            id: shape.id,
            patch: { w: width, breakpoint: type }
        }))
    }

    const handleSaveName = () => {
        dispatch(updateShape({
            id: shape.id,
            patch: { name: tempName }
        }))
        setIsEditingName(false)
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "absolute transition-shadow duration-200",
                isSelected && "shadow-[0_0_0_2px_rgba(59,130,246,0.5)] z-20"
            )}
            style={{
                left: shape.x,
                top: shape.y,
                width: shape.w,
                height: shape.h,
            }}
        >
            {/* Toolbar */}
            <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-1 pointer-events-auto h-8 bg-black/60 rounded-t-lg border-x border-t border-white/20 backdrop-blur-sm">
                {/* Left: Name */}
                <div className="flex items-center gap-2 pl-2">
                    {isEditingName ? (
                        <div className="flex items-center gap-1">
                            <input
                                autoFocus
                                className="bg-white/10 text-white text-[10px] px-1 py-0.5 rounded outline-none border border-white/20 w-32"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            />
                            <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                                <Check size={12} />
                            </button>
                            <button onClick={() => setIsEditingName(false)} className="text-rose-400 hover:text-rose-300">
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                            <span className="text-white/80 text-[10px] font-medium truncate max-w-[150px]">
                                {shape.name || shape.componentName || 'Generated UI'}
                            </span>
                            <Edit2 size={10} className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>

                {/* Interaction Mode Toggle */}
                <button
                    onClick={() => setIsInteracting(!isInteracting)}
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all border",
                        isInteracting
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-white/5 text-white/40 border-white/10 hover:text-white/80"
                    )}
                >
                    <div className={cn("w-1.5 h-1.5 rounded-full", isInteracting ? "bg-emerald-400 animate-pulse" : "bg-white/20")} />
                    <span className="text-[10px] font-medium">{isInteracting ? 'Live' : 'Interact'}</span>
                </button>

                {/* Middle: Breakpoints */}
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/10">
                    <button
                        onClick={() => handleBreakpoint('mobile')}
                        className={`p-1 rounded-full transition-colors ${shape.breakpoint === 'mobile' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/80'}`}
                        title="Mobile (375px)"
                    >
                        <Smartphone size={12} />
                    </button>
                    <button
                        onClick={() => handleBreakpoint('tablet')}
                        className={`p-1 rounded-full transition-colors ${shape.breakpoint === 'tablet' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/80'}`}
                        title="Tablet (768px)"
                    >
                        <Tablet size={12} />
                    </button>
                    <button
                        onClick={() => handleBreakpoint('desktop')}
                        className={`p-1 rounded-full transition-colors ${shape.breakpoint === 'desktop' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/80'}`}
                        title="Desktop (1280px)"
                    >
                        <Monitor size={12} />
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 pr-1">
                    <button
                        onClick={handleExportDesign}
                        disabled={!shape.uiSpecData}
                        className="p-1 px-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-30"
                    >
                        <Download size={12} />
                        <span className="text-[10px]">Export</span>
                    </button>
                    <button
                        onClick={handleGenerateWorkflow}
                        className="p-1 px-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all flex items-center gap-1.5"
                    >
                        <Workflow size={12} />
                        <span className="text-[10px]">Workflow</span>
                    </button>
                    <button
                        onClick={() => toggleChat(shape.id)}
                        className="p-1 px-2 bg-primary/20 text-primary-foreground hover:bg-primary/30 border border-primary/30 rounded-md transition-all flex items-center gap-1.5"
                    >
                        <MessageCircle size={12} />
                        <span className="text-[10px]">Chat</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative w-full h-full rounded-b-lg border border-white/20 overflow-hidden bg-black/20">
                {/* Selection Overlay - active when NOT interacting */}
                {!isInteracting && (
                    <div
                        className="absolute inset-0 z-10 cursor-default pointer-events-auto"
                        onDoubleClick={() => setIsInteracting(true)}
                    />
                )}

                {shape.uiSpecData ? (
                    <IframeRenderer
                        tsx={shape.uiSpecData}
                        componentName={shape.componentName ?? 'Page'}
                        styleGuide={styleGuide ?? null}
                        shapeId={shape.id}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-white/60">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                            <div className="text-[10px] font-medium tracking-wider uppercase tracking-widest opacity-50">Generating Design</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GeneratedUI
