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
        const { userMessage, generatedUIId, currentHTML, projectId } =
            body

        if (!userMessage || !generatedUIId || !currentHTML ||
            !projectId) {
            return NextResponse.json(
                {
                    error:
                        'Missing required fields: userMessage, generatedUIId, currentHTML, projectId',
                },
                { status: 400 }
            )
        }

        // Check credits
        const { ok: balanceOk, balance: balanceBalance } =
            await CreditsBalanceQuery()
        if (!balanceOk || balanceBalance === 0) {
            return NextResponse.json(
                { error: 'No credits available' },
                { status: 400 }
            )
        }

        // Consume credits
        const { ok } = await ConsumeCreditsQuery({ amount: 4 })
        if (!ok) {
            return NextResponse.json(
                { error: 'Failed to consume credits' },
                { status: 500 }
            )
        }

        console.log(currentHTML, 'currentHTML')

        const styleGuide = await StyleGuideQuery(projectId)
        const styleGuideData = styleGuide.styleGuide._valueJSON as unknown as {
            colorSections: unknown[]
            typographySections: unknown[]
        }

        // Build the user prompt for workflow page regeneration
        const userPrompt = prompts.workflowRedesign.user(
            userMessage,
            currentHTML,
            styleGuideData
        )

        // Create streaming response for workflow page regeneration
        const result = await streamText({
            model: anthropic('claude-sonnet-4-6'),
            messages: [
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
            system: prompts.generativeUi.system,
            temperature: 0.7,
        })

        // Convert to streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.textStream) {
                        const encoder = new TextEncoder()
                        controller.enqueue(encoder.encode(chunk))
                    }
                    controller.close()
                } catch (error) {
                    controller.error(error)
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
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