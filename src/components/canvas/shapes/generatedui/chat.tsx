import { useChatWindow } from '@/hooks/use-canvas'
import { cn } from '@/lib/utils'
import { ChevronLeft, Trash2, ArrowUp, Loader2, X } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/redux/slice/chat/index'

type Props = { generatedUIId: string; isOpen: boolean; onClose: () => void }

const ChatWindow = ({ generatedUIId, isOpen, onClose }: Props) => {
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

    if (!isOpen) return null

    return (
        <div
            className={cn(
                'fixed right-10 top-1/2 -translate-y-1/2 w-[380px] h-[620px] backdrop-blur-2xl bg-white/[0.05] saturate-[180%] border border-white/[0.1] rounded-[28px] z-50 transition-all duration-500 flex flex-col shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden font-sans',
                isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-10 opacity-0 scale-95 pointer-events-none'
            )}
        >
            {/* Liquid Glass Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
                <span className="text-[14px] font-medium tracking-tight text-white/80">Design Chat</span>
                <div className="flex items-center gap-1">
                    {chatState?.messages && chatState.messages.length > 0 && (
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

            {/* Conversation Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-5">
                <div className="flex flex-col gap-6 py-6 pb-10">
                    {!chatState?.messages || chatState.messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 opacity-20">
                            <div className="w-10 h-10 rounded-2xl border border-dashed border-white/50 flex items-center justify-center mb-4">
                                <Loader2 className="w-4 h-4" />
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
                                        'max-w-[88%] rounded-[22px] px-5 py-3.5 text-[14px] leading-[1.6]',
                                        message.role === 'user'
                                            ? 'bg-white/10 text-white rounded-tr-none border border-white/10 shadow-lg'
                                            : 'bg-black/20 text-white/90 rounded-tl-none border border-white/5 backdrop-blur-md'
                                    )}
                                >
                                    <div className="whitespace-pre-wrap">
                                        {message.content}
                                    </div>

                                    {message.isStreaming && (
                                        <div className="flex items-center gap-2 mt-3 text-white/20 text-[12px] font-light">
                                            <Loader2 size={10} className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Input Dashboard - Floating Style */}
            <div className="px-5 py-6 bg-gradient-to-t from-black/20 to-transparent">
                <div className="bg-white/[0.03] rounded-[24px] p-4 border border-white/[0.08] shadow-xl transition-all focus-within:border-white/20 focus-within:bg-white/[0.05]">
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
                        placeholder="Ask for a redesign..."
                        className="w-full bg-transparent text-white placeholder:text-white/20 text-[14px] resize-none focus:outline-none min-h-[60px] max-h-[120px] leading-relaxed scrollbar-hide font-light"
                        disabled={chatState?.isStreaming}
                    />

                    <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || chatState?.isStreaming}
                                className={cn(
                                    "w-10 h-10 rounded-full transition-all duration-300",
                                    inputValue.trim()
                                        ? "bg-white text-black hover:bg-white/90 scale-100 shadow-white/10 shadow-lg"
                                        : "bg-white/5 text-white/20 scale-95 opacity-50"
                                )}
                            >
                                <ArrowUp className="w-4 h-4 stroke-[3px]" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col items-center opacity-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Morphiq Intelligence</p>
                </div>
            </div>
        </div>
    )
}

export default ChatWindow