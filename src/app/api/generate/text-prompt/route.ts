import { ConsumeCreditsQuery, CreditsBalanceQuery, StyleGuideQuery } from "@/convex/query.config"
import { prompts } from "@/prompts"
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { prompt, projectId } = await request.json()

        if (!prompt) {
            return NextResponse.json(
                { error: 'No prompt provided' },
                { status: 400 }
            )
        }

        const { ok: balanceOk, balance: balanceBalance } = await CreditsBalanceQuery()

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

        const styleGuide = await StyleGuideQuery(projectId)
        const guide = (styleGuide?.styleGuide as any)?._valueJSON as unknown as {
            colorSections?: any[]
            typographySections?: any[]
        } || {}

        const colors = guide?.colorSections || []
        const typography = guide?.typographySections || []

        const result = streamText({
            model: anthropic('claude-sonnet-4-6'),
            messages: [
                {
                    role: 'system',
                    content: prompts.textToReactUi.system,
                },
                {
                    role: 'user',
                    content: prompts.textToReactUi.user(prompt, colors, typography),
                },
            ],
            temperature: 0.7,
        })

        const stream = new ReadableStream({
            async start(controller) {
                let accumulatedContent = ''
                try {
                    for await (const chunk of result.textStream) {
                        accumulatedContent += chunk
                        controller.enqueue(new TextEncoder().encode(chunk))
                    }

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

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        })

    } catch (error) {
        console.error('POST /api/generate/text-prompt unhandled error:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
