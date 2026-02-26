'use client'
import { useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { JSX } from 'react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { CircleHelp, Hash, LayoutTemplate, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppSelector } from '@/redux/store'
import CreateProject from '@/components/buttons/project'

type TabProps = {
    label: string
    href: string
    icon: JSX.Element
}

const Navbar = () => {

    const params = useSearchParams()
    const projectId = params.get('project')
    const safeProjectId = projectId && projectId !== 'null' ? projectId : null

    const me = useAppSelector((state) => state.profile)

    const project = useQuery(
        api.projects.getProject,
        safeProjectId
            ? { projectId: safeProjectId as Id<'projects'> }
            : 'skip'
    )
    const pathname = usePathname()

    const tabs: TabProps[] = [
        {
            label: 'Canvas',
            href: safeProjectId
                ? `/dashboard/${me.name}/canvas?project=${safeProjectId}`
                : `/dashboard/${me.name}/canvas`,
            icon: <Hash className="h-4 w-4" />,
        },
        {
            label: 'Style Guide',
            href: safeProjectId
                ? `/dashboard/${me.name}/style-guide?project=${safeProjectId}`
                : `/dashboard/${me.name}/style-guide`,
            icon: <LayoutTemplate className="h-4 w-4" />,
        },
    ]

    const hasCanvas = pathname.includes("canvas")
    const hasStyleGuide = pathname.includes("style-guide")



    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 p-6 fixed top-0 left-0 right-0 z-50">
            {/* LEFT: Logo */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/${me.name}`}
                    className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center"
                >
                    <div className="w-4 h-4 rounded-full bg-white" />
                </Link>
            </div>

            {/* CENTER: Tabs pill group */}
            <div className="lg:flex hidden items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#161616] border border-white/[0.05] shadow-[inner_0_1px_2px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.2)] rounded-full p-1.5 grayscale-0">
                    {tabs.map((t) => (
                        <Link
                            key={t.href}
                            href={t.href}
                            className={[
                                'group inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
                                pathname.startsWith(t.href.split('?')[0])
                                    ? 'bg-[#000000] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.03)] border border-transparent'
                                    : 'text-zinc-500 hover:text-zinc-300',
                            ].join(' ')}
                        >
                            <span
                                className={
                                    pathname.startsWith(t.href.split('?')[0])
                                        ? 'opacity-100'
                                        : 'opacity-70 group-hover:opacity-90'
                                }
                            >
                                {t.icon}
                            </span>
                            <span>{t.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4 justify-end">
                <span className="text-sm text-white/50">TODO: credits</span>
                <Button
                    variant="secondary"
                    className="rounded-full h-12 w-12 flex items-center justify-center
    backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150
    hover:bg-white/[0.12]"
                >
                    <CircleHelp className="size-5 text-white" />
                </Button>
                <Avatar className="size-12 ml-2">
                    <AvatarImage src={me.image || ''} />
                    <AvatarFallback>
                        <User className="size-5 text-black" />
                    </AvatarFallback>
                </Avatar>
                {/* {hasCanvas && <Autosave />}*/}
                {!hasCanvas && !hasStyleGuide && <CreateProject />}
            </div>
        </div>
    )
}

export default Navbar