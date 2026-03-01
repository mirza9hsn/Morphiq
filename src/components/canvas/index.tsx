'use client'
import { useInfiniteCanvas, useInspiration } from '@/hooks/use-canvas'
import React from 'react'
import TextSidebar from './text-sidebar'
import { cn } from '@/lib/utils'
import ShapeRenderer from './shapes'
import { FramePreview } from './shapes/frame/preview'
import { RectanglePreview } from './shapes/rectangle/preview'
import { ElipsePreview } from './shapes/elipse/preview'
import { ArrowPreview } from './shapes/arrow/preview'
import { LinePreview } from './shapes/line/preview'
import { FreeDrawStrokePreview } from './shapes/stroke/preview'
import { SelectionOverlay } from './shapes/selection'
import InspirationSidebar from './shapes/inspiration-sidebar'
import { useGlobalChat } from '@/hooks/use-canvas'

type Props = {}



const InfiniteCanvas = (props: Props) => {
    const {
        viewport,
        shapes,
        currentTool,
        selectedShapes,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        attachCanvasRef,
        getDraftShape,
        getFreeDrawPoints,
        isSidebarOpen,
        hasSelectedText,
    } = useInfiniteCanvas()


    const { isInspirationOpen, closeInspiration, toggleInspiration } = useInspiration()
    const { isChatOpen, activeGeneratedUId, generateWorkflow, exportDesign } = useGlobalChat()
    const draft = getDraftShape()
    const freeDrawPts = getFreeDrawPoints()

    return (
        <>
            <TextSidebar isOpen={isSidebarOpen && hasSelectedText} />
            <InspirationSidebar isOpen={isInspirationOpen} onClose={closeInspiration} />
            {/* ChatWindow */}

            <div
                ref={attachCanvasRef}
                role="application"
                aria-label="Infinite drawing canvas"
                className={cn(
                    'relative w-full h-screen overflow-hidden select-none z-0',
                    {
                        'cursor-grabbing': viewport.mode === 'panning',
                        'cursor-grab': viewport.mode === 'shiftPanning',
                        'cursor-crosshair':
                            currentTool !== 'select' && viewport.mode === 'idle',
                        'cursor-default':
                            currentTool === 'select' && viewport.mode === 'idle',
                    }
                )}
                style={{ touchAction: 'none' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
            >
                <div
                    className="absolute origin-top-left pointer-events-none z-10 canvas-shapes-layer"
                    style={{
                        transform: `translate3d(${viewport.translate.x}px, ${viewport.translate.y}px, 0) scale(${viewport.scale})`,
                        transformOrigin: '0 0',
                        willChange: 'transform',
                    }}
                >
                    {shapes.map((shape) => (
                        <ShapeRenderer
                            key={shape.id}
                            shape={shape}
                            toggleInspiration={toggleInspiration}
                            // toggleChat={toggleChat}
                            // exportDesign={exportDesign}
                            generateWorkflow={generateWorkflow}
                        />
                    ))}

                    {shapes.map((shape) => (
                        <SelectionOverlay
                            key={`selection-${shape.id}`}
                            shape={shape}
                            isSelected={!!selectedShapes[shape.id]}
                        />
                    ))}
                    {/* Draft Shape Previews */}
                    {draft && draft.type === 'frame' && (
                        <FramePreview
                            startWorld={draft.startWorld}
                            currentWorld={draft.currentWorld}
                        />
                    )}
                    {draft && draft.type === 'rect' && (
                        <RectanglePreview
                            startWorld={draft.startWorld}
                            currentWorld={draft.currentWorld}
                        />
                    )}
                    {draft && draft.type === 'ellipse' && (
                        <ElipsePreview
                            startWorld={draft.startWorld}
                            currentWorld={draft.currentWorld}
                        />
                    )}
                    {draft && draft.type === 'arrow' && (
                        <ArrowPreview
                            startWorld={draft.startWorld}
                            currentWorld={draft.currentWorld}
                        />
                    )}
                    {draft && draft.type === 'line' && (
                        <LinePreview
                            startWorld={draft.startWorld}
                            currentWorld={draft.currentWorld}
                        />
                    )}
                    {currentTool === 'freedraw' && freeDrawPts.length > 1 && (
                        <FreeDrawStrokePreview points={freeDrawPts} />
                    )}
                </div>
            </div>
        </>
    )
}

export default InfiniteCanvas