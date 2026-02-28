import { Info, Type } from "lucide-react"
import React from 'react'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
    typographyGuide: any
}

const StyleGuideTypography = ({ typographyGuide }: Props) => {
    return (
        <>
            {typographyGuide.length === 0 ? (
                <div className="text-center py-20">
                    <Type className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        No typography generated yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Generate a style guide to see typography recommendations.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-16 py-4">
                    {typographyGuide.map((section: any, index: number) => (
                        <div
                            key={index}
                            className="flex flex-col gap-8"
                        >
                            <div>
                                <h3 className="text-[13px] font-medium text-foreground/40 border-b border-white/5 pb-3">
                                    {section.title}
                                </h3>
                            </div>
                            <div className="flex flex-col gap-10">
                                {section.styles?.map((style: any, styleIndex: number) => (
                                    <div
                                        key={styleIndex}
                                        className="flex flex-col gap-4"
                                    >
                                        <div className="space-y-1">
                                            <h4 className="text-[13px] font-bold text-foreground">
                                                {style.name}
                                            </h4>
                                            {style.description && (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[11px] text-muted-foreground/60">
                                                        {style.description}
                                                    </p>
                                                    <TooltipProvider delayDuration={100}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-foreground cursor-pointer transition-colors" />
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right" align="center" className="bg-[#1c1c1c] border-white/10 text-white p-3 shadow-xl">
                                                                <div className="text-xs space-y-1.5 opacity-80 font-medium">
                                                                    <div><span className="font-semibold opacity-100">Font:</span> {style.fontFamily}</div>
                                                                    <div><span className="font-semibold opacity-100">Size:</span> {style.fontSize}</div>
                                                                    <div><span className="font-semibold opacity-100">Weight:</span> {style.fontWeight}</div>
                                                                    <div><span className="font-semibold opacity-100">Line Height:</span> {style.lineHeight}</div>
                                                                    {style.letterSpacing && (
                                                                        <div><span className="font-semibold opacity-100">Letter Spacing:</span> {style.letterSpacing}</div>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="text-foreground"
                                            style={{
                                                fontFamily: style.fontFamily,
                                                fontSize: style.fontSize,
                                                fontWeight: style.fontWeight,
                                                lineHeight: style.lineHeight,
                                                letterSpacing: style.letterSpacing || 'normal',
                                            }}
                                        >
                                            The quick brown fox jumps over the lazy dog
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div >
            )}
        </>
    )
}

export default StyleGuideTypography