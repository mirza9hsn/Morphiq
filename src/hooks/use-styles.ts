"use client"

import { useForm } from "react-hook-form"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { toast } from "sonner"
import { Id } from "../../convex/_generated/dataModel"

export interface MoodBoardImage {
    id: string
    file?: File // Optional for server-loaded images
    preview: string // Local preview URL or Convex URL
    storageId?: string
    uploaded: boolean
    uploading: boolean
    error?: string
    url?: string // Convex URL for uploaded images
    isFromServer?: boolean // Track if image came from server
}

interface StylesFormData {
    images: MoodBoardImage[]
}

export const useMoodBoard = (guideImages: MoodBoardImage[]) => {
    const [dragActive, setDragActive] = useState(false)
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project')

    const form = useForm<StylesFormData>({
        defaultValues: {
            images: [],
        },
    })

    const { watch, setValue, getValues } = form
    const images = watch('images')

    const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl)
    const removeMoodBoardImage = useMutation(api.moodboard.removeMoodBoardImage)
    const addMoodBoardImage = useMutation(api.moodboard.addMoodBoardImage)
    const clearMoodBoard = useMutation(api.moodboard.clearMoodBoard)

    const uploadImage = useCallback(async (
        file: File
    ): Promise<{ storageId: string; url?: string }> => {

        try {
            const uploadUrl = await generateUploadUrl()

            const result = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            })

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.statusText}`)
            }

            const { storageId } = await result.json()

            // Step 3: Associate with project if we have a project ID
            if (projectId) {
                await addMoodBoardImage({
                    projectId: projectId as Id<'projects'>,
                    storageId: storageId as Id<'_storage'>,
                })
            }
            return { storageId }
        } catch (error) {
            console.error(error)
            toast.error('Failed to upload image')
            return { storageId: '' }
        }
    }, [generateUploadUrl, addMoodBoardImage, projectId])

    useEffect(() => {
        if (!guideImages) return

        const serverImages: MoodBoardImage[] = guideImages.map((img: any) => ({
            id: img.id,
            preview: img.url,
            storageId: img.storageId,
            uploaded: true,
            uploading: false,
            url: img.url,
            isFromServer: true,
        }))

        const currentImages = getValues('images')

        // Case 1: Client has no images, just accept server state
        if (currentImages.length === 0) {
            // Only update if server actually has images (prevents unnecessary re-renders)
            if (serverImages.length > 0) {
                setValue('images', serverImages)
            }
            return
        }

        // Case 2: Client has images, merge carefully
        // Local-only images (uploaded: false) should ALWAYS stay
        // Server images (uploaded: true) should stay ONLY if they still exist on server
        const localImages = currentImages.filter(img => !img.uploaded)
        const serverMatchedImages = currentImages.filter(img =>
            img.uploaded && serverImages.some(s => s.storageId === img.storageId)
        )

        // Find new server images that aren't in client state yet
        const newServerImages = serverImages.filter(s =>
            !currentImages.some(c => c.storageId === s.storageId)
        )

        const merged = [...localImages, ...serverMatchedImages, ...newServerImages]

        // Only update if there's a real difference
        if (JSON.stringify(merged) !== JSON.stringify(currentImages)) {
            setValue('images', merged)
        }
    }, [guideImages, setValue, getValues])


    const addImages = (files: File[]) => {
        const currentImages = getValues('images')
        const remainingSlots = 5 - currentImages.length

        if (remainingSlots <= 0) {
            toast.error('Maximum 5 images allowed')
            return
        }

        const filesToAdd = files.slice(0, remainingSlots)
        const skippedCount = files.length - filesToAdd.length

        const newImages: MoodBoardImage[] = filesToAdd.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            uploaded: false,
            uploading: false,
            isFromServer: false,
        }))

        const updatedImages = [...currentImages, ...newImages]
        setValue('images', updatedImages)

        if (filesToAdd.length > 0) {
            toast.success(`${filesToAdd.length} image(s) added`)
        }

        if (skippedCount > 0) {
            toast.warning(`${skippedCount} image(s) skipped (max 5)`)
        }
    }

    const removeImage = async (imageId: string) => {
        const currentImages = getValues('images')
        const imageToRemove = currentImages.find((img) => img.id === imageId)
        if (!imageToRemove) return

        // If it's a server image with storageId, remove from Convex
        if (imageToRemove.isFromServer && imageToRemove.storageId && projectId) {
            try {
                await removeMoodBoardImage({
                    projectId: projectId as Id<'projects'>,
                    storageId: imageToRemove.storageId as Id<'_storage'>,
                })
            } catch (error) {
                console.error(error)
                toast.error('Failed to remove image from server')
                return
            }
        }

        const updatedImages = currentImages.filter((img) => {
            if (img.id === imageId) {
                // Clean up preview URL only for local images
                if (!img.isFromServer && img.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(img.preview)
                }
                return false
            }
            return true
        })

        setValue('images', updatedImages)
        toast.success('Image removed')
    }

    const clearAll = useCallback(async () => {
        const currentImages = getValues('images')
        if (currentImages.length === 0) return

        // 1. Revoke local URLs
        currentImages.forEach(img => {
            if (!img.isFromServer && img.preview.startsWith('blob:')) {
                URL.revokeObjectURL(img.preview)
            }
        })

        // 2. Clear state immediately for UI responsiveness
        setValue('images', [])

        // 3. Atomic server cleanup
        if (projectId) {
            try {
                await clearMoodBoard({
                    projectId: projectId as Id<'projects'>
                })
            } catch (error) {
                console.error('Failed to clear mood board:', error)
                toast.error('Failed to clear mood board on server')
            }
        }
        toast.success('Mood board cleared')
    }, [getValues, setValue, projectId, clearMoodBoard])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files)
        const imageFiles = files.filter((file) => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
            toast.error('Please drop image files only')
            return
        }

        addImages(imageFiles)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            addImages(files)
        }

        // Reset input
        e.target.value = ''
    }


    useEffect(() => {
        const uploadPendingImages = async () => {
            const currentImages = getValues('images')
            let hasChanges = false
            const updatedImages = [...currentImages]

            for (let i = 0; i < updatedImages.length; i++) {
                const image = updatedImages[i]
                if (!image.uploaded && !image.uploading && !image.error && image.file) {
                    updatedImages[i] = { ...image, uploading: true }
                    hasChanges = true
                }
            }

            if (hasChanges) {
                setValue('images', updatedImages)

                // Process uploads
                for (let i = 0; i < updatedImages.length; i++) {
                    const image = updatedImages[i]
                    if (image.uploading && !image.uploaded && image.file) {
                        try {
                            const { storageId } = await uploadImage(image.file)
                            const latestImages = getValues('images')
                            const index = latestImages.findIndex(img => img.id === image.id)
                            if (index !== -1) {
                                const newImages = [...latestImages]
                                newImages[index] = {
                                    ...newImages[index],
                                    storageId,
                                    uploaded: true,
                                    uploading: false,
                                    isFromServer: true,
                                }
                                setValue('images', newImages)
                            }
                        } catch (error) {
                            console.error(error)
                            const latestImages = getValues('images')
                            const index = latestImages.findIndex(img => img.id === image.id)
                            if (index !== -1) {
                                const newImages = [...latestImages]
                                newImages[index] = {
                                    ...newImages[index],
                                    uploading: false,
                                    error: 'Upload failed',
                                }
                                setValue('images', newImages)
                            }
                        }
                    }
                }
            }
        }

        uploadPendingImages()
    }, [images, getValues, setValue, uploadImage]) // Watch images to trigger uploads

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            const currentImages = getValues('images')
            currentImages.forEach((image) => {
                if (image.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(image.preview)
                }
            })
        }
    }, [getValues])

    return {
        form,
        images,
        dragActive,
        addImages,
        removeImage,
        clearAll,
        handleDrag,
        handleDrop,
        handleFileInput,
        canAddMore: images.length < 5,
    }
}
