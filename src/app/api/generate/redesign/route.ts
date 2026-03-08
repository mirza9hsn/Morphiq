/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { prompts } from '@/prompts'
import {
    ConsumeCreditsQuery,
    CreditsBalanceQuery,
    StyleGuideQuery,
    InspirationImagesQuery,
} from '@/convex/query.config'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            userMessage,
            generatedUIId,
            currentTsx,
            wireframeSnapshot,
            projectId,
        } = body

        if (!userMessage || !generatedUIId || !projectId) {
            return NextResponse.json(
                {
                    error: 'Missing required fields: userMessage, generatedUIId, projectId',
                },
                { status: 400 }
            )
        }

        const { ok: balanceOk, balance: balanceBalance } =
            await CreditsBalanceQuery()
        if (!balanceOk || balanceBalance === 0) {
            return NextResponse.json(
                { error: 'No credits available' },
                { status: 400 }
            )
        }

        const styleGuide = await StyleGuideQuery(projectId)
        const styleGuideData = styleGuide.styleGuide._valueJSON as unknown as {
            colorSections: unknown[]
            typographySections: unknown[]
        }

        const inspirationResult = await InspirationImagesQuery(projectId)
        const images = inspirationResult.images._valueJSON as unknown as {
            url: string
        }[]
        const imageIds = images.map((img) => img.url).filter(Boolean)

        const colors = styleGuideData?.colorSections || []
        const typography = styleGuideData?.typographySections || []

        const userPrompt = prompts.redesignTsx.user(
            userMessage,
            currentTsx ?? null,
            wireframeSnapshot ?? null,
            colors,
            typography
        )

        const result = await streamText({
            model: anthropic('claude-sonnet-4-6'),
            messages: [
                {
                    role: 'system',
                    content: prompts.reactUi.system,
                    providerOptions: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: userPrompt,
                        },
                        ...imageIds.map((url) => ({
                            type: 'image' as const,
                            image: url,
                        })),
                        ...(wireframeSnapshot
                            ? [{ type: 'image' as const, image: wireframeSnapshot }]
                            : []),
                    ],
                },
            ],
            temperature: 0.7,
        })

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let hasContent = false
                    for await (const chunk of result.textStream) {
                        hasContent = true
                        controller.enqueue(new TextEncoder().encode(chunk))
                    }

                    if (hasContent) {
                        await ConsumeCreditsQuery({ amount: 1 })
                    }
                    controller.close()
                } catch (error) {
                    controller.error(error)
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        })
    } catch (error) {
        console.error('Redesign API error:', error)
        return NextResponse.json(
            {
                error: 'Failed to process redesign request',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
