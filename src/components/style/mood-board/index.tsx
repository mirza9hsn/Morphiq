"use client"

import { MoodBoardImage, useMoodBoard } from "@/hooks/use-styles"
import React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import ImagesBoard from "./images.board"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Upload, Trash2 } from "lucide-react"

type Props = {
    guideImages: MoodBoardImage[]
}

const MoodBoard = ({ guideImages }: Props) => {
    const {
        images,
        dragActive,
        removeImage,
        clearAll,
        handleDrag,
        handleDrop,
        handleFileInput,
        canAddMore,
    } = useMoodBoard(guideImages)

    return (
        <div className="flex flex-col gap-6 relative">
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-[32px] p-12 text-center transition-all duration-300 min-h-[450px] flex items-center justify-center overflow-hidden bg-black/20',
                    dragActive
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-white/5 hover:border-white/10'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                </div>

                {images.length === 0 && (
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                            id="mood-board-upload-empty"
                        />
                        <label
                            htmlFor="mood-board-upload-empty"
                            className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                                <Plus className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                            </div>
                            <p className="text-white/40 font-medium group-hover:text-white/60 transition-colors">
                                Drag and drop images here, or use the buttons below
                            </p>
                        </label>
                    </div>
                )}

                {images.length > 0 && (
                    <>
                        {/* Mobile Stacked View */}
                        <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative pointer-events-none">
                                {images.map((image, index) => {
                                    const seed = image.id
                                        .split('')
                                        .reduce((a, b) => a + b.charCodeAt(0), 0)
                                    const random1 = ((seed * 9301 + 49297) % 233280) / 233280
                                    const random2 =
                                        (((seed + 1) * 9301 + 49297) % 233280) / 233280
                                    const random3 =
                                        (((seed + 2) * 9301 + 49297) % 233280) / 233280

                                    const rotation = (random1 - 0.5) * 40 // High tilt
                                    const xOffset = (random2 - 0.5) * 60
                                    const yOffset = (random3 - 0.5) * 60

                                    return (
                                        <div key={`mobile-${image.id}`} className="absolute pointer-events-auto" style={{
                                            left: '50%',
                                            top: '50%',
                                            zIndex: index + 1
                                        }}>
                                            <ImagesBoard
                                                image={image}
                                                removeImage={removeImage}
                                                xOffset={xOffset}
                                                yOffset={yOffset}
                                                rotation={rotation}
                                                zIndex={index + 1}
                                                marginLeft="-80px"
                                                marginTop="-96px"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Desktop Scattered View */}
                        <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
                            <div className="relative w-full max-w-[800px] h-[350px] pointer-events-none">
                                {images.map((image, index) => {
                                    const seed = image.id
                                        .split('')
                                        .reduce((a, b) => a + b.charCodeAt(0), 0)
                                    const random1 = ((seed * 9301 + 49297) % 233280) / 233280
                                    const random3 =
                                        (((seed + 2) * 9301 + 49297) % 233280) / 233280

                                    const spacing = 120
                                    const totalWidth = (images.length - 1) * spacing
                                    const xOffset = (index * spacing) - (totalWidth / 2)
                                    const yOffset = (random3 - 0.5) * 100
                                    const rotation = (random1 - 0.5) * 25

                                    return (
                                        <div key={`desktop-${image.id}`} className="absolute pointer-events-auto" style={{
                                            left: '50%',
                                            top: '50%',
                                            zIndex: index + 1
                                        }}>
                                            <ImagesBoard
                                                image={image}
                                                removeImage={removeImage}
                                                xOffset={xOffset}
                                                yOffset={yOffset}
                                                rotation={rotation}
                                                zIndex={index + 1}
                                                marginLeft="-80px"
                                                marginTop="-96px"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Bottom Right Actions */}
                {images.length > 0 && (
                    <div className="absolute bottom-6 right-6 z-50 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <Button
                            variant="secondary"
                            onClick={clearAll}
                            className="bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white/50 hover:text-red-400 rounded-xl px-4 py-2 h-auto text-xs font-semibold backdrop-blur-sm transition-all duration-300"
                        >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Clear All
                        </Button>

                        {canAddMore && (
                            <div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                    id="mood-board-upload-add-more"
                                />
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-4 py-2 h-auto text-xs font-semibold backdrop-blur-sm"
                                >
                                    <label htmlFor="mood-board-upload-add-more" className="cursor-pointer flex items-center gap-2">
                                        <Upload className="w-3 h-3" />
                                        Add More
                                    </label>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Left: Generate Button */}
            <div className="flex items-center justify-between w-full px-2">
                <Button className="bg-white text-black hover:bg-white/90 rounded-xl px-4 py-2 h-auto text-xs font-bold shadow-lg">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Generate With AI
                </Button>

                {!canAddMore && (
                    <div className="bg-white/5 border border-white/5 rounded-full px-4 py-1.5">
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                            Maximum No. of Images Reached
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MoodBoard
