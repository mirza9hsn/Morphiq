

import { ConsumeCreditsQuery, CreditsBalanceQuery, InspirationImagesQuery, StyleGuideQuery } from "@/convex/query.config"
import { prompts } from "@/prompts"
import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const imageFile = formData.get('image') as File
        const projectId = formData.get('projectId') as string

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            )
        }

        const { ok: balanceOk, balance: balanceBalance } =
            await CreditsBalanceQuery()

        if (!balanceOk) {
            return NextResponse.json(
                { error: 'Failed to get balance' },
                { status: 500 }
            )
        }

        if (balanceBalance === 0) {
            return NextResponse.json(
                { error: 'No credits available' },
                { status: 400 }
            )
        }

        const imageBuffer = await imageFile.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        const styleGuide = await StyleGuideQuery(projectId)

        // Robustly extract guide data with defaults
        const guide = (styleGuide?.styleGuide as any)?._valueJSON as unknown as {
            colorSections?: string[]
            typographySections?: string[]
        } || {}

        const inspirationImages = await InspirationImagesQuery(projectId)
        const images = (inspirationImages?.images as any)?._valueJSON as unknown as {
            url: string
        }[] || []
        const imageUrls = images.map((img: any) => img.url).filter(Boolean)
        const colors = guide?.colorSections || []
        const typography = guide?.typographySections || []
        const systemPrompt = prompts.generativeUi.system
        const userPrompt = prompts.generativeUi.user(colors, typography)

        console.log('Generating UI with model: claude-sonnet-4-6')

        const result = streamText({
            model: anthropic('claude-sonnet-4-6'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: userPrompt,
                        },
                        {
                            type: 'image',
                            image: base64Image,
                        },
                        ...imageUrls.map((url) => ({
                            type: 'image' as const,
                            image: url,
                        })),
                    ],
                },
            ],
            system: systemPrompt,
            temperature: 0.7,
        })

        const stream = new ReadableStream({
            async start(controller) {
                let totalChunks = 0
                let totalLength = 0
                let accumulatedContent = ''

                try {
                    for await (const chunk of result.textStream) {
                        totalChunks++
                        totalLength += chunk.length
                        accumulatedContent += chunk

                        // Stream the HTML markup text
                        const encoder = new TextEncoder()
                        controller.enqueue(encoder.encode(chunk))
                    }

                    // Consume credits after successful generation
                    if (accumulatedContent.length > 0) {
                        await ConsumeCreditsQuery({ amount: 1 })
                    }

                    controller.close()
                } catch (error) {
                    console.error('Streaming error:', error)
                    controller.error(error)
                }
            }
        })

        try {
            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            })
        } catch (error) {
            console.error('Response error:', error)
            return NextResponse.json(
                {
                    error: 'Failed to generate UI design',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('POST /api/generate unhandled error:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}