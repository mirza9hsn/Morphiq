"use client"

import { MoodBoardImage, useMoodBoard } from "@/hooks/use-styles"
import React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import ImagesBoard from "./images.board"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Upload, Trash2, ImageIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRef } from "react"
import { useSearchParams } from "next/navigation"
import GenerateStyleGuideButton from "@/components/buttons/style-guide"
type Props = {
    guideImages: MoodBoardImage[]
}

const AddImageDialog = ({
    children,
    onImagesSelected,
    currentCount,
    maxCount,
}: {
    children: React.ReactNode,
    onImagesSelected: (files: File[]) => void,
    currentCount: number,
    maxCount: number,
}) => {
    const [open, setOpen] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            onImagesSelected(files)
            setOpen(false)
        }
        e.target.value = ''
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const files = Array.from(e.dataTransfer.files)
        const imageFiles = files.filter((file) => file.type.startsWith('image/'))
        if (imageFiles.length > 0) {
            onImagesSelected(imageFiles)
            setOpen(false)
        }
    }

    // handleUrlSubmit removed

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            onImagesSelected(files);
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent
                className="max-w-md bg-gradient-to-br from-[#242424] to-[#1a1a1a] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] text-white p-0 overflow-hidden sm:rounded-[24px]"
                showCloseButton={true}
                onPaste={handlePaste}
            >
                <div className="p-10 flex flex-col items-center">
                    <div className="mb-6 text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-white/90">Add Images</h2>
                        <p className="text-[15px] font-medium text-white/40">Upload files, drag & drop, or paste directly.</p>
                    </div>

                    <div
                        className={cn(
                            'border-[1.5px] border-dashed border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 rounded-lg p-8 text-center transition-all duration-200 cursor-pointer w-full'
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <Upload className="w-8 h-8 text-white/40" />
                            <p className="text-sm text-white/60">
                                Drop images here or <span className="text-blue-400">browse</span>
                                <br />
                                <span className="text-xs text-white/40">
                                    {currentCount}/{maxCount} images uploaded
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const MoodBoard = ({ guideImages }: Props) => {
    const {
        images,
        dragActive,
        addImages,
        addImageFromUrl,
        removeImage,
        clearAll,
        handleDrag,
        handleDrop,
        handleFileInput,
        canAddMore,
    } = useMoodBoard(guideImages)


    const searchParams = useSearchParams()
    const projectId = searchParams.get('project')

    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

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
                        <AddImageDialog onImagesSelected={addImages} currentCount={images.length} maxCount={5}>
                            <button
                                className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 transition-all duration-300 bg-transparent border-none"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                                    <Plus className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                                </div>
                                <p className="text-white/40 font-medium group-hover:text-white/60 transition-colors">
                                    Click or drop to add images
                                </p>
                            </button>
                        </AddImageDialog>
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
                            <AddImageDialog onImagesSelected={addImages} currentCount={images.length} maxCount={5}>
                                <Button
                                    variant="secondary"
                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-4 py-2 h-auto text-xs font-semibold backdrop-blur-sm cursor-pointer"
                                >
                                    <Upload className="w-3 h-3 mr-2" />
                                    Add More
                                </Button>
                            </AddImageDialog>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Left: Generate Button */}
            <div className="flex items-center justify-between w-full px-2">

                <GenerateStyleGuideButton
                    images={images}
                    fileInputRef={fileInputRef}
                    projectId={projectId ?? ''}
                />

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
