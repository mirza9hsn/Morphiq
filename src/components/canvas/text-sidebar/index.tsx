'use client'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { updateShape, TextShape } from '@/redux/slice/shapes'
import { getAvailableFonts } from '@/lib/fonts'
import { Toggle } from '@/components/ui/toggle'
import { Bold, Italic, Underline, Strikethrough, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Props = {
    isOpen: boolean
}

const fontFamilies = getAvailableFonts()

const TextSidebar = ({ isOpen }: Props) => {
    const dispatch = useAppDispatch()
    const selectedShapes = useAppSelector((state) => state.shapes.selected)
    const shapesEntities = useAppSelector((state) => state.shapes.shapes.entities)

    const selectedTextShape = Object.keys(selectedShapes)
        .map((id) => shapesEntities[id])
        .find((shape) => shape?.type === 'text') as TextShape | undefined

    const updateTextProperty = <K extends keyof TextShape>(property: K, value: TextShape[K]) => {
        if (!selectedTextShape) return

        dispatch(
            updateShape({
                id: selectedTextShape.id,
                patch: { [property]: value },
            })
        )
    }

    const openColorPicker = (property: 'fill' | 'stroke') => {
        if (!selectedTextShape) return
        const input = document.createElement('input')
        input.type = 'color'
        input.value = (selectedTextShape[property] as string) || '#ffffff'
        input.onchange = (e) => {
            const color = (e.target as HTMLInputElement).value
            updateTextProperty(property, color)
        }
        input.click()
    }

    return (
        <div
            className={cn(
                'fixed right-5 top-1/2 transform -translate-y-1/2 w-80 backdrop-blur-xl bg-black/40 border-white/[0.12] gap-2 p-1 saturate-150 border rounded-2xl z-50 transition-all duration-500 ease-in-out',
                isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-10 opacity-0 scale-95 pointer-events-none'
            )}
        >
            <div className="p-4 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
                    <h3 className="text-white font-medium text-sm tracking-tight">Text Properties</h3>
                </div>

                {/* Name / Content */}
                <div className="space-y-2">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Name</Label>
                    <Input
                        value={selectedTextShape?.text || ''}
                        onChange={(e) => updateTextProperty('text', e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-10 rounded-xl px-3 focus:ring-1 focus:ring-white/20"
                        placeholder="Heading 1"
                    />
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Font</Label>
                    <Select
                        value={selectedTextShape?.fontFamily}
                        onValueChange={(value) => updateTextProperty('fontFamily', value)}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 w-full text-white h-10 rounded-xl focus:ring-1 focus:ring-white/20">
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900/95 border-white/10 backdrop-blur-2xl rounded-xl">
                            {fontFamilies.map((font) => (
                                <SelectItem
                                    key={font.value}
                                    value={font.value}
                                    className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer py-2.5"
                                >
                                    <span style={{ fontFamily: font.value }} className="text-base">{font.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Font Weight */}
                <div className="space-y-2">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Style</Label>
                    <Select
                        value={selectedTextShape?.fontWeight?.toString() || "400"}
                        onValueChange={(value) => updateTextProperty('fontWeight', parseInt(value))}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 w-full text-white h-10 rounded-xl focus:ring-1 focus:ring-white/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900/95 border-white/10 backdrop-blur-2xl rounded-xl">
                            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                                <SelectItem key={weight} value={weight.toString()} className="text-white">
                                    {weight === 400 ? 'Regular' : weight === 500 ? 'Medium' : weight === 600 ? 'Semibold' : weight === 700 ? 'Bold' : weight}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                    <Label className="text-white/80 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                        <Palette className="w-3 h-3" />
                        Color
                    </Label>
                    <div className="flex gap-2">
                        <div
                            onClick={() => openColorPicker('fill')}
                            className="w-10 h-10 rounded-xl border border-white/20 cursor-pointer transition-all hover:scale-105 shadow-lg"
                            style={{ backgroundColor: selectedTextShape?.fill || '#ffffff' }}
                        />
                        <Input
                            value={selectedTextShape?.fill || '#ffffff'}
                            onChange={(e) => updateTextProperty('fill', e.target.value)}
                            className="bg-white/5 border-white/10 text-white h-10 rounded-xl flex-1 px-3 focus:ring-1 focus:ring-white/20 shadow-inner"
                            placeholder="#ffffff"
                        />
                    </div>
                </div>

                {/* Alignment */}
                <div className="space-y-2">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Align</Label>
                    <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        {[
                            { value: 'left', icon: AlignLeft },
                            { value: 'center', icon: AlignCenter },
                            { value: 'right', icon: AlignRight },
                            { value: 'justify', icon: AlignJustify }
                        ].map((align) => (
                            <button
                                key={align.value}
                                onClick={() => updateTextProperty('textAlign', align.value as any)}
                                className={cn(
                                    "flex items-center justify-center h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all",
                                    (selectedTextShape?.textAlign || 'left') === align.value && "bg-white/10 text-white shadow-sm"
                                )}
                            >
                                <align.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stroke */}
                <div className="space-y-2">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Stroke</Label>
                    <div className="flex gap-2 items-center">
                        <div
                            onClick={() => openColorPicker('stroke')}
                            className="w-10 h-10 rounded-xl border border-white/20 cursor-pointer transition-all hover:scale-105 shadow-lg"
                            style={{ backgroundColor: selectedTextShape?.stroke || '#ffffff' }}
                        />
                        <Input
                            value={selectedTextShape?.stroke || '#ffffff'}
                            onChange={(e) => updateTextProperty('stroke', e.target.value)}
                            className="bg-white/5 border-white/10 text-white h-10 rounded-xl flex-1 px-3 focus:ring-1 focus:ring-white/20"
                            placeholder="#ffffff"
                        />
                        <Select
                            value={selectedTextShape?.strokeWidth?.toString() || "0"}
                            onValueChange={(value) => updateTextProperty('strokeWidth', parseInt(value))}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 w-20 text-white h-10 rounded-xl focus:ring-1 focus:ring-white/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900/95 border-white/10 backdrop-blur-2xl rounded-xl">
                                {[0, 1, 2, 4, 8, 12, 16].map((w) => (
                                    <SelectItem key={w} value={w.toString()} className="text-white">
                                        {w}px
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Font Size */}
                    <div className="space-y-2">
                        <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Size</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={selectedTextShape?.fontSize || 16}
                                onChange={(e) => updateTextProperty('fontSize', parseInt(e.target.value) || 0)}
                                className="bg-white/5 border-white/10 w-full text-white h-10 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Paragraph Spacing (Para) - Placeholder logic, using lineHeight if Para not available in slice */}
                    <div className="space-y-2">
                        <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Para</Label>
                        <input
                            type="number"
                            value={50} // Placeholder as requested in image
                            className="bg-white/5 border-white/10 w-full text-white h-10 rounded-xl px-3 text-sm focus:outline-none opacity-50 cursor-not-allowed"
                            disabled
                        />
                    </div>
                </div>

                {/* Line Height & Letter Spacing */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Line</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                value={selectedTextShape?.lineHeight ?? 1.2}
                                onChange={(e) => updateTextProperty('lineHeight', parseFloat(e.target.value) || 1.2)}
                                className="bg-white/5 border-white/10 w-full text-white h-10 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Letter</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                value={selectedTextShape?.letterSpacing ?? 0}
                                onChange={(e) => updateTextProperty('letterSpacing', parseFloat(e.target.value) || 0)}
                                className="bg-white/5 border-white/10 w-full text-white h-10 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Style Toggles */}
                <div className="space-y-3">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Decorations</Label>
                    <div className="flex gap-2">
                        <Toggle
                            pressed={selectedTextShape?.fontWeight ? selectedTextShape.fontWeight >= 600 : false}
                            onPressedChange={(pressed) =>
                                updateTextProperty("fontWeight", pressed ? 700 : 400)
                            }
                            className="bg-white/5 data-[state=on]:bg-blue-500 data-[state=on]:text-white border-white/10 border h-10 w-10 p-0 rounded-xl transition-all"
                        >
                            <Bold className="w-4 h-4" />
                        </Toggle>
                        <Toggle
                            pressed={selectedTextShape?.fontStyle === "italic"}
                            onPressedChange={(pressed) =>
                                updateTextProperty("fontStyle", pressed ? "italic" : "normal")
                            }
                            className="bg-white/5 data-[state=on]:bg-blue-500 data-[state=on]:text-white border-white/10 border h-10 w-10 p-0 rounded-xl transition-all"
                        >
                            <Italic className="w-4 h-4" />
                        </Toggle>
                        <Toggle
                            pressed={selectedTextShape?.textDecoration === "underline"}
                            onPressedChange={(pressed) =>
                                updateTextProperty("textDecoration", pressed ? "underline" : "none")
                            }
                            className="bg-white/5 data-[state=on]:bg-blue-500 data-[state=on]:text-white border-white/10 border h-10 w-10 p-0 rounded-xl transition-all"
                        >
                            <Underline className="w-4 h-4" />
                        </Toggle>
                        <Toggle
                            pressed={selectedTextShape?.textDecoration === "line-through"}
                            onPressedChange={(pressed) =>
                                updateTextProperty("textDecoration", pressed ? "line-through" : "none")
                            }
                            className="bg-white/5 data-[state=on]:bg-blue-500 data-[state=on]:text-white border-white/10 border h-10 w-10 p-0 rounded-xl transition-all"
                        >
                            <Strikethrough className="w-4 h-4" />
                        </Toggle>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TextSidebar