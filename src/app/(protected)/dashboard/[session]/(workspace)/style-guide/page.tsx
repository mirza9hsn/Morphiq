import { Tabs, TabsContent } from '@/components/ui/tabs'
import { MoodBoardImagesQuery, StyleGuideQuery } from '@/convex/query.config'
import React from 'react'
import { StyleGuide } from '@/redux/api/style-guide'
import { MoodBoardImage } from '@/hooks/use-styles'
import { Palette } from 'lucide-react'
import { ThemeContent } from '@/components/style/theme'
import StyleGuideTypography from '@/components/style/typography'
import MoodBoard from '@/components/style/mood-board'


type Props = {
    searchParams: Promise<{
        project: string
        tab?: string
    }>
}

const Page = async ({ searchParams }: Props) => {
    const { project: projectId, tab = 'colours' } = await searchParams

    // Guard: Prevent Convex error if no project is selected
    if (!projectId || projectId === 'null') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Palette className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-xl font-semibold text-white">No Project Selected</h3>
                <p className="text-zinc-500 mt-2 text-center max-w-xs">
                    Please select a project from the navigation to view its style guide.
                </p>
            </div>
        )
    }

    const existingStyleGuide = await StyleGuideQuery(projectId)

    const guide = existingStyleGuide.styleGuide
        ?._valueJSON as unknown as StyleGuide

    const colorGuide = guide?.colorSections || []
    const typographyGuide = guide?.typographySections || []

    const existingMoodBoardImages = await MoodBoardImagesQuery(projectId)
    const guideImages = existingMoodBoardImages.images
        ._valueJSON as unknown as MoodBoardImage[]

    return (
        <div>
            <Tabs
                defaultValue="colours"
                value={tab}
            >
                <TabsContent
                    value="colours"
                    className="space-y-8"
                >
                    {!guideImages.length ? (
                        <div className="space-y-8">
                            <div className="text-center py-20">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                                    <Palette className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    No colors generated yet
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                                    Upload images to your mood board and generate an AI-powered
                                    style guide with colors and typography.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ThemeContent colorGuide={colorGuide} />
                    )}
                </TabsContent>

                <TabsContent value="typography">
                    <StyleGuideTypography typographyGuide={typographyGuide} />
                </TabsContent>
                <TabsContent value="moodboard">
                    <MoodBoard guideImages={guideImages} />
                </TabsContent>
            </Tabs>
        </div >
    )
}

export default Page