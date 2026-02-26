'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { CaseSensitive, Hash, LayoutIcon } from 'lucide-react'
import { useAppSelector } from '@/redux/store'

type Props = {
    children: React.ReactNode
}

const tabs = [
    {
        segment: 'colours',
        label: 'Colours',
        Icon: Hash,
    },
    {
        segment: 'typography',
        label: 'Typography',
        Icon: CaseSensitive,
    },
    {
        segment: 'moodboard',
        label: 'Moodboard',
        Icon: LayoutIcon,
    },
] as const

const Layout = ({ children }: Props) => {
    const pathname = usePathname()
    const params = useSearchParams()
    const me = useAppSelector((state) => state.profile.user)

    const projectId = params.get('project')
    const safeProjectId = projectId && projectId !== 'null' ? projectId : null
    const projectQuery = safeProjectId ? `?project=${safeProjectId}` : ''

    return (
        <div className="w-full">
            <div className="mt-36 container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-20">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-center justify-between">
                    <div>
                        <h1 className="text-3xl lg:text-left text-center font-bold text-foreground">
                            Style Guide
                        </h1>
                        <p className="text-muted-foreground mt-2 text-center lg:text-left">
                            Manage your style guide for your project.
                        </p>
                    </div>

                    {/* Pill tab group */}
                    <div className="grid grid-cols-3 w-full sm:w-fit h-auto rounded-full bg-[#161616] border border-white/[0.05] shadow-[inner_0_1px_2px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)] p-1.5 gap-1.5 isolate">
                        {tabs.map(({ segment, label, Icon }) => {
                            const newParams = new URLSearchParams(params.toString())
                            newParams.set('tab', segment)
                            const href = `${pathname}?${newParams.toString()}`
                            const currentTab = params.get('tab') || 'colours'
                            const isActive = currentTab === segment

                            return (
                                <Link
                                    key={segment}
                                    href={href}
                                    className={[
                                        'flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 relative z-30',
                                        isActive
                                            ? 'bg-[#000000] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.03)] border border-transparent'
                                            : 'text-zinc-500 hover:text-zinc-300',
                                    ].join(' ')}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                    <span className="sm:hidden">{label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Page content */}
            <div className="container mx-auto px-4 sm:px-6 py-6 relative z-10">
                {children}
            </div>
        </div>
    )
}

export default Layout