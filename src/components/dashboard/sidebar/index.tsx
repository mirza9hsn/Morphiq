'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Files, Users, Compass, BookOpen, Youtube,
    Crown, Sun, Moon, HelpCircle,
    MoreHorizontal, Trophy, LayoutTemplate
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/redux/store'

import UserButton from '@/components/profile/user-button'
import { useTheme } from 'next-themes'
import ProfileModal from '@/components/profile'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

const DashboardSidebar = () => {

    const me = useAppSelector((state) => state.profile.user)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    const isDark = mounted && theme === 'dark'

    const [profileOpen, setProfileOpen] = useState(false)
    const [profileInitialTab, setProfileInitialTab] = useState<'account' | 'billing'>('account')

    const openSettings = (tab: 'account' | 'billing') => {
        setProfileInitialTab(tab)
        setProfileOpen(true)
    }

    const subscription = useQuery(
        api.subscription.getSubscriptionForUser,
        me?.id ? { userId: me.id as Id<'users'> } : 'skip'
    )

    const currentPlan = subscription?.planCode ?? 'free'
    const upgradePlan = currentPlan === 'free' ? 'Starter' : currentPlan === 'starter' ? 'Pro' : null

    const projectItems = [
        {
            label: 'My projects',
            icon: <Files className="size-4" />,
            href: me?.name ? `/dashboard/${me.name}` : '#',
            active: true,
        },
        { label: 'Templates', icon: <LayoutTemplate className="size-4" />, href: '#', active: false },
        { label: 'Community', icon: <Compass className="size-4" />, href: '#', active: false },
    ]
    return (
        <>
            <ProfileModal
                open={profileOpen}
                onOpenChange={setProfileOpen}
                initialTab={profileInitialTab}
            />


            <aside className="fixed top-0 left-0 bottom-0 w-[250px] flex flex-col bg-background border-r border-border/50 z-[60]">
                {/* Logo */}
                <div className="h-14 flex items-center px-4 shrink-0">
                    <Link
                        href={me?.name ? `/dashboard/${me.name}` : '#'}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-7 h-7 rounded-full border-2 border-foreground/80 bg-background flex items-center justify-center shrink-0">
                            <div className="w-3 h-3 rounded-full bg-foreground/80" />
                        </div>
                        <span className="text-sm font-semibold text-foreground tracking-tight">Morphiq</span>
                    </Link>
                </div>

                {/* Nav */}
                <div className="mt-2 flex-1 overflow-y-auto px-2 space-y-5">
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-1.5 px-2.5">
                            Projects
                        </p>
                        <nav className="space-y-1.5">
                            {projectItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-sm transition-colors',
                                        item.active
                                            ? 'bg-muted text-foreground font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Bottom actions */}
                <div className="p-3 space-y-1">
                    {/* Upgrade - Dynamic Minimal Style */}
                    {upgradePlan && (
                        <button
                            onClick={() => openSettings('billing')}
                            className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all group border border-border/40"
                        >
                            <div className="text-left">
                                <p className="text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors">Upgrade to {upgradePlan}</p>
                                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Unlock more benefits</p>
                            </div>
                            <div className="size-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                <Trophy className="size-4 text-primary fill-primary/10" />
                            </div>
                        </button>
                    )}
                </div>
            </aside>
        </>
    )
}

export default DashboardSidebar
