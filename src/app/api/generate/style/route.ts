import { ConsumeCreditsQuery, CreditsBalanceQuery, MoodBoardImagesQuery } from '@/convex/query.config'
import { MoodBoardImage } from '@/hooks/use-styles'
import { prompts } from '@/prompts'
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { z } from 'zod'
import { anthropic } from '@ai-sdk/anthropic'
import { fetchMutation } from 'convex/nextjs'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import styleGuide from '@/components/buttons/style-guide'

const ColorSwatchSchema = z.object({
    name: z.string(),
    hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
    description: z.string().optional(),
})

const ColorSectionSchema = z.object({
    title: z.string(),
    swatches: z.array(ColorSwatchSchema),
})

const TypographyStyleSchema = z.object({
    name: z.string(),
    fontFamily: z.string(),
    fontSize: z.string(),
    fontWeight: z.string(),
    lineHeight: z.string(),
    letterSpacing: z.string().optional(),
    description: z.string().optional(),
})

const TypographySectionSchema = z.object({
    title: z.string(),
    styles: z.array(TypographyStyleSchema),
})

const StyleGuideSchema = z.object({
    theme: z.string(),
    description: z.string(),
    colorSections: z.array(ColorSectionSchema),
    typographySections: z.array(TypographySectionSchema),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { projectId } = body
        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
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

        const moodBoardImages = await MoodBoardImagesQuery(projectId)
        if (!moodBoardImages || moodBoardImages.images._valueJSON.length === 0) {
            return NextResponse.json(
                {
                    error: 'No mood board images found. Please upload images to the mood board first.',
                },
                { status: 400 }
            )
        }

        const images = moodBoardImages.images._valueJSON as unknown as MoodBoardImage[]
        const imageUrls = images.map((img) => img.url).filter(Boolean)

        const systemPrompt = prompts.styleGuide.system
        const userPrompt = prompts.styleGuide.user(imageUrls.length)

        const result = await generateObject({
            model: anthropic('claude-sonnet-4-6'),
            schema: StyleGuideSchema,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: userPrompt,
                        },
                        ...imageUrls.map((url) => ({
                            type: 'image' as const,
                            image: url as string,
                        })),
                    ],
                },
            ],
        })

        const { ok, balance } = await ConsumeCreditsQuery({ amount: 1 })
        if (!ok) {
            return NextResponse.json(
                { error: 'Failed to generate style guide' },
                { status: 500 }
            )
        }

        await fetchMutation(
            api.projects.updateProjectStyleGuide,
            {
                projectId: projectId as Id<'projects'>,
                styleGuideData: result.object,
            },
            { token: await convexAuthNextjsToken() }
        )

        return NextResponse.json({
            success: true,
            styleGuide: result.object,
            message: 'Style guide generated successfully',
            balance,
        })
    } catch (error) {
        console.error('Error generating style guide:', error)
        return NextResponse.json(
            {
                error: 'Failed to generate style guide',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}