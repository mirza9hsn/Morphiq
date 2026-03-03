'use client'

import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
    LogOut, Settings, Sun, Moon,
    ChevronDown, Zap
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useAppSelector } from '@/redux/store'
import { cn } from '@/lib/utils'
import ProfileModal from './index'

type Props = {
    className?: string
}

const UserButton = ({ className }: Props) => {
    const { signOut } = useAuthActions()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [modalOpen, setModalOpen] = useState(false)
    const [initialTab, setInitialTab] = useState<'account' | 'billing'>('account')

    const me = useAppSelector((state) => state.profile.user)

    const creditBalanceResult = useQuery(
        api.subscription.getCreditsBalance,
        me?.id ? { userId: me.id as Id<'users'> } : 'skip'
    )
    const subscription = useQuery(
        api.subscription.getSubscriptionForUser,
        me?.id ? { userId: me.id as Id<'users'> } : 'skip'
    )

    const handleSignOut = async () => {
        await signOut()
        router.push('/auth/sign-in')
    }

    const openSettings = (tab: 'account' | 'billing') => {
        setInitialTab(tab)
        setModalOpen(true)
    }

    const formatCredits = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
        return val.toString()
    }

    const credits = creditBalanceResult ?? 0
    const grantPerPeriod = subscription?.creditsGrantPerPeriod ?? 10
    const creditsUsed = Math.max(0, grantPerPeriod - credits)
    const creditPercent = grantPerPeriod > 0
        ? Math.min(100, Math.round((creditsUsed / grantPerPeriod) * 100))
        : 0

    const initials = me?.name
        ? me.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : me?.email?.slice(0, 2).toUpperCase() ?? 'U'

    const isDark = theme === 'dark'

    return (
        <>
            <ProfileModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initialTab={initialTab}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-muted/50 transition-all text-left group",
                            className
                        )}
                    >
                        <Avatar className="size-7 shrink-0 ring-1 ring-border/40 group-hover:ring-border/60 transition-all">
                            <AvatarImage src={me?.image ?? ''} />
                            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1.5 pr-1">
                            <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                                {me?.name ?? 'User'}
                            </span>
                            <ChevronDown className="size-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-all" />
                        </div>
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64 p-2 shadow-xl border-border/60" align="end" side="bottom">
                    <div className="px-2 py-1.5 mb-1.5 border-b border-border/40">
                        <p className="text-xs font-medium text-foreground truncate">
                            {me?.email}
                        </p>
                    </div>

                    {/* Credit Tracker Card - Matched with Profile Style */}
                    <div className="mx-1 mb-2 p-3 rounded-xl border border-border/60 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Credits Used</span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openSettings('billing');
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                Manage
                            </button>
                        </div>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-base font-bold text-foreground">{formatCredits(creditsUsed)}</span>
                            <span className="text-xs text-muted-foreground">/ {formatCredits(grantPerPeriod)}</span>
                        </div>
                        <Progress value={creditPercent} className="h-1.5 mb-1" />
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground font-medium">{creditPercent}% used</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{formatCredits(credits)} left</span>
                        </div>
                    </div>

                    <DropdownMenuSeparator className="-mx-1 mb-1" />

                    <DropdownMenuItem
                        onClick={() => openSettings('account')}
                        className="flex items-center gap-2.5 px-2 py-2 cursor-pointer focus:bg-muted"
                    >
                        <Settings className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        className="flex items-center gap-2.5 px-2 py-2 cursor-pointer focus:bg-muted"
                    >
                        {isDark ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
                        <span className="text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="-mx-1 my-1" />

                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-2 py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <LogOut className="size-4" />
                        <span className="text-sm font-medium">Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default UserButton
