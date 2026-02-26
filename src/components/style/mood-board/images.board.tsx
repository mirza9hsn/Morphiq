import { MoodBoardImage } from '@/hooks/use-styles'
import React from 'react'
import Image from 'next/image'
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    image: MoodBoardImage
    removeImage: (id: string) => void
    xOffset: number
    yOffset: number
    rotation: number
    zIndex: number
    marginLeft: string
    marginTop: string
}

const UploadStatus = ({ uploading, uploaded, error }: {
    uploading: boolean
    uploaded: boolean
    error?: string
}) => {
    if (uploading) {
        return (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 z-10">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-tight">Uploading</span>
                </div>
            </div>
        )
    }
    if (uploaded) {
        return (
            <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="absolute top-2 right-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
        )
    }

    return null
}

const ImagesBoard = ({
    image,
    removeImage,
    xOffset,
    yOffset,
    rotation,
    zIndex,
    marginLeft,
    marginTop,
}: Props) => {
    return (
        <div
            key={`board-${image.id}`}
            className="absolute group"
            style={{
                transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`,
                zIndex: zIndex,
                left: '50%',
                top: '50%',
                marginLeft: marginLeft,
                marginTop: marginTop,
            }}
        >
            <div className="relative w-40 h-48 rounded-2xl overflow-hidden bg-white shadow-xl border border-border/20 hover:scale-105 transition-all duration-200">
                <Image
                    src={image.preview}
                    alt="Mood board image"
                    fill
                    className="object-cover"
                />
                <UploadStatus
                    uploading={image.uploading}
                    uploaded={image.uploaded}
                    error={image.error}
                />
                <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    )
}

export default ImagesBoard
