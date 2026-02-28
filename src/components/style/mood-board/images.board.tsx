import { MoodBoardImage } from '@/hooks/use-styles'
import React from 'react'
import Image from 'next/image'
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

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
    const [previewOpen, setPreviewOpen] = React.useState(false)

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
            <div
                className="relative w-40 h-48 rounded-2xl overflow-hidden bg-white shadow-xl border border-border/20 hover:scale-105 transition-all duration-200 cursor-zoom-in group/image"
                onClick={() => setPreviewOpen(true)}
            >
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
                    onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent
                    className="max-w-[90vw] lg:max-w-[70vw] w-fit p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center"
                    showCloseButton={false}
                >
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    <div className="relative group/preview inline-flex items-center justify-center">
                        <img
                            src={image.preview}
                            alt="Preview fullscreen"
                            className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity z-20 backdrop-blur-sm"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ImagesBoard
