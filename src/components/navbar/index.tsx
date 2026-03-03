'use client'
import { useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { JSX } from 'react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { Hash, LayoutTemplate, Zap, Search } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { setSearchQuery } from '@/redux/slice/projects'
import Autosave from '../canvas/autosave'
import UserButton from '@/components/profile/user-button'
import { cn } from '@/lib/utils'

type TabProps = {
    label: string
    href: string
    icon: JSX.Element
}

const Navbar = () => {

    const pathname = usePathname()
    const params = useSearchParams()
    const dispatch = useAppDispatch()
    const projectId = params.get('project')

    const me = useAppSelector((state) => state.profile.user)
    const searchQuery = useAppSelector((state) => state.projects.searchQuery)

    const safeProjectId = projectId && projectId !== 'null' ? projectId : null

    const project = useQuery(
        api.projects.getProject,
        safeProjectId
            ? { projectId: safeProjectId as Id<'projects'> }
            : 'skip'
    )

    const tabs: TabProps[] = [
        {
            label: 'Canvas',
            href: safeProjectId && me?.name
                ? `/dashboard/${me.name}/canvas?project=${safeProjectId}`
                : me?.name ? `/dashboard/${me.name}/canvas` : '#',
            icon: <Hash className="h-3.5 w-3.5" />,
        },
        {
            label: 'Style Guide',
            href: safeProjectId && me?.name
                ? `/dashboard/${me.name}/style-guide?project=${safeProjectId}`
                : me?.name ? `/dashboard/${me.name}/style-guide` : '#',
            icon: <LayoutTemplate className="h-3.5 w-3.5" />,
        },
    ]

    const hasCanvas = pathname.includes('canvas')
    const hasStyleGuide = pathname.includes('style-guide')
    const isWorkspace = hasCanvas || hasStyleGuide

    const creditBalance = useQuery(api.subscription.getCreditsBalance, {
        userId: me.id as Id<'users'>,
    })

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

            <div className="relative h-full flex items-center justify-between px-4 lg:px-6">
                {/* LEFT: Logo (workspace only) + project name */}
                <div className="flex items-center gap-3 min-w-0">
                    {isWorkspace && (
                        <Link
                            href={me?.name ? `/dashboard/${me.name}` : '#'}
                            className="w-7 h-7 rounded-full border-2 border-foreground/80 bg-background flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                            aria-label="Dashboard"
                        >
                            <div className="w-3 h-3 rounded-full bg-foreground/80" />
                        </Link>
                    )}

                    {isWorkspace && project && (
                        <>
                            <span className="text-border/80 text-sm">/</span>
                            <span className="text-sm font-medium text-foreground/70 truncate max-w-[160px]">
                                {project.name}
                            </span>
                        </>
                    )}
                </div>

                {/* CENTER: Search (dashboard) or Workspace tabs */}
                <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
                    {isWorkspace ? (
                        <nav className="flex items-center gap-0.5 bg-muted/60 border border-border/60 rounded-full p-1">
                            {tabs.map((t) => {
                                const active = pathname.startsWith(t.href.split('?')[0])
                                return (
                                    <Link
                                        key={t.href}
                                        href={t.href}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
                                            active
                                                ? 'bg-background text-foreground shadow-sm border border-border/60'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {t.icon}
                                        {t.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                            <input
                                value={searchQuery}
                                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                placeholder="Search projects..."
                                className="h-8 px-4 text-center text-xs rounded-full border border-border/60 bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-muted/50 w-72 lg:w-[400px] transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-3">
                    <div className="h-8 flex items-center gap-1.5 text-[11px] font-medium text-foreground/80 bg-muted/40 border border-border/40 rounded-full px-3 transition-colors hover:bg-muted/60">
                        <Zap className="size-3 text-primary fill-primary/10" />
                        <span className="tabular-nums">
                            {creditBalance ?? '—'}
                        </span>
                        <span className="text-muted-foreground/80">credits</span>
                    </div>

                    {hasCanvas && <Autosave />}

                    <UserButton className="h-8" />
                </div>
            </div>
        </header>
    )
}

export default Navbar
