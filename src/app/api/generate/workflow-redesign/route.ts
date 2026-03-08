/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { prompts } from '@/prompts'
import {
    ConsumeCreditsQuery,
    CreditsBalanceQuery,
    StyleGuideQuery,
} from '@/convex/query.config'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userMessage, generatedUIId, currentHTML, projectId } = body

        if (!userMessage || !generatedUIId || !currentHTML || !projectId) {
            return NextResponse.json(
                {
                    error: 'Missing required fields: userMessage, generatedUIId, currentHTML, projectId',
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

        const userPrompt = prompts.workflowRedesignTsx.user(
            userMessage,
            currentHTML,
            styleGuideData
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
                        // Fixed: was charging 4 credits, now correctly charges 1
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
        console.error(error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
