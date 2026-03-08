import { useChatWindow } from '@/hooks/use-canvas'
import { cn } from '@/lib/utils'
import { ChevronLeft, Trash2, ArrowUp, Loader2, X, Code, MessageSquare, Download, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/redux/slice/chat/index'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

type Props = { generatedUIId: string; isOpen: boolean; onClose: () => void }

const ChatWindow = ({ generatedUIId, isOpen, onClose }: Props) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'code'>('chat')
    const [copied, setCopied] = useState(false)
    const shape = useSelector((state: RootState) => state.shapes.shapes.entities[generatedUIId])

    const {
        inputValue,
        setInputValue,
        scrollAreaRef,
        inputRef,
        handleSendMessage,
        handleKeyPress,
        handleClearChat,
        chatState,
    } = useChatWindow(generatedUIId, isOpen)

    if (!isOpen || !shape || shape.type !== 'generatedui') return null

    const handleCopyCode = () => {
        const code = shape.streamingTsx ?? shape.uiSpecData
        if (!code) return
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const code = shape.streamingTsx ?? shape.uiSpecData
        if (!code) return
        const blob = new Blob([code], { type: 'text/typescript' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${shape.name || shape.componentName || 'GeneratedComponent'}.tsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div
            className={cn(
                'fixed right-10 top-1/2 -translate-y-1/2 w-[420px] h-[680px] backdrop-blur-3xl bg-black/40 border border-white/10 rounded-[32px] z-50 transition-all duration-500 flex flex-col shadow-2xl overflow-hidden font-sans',
                isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-10 opacity-0 scale-95 pointer-events-none'
            )}
        >
            {/* Header / Tabs */}
            <div className="flex flex-col border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors",
                                activeTab === 'chat' ? "text-white" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <MessageSquare size={16} />
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors",
                                activeTab === 'code' ? "text-white" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <Code size={16} />
                            Code
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        {activeTab === 'chat' && chatState?.messages && chatState.messages.length > 0 && (
                            <button
                                onClick={handleClearChat}
                                className="p-2 text-white/40 hover:text-red-400 transition-all rounded-full hover:bg-white/5"
                                title="Clear Chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-white/40 hover:text-white transition-all rounded-full hover:bg-white/5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* Tab Indicator */}
                <div className="px-6 relative h-0.5">
                    <div
                        className="absolute h-full bg-primary transition-all duration-300"
                        style={{
                            left: activeTab === 'chat' ? '24px' : '92px',
                            width: activeTab === 'chat' ? '56px' : '62px'
                        }}
                    />
                </div>
            </div>

            {/* Content Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1">
                {activeTab === 'chat' ? (
                    <div className="flex flex-col gap-6 py-6 px-5 pb-10">
                        {!chatState?.messages || chatState.messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 opacity-20">
                                <div className="w-12 h-12 rounded-2xl border border-dashed border-white/50 flex items-center justify-center mb-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                                <p className="text-[10px] font-bold tracking-[0.4em] uppercase">Initialising AI</p>
                            </div>
                        ) : (
                            chatState.messages.map((message: ChatMessage) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500',
                                        message.role === 'user' ? 'items-end' : 'items-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[90%] rounded-[24px] px-5 py-4 text-[14px] leading-[1.6]',
                                            message.role === 'user'
                                                ? 'bg-white/10 text-white rounded-tr-none border border-white/10 shadow-lg'
                                                : 'bg-white/[0.03] text-white/90 rounded-tl-none border border-white/5 backdrop-blur-md'
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap">
                                            {message.content}
                                        </div>

                                        {message.isStreaming && (
                                            <div className="flex items-center gap-2 mt-4 text-white/20 text-[12px] font-light">
                                                <Loader2 size={12} className="animate-spin" />
                                                <span>Processing redesign...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="p-5 flex flex-col gap-4 h-full min-h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                                {shape.componentName || 'GeneratedComponent'}.tsx
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-[11px] text-white/60 hover:text-white"
                                >
                                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-full border border-primary/20 transition-all text-[11px] text-primary-foreground hover:text-white"
                                >
                                    <Download size={12} />
                                    Download
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative group">
                            <pre className="text-[12px] font-mono leading-relaxed p-6 bg-black/40 rounded-2xl border border-white/5 overflow-auto text-white/80 selection:bg-primary/30 scrollbar-thin scrollbar-thumb-white/10 h-full max-h-[480px]">
                                <code>{shape.streamingTsx || shape.uiSpecData || '// No code generated yet'}</code>
                            </pre>
                            {shape.streamingTsx && (
                                <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] text-primary font-medium animate-pulse">
                                    <Loader2 size={10} className="animate-spin" />
                                    Streaming code...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>

            {/* Input Dashboard - Only for Chat */}
            {activeTab === 'chat' && (
                <div className="px-5 py-6 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="bg-white/[0.04] rounded-[28px] p-5 border border-white/[0.08] shadow-2xl transition-all focus-within:border-primary/40 focus-within:bg-white/[0.06] backdrop-blur-md">
                        <textarea
                            ref={inputRef as any}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                            placeholder="Describe how to refine this design..."
                            className="w-full bg-transparent text-white placeholder:text-white/20 text-[14px] resize-none focus:outline-none min-h-[60px] max-h-[120px] leading-relaxed scrollbar-hide font-light"
                            disabled={chatState?.isStreaming}
                        />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.03]">
                            <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium">Redesign Mode</span>
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || chatState?.isStreaming}
                                className={cn(
                                    "w-10 h-10 rounded-full transition-all duration-300",
                                    inputValue.trim()
                                        ? "bg-primary text-primary-foreground hover:scale-110 shadow-lg shadow-primary/20"
                                        : "bg-white/5 text-white/10 scale-95 opacity-50"
                                )}
                            >
                                <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pb-4 flex flex-col items-center opacity-5">
                <p className="text-[9px] font-black uppercase tracking-[0.5em]">Morphiq Engine v2</p>
            </div>
        </div>
    )
}

export default ChatWindow