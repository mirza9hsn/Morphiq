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
        const { generatedUIId, currentHTML, projectId, pageIndex } = body

        if (
            !generatedUIId ||
            !currentHTML ||
            !projectId ||
            pageIndex === undefined
        ) {
            return NextResponse.json(
                {
                    error: 'Missing required fields: generatedUIId, currentHTML, projectId, pageIndex',
                },
                { status: 400 }
            )
        }

        const { ok: balanceOk, balance: balanceBalance } = await CreditsBalanceQuery()
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
        const imageUrls = images.map((img) => img.url).filter(Boolean)

        const colors = styleGuideData?.colorSections || []
        const typography = styleGuideData?.typographySections || []

        const pageTypes = [
            'Dashboard/Analytics page with charts, metrics, and KPIs',
            'Settings/Configuration page with preferences and account management',
            'User Profile page with personal information and activity',
            'Data Listing/Table page with search, filters, and pagination',
        ]

        const selectedPageType = pageTypes[pageIndex] || pageTypes[0]

        const userPrompt = prompts.workflowTsx.user(
            selectedPageType,
            currentHTML,
            colors,
            typography,
            imageUrls.length
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
                        ...imageUrls.map((url) => ({
                            type: 'image' as const,
                            image: url,
                        })),
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
        console.error('Workflow generation API error:', error)
        return NextResponse.json(
            {
                error: 'Failed to process workflow generation request',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
