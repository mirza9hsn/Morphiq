'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
    LogOut, User, CreditCard,
    ChevronDown, Volume2, Trash2,
    Compass, Sparkles, Building, Check, Gift,
    Sun, Moon,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useAppSelector } from '@/redux/store'
import { cn } from '@/lib/utils'
import { PricingComponent, allPlans } from '@/components/pricing-card'

type Tab = 'account' | 'billing'
type BillingCycle = 'monthly' | 'annually'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialTab?: Tab
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="size-4" /> },
    { id: 'billing', label: 'Plans & Billing', icon: <CreditCard className="size-4" /> },
]



const PLAN_LABELS: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
}

const ProfileModal = ({ open, onOpenChange, initialTab = 'account' }: Props) => {
    const { signOut } = useAuthActions()
    const router = useRouter()
    const me = useAppSelector((state) => state.profile.user)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>(initialTab)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually')

    useEffect(() => { setMounted(true) }, [])
    useEffect(() => {
        if (open) setActiveTab(initialTab)
    }, [open, initialTab])

    const creditBalance = useQuery(
        api.subscription.getCreditsBalance,
        me?.id ? { userId: me.id as Id<'users'> } : 'skip'
    )
    const subscription = useQuery(
        api.subscription.getSubscriptionForUser,
        me?.id ? { userId: me.id as Id<'users'> } : 'skip'
    )

    const handleSignOut = async () => {
        onOpenChange(false)
        await signOut()
        router.push('/auth/sign-in')
    }

    const credits = creditBalance ?? 0
    const grantPerPeriod = subscription?.creditsGrantPerPeriod ?? 10
    const rolloverLimit = subscription?.creditsRolloverLimit ?? 100
    const creditsUsed = Math.max(0, grantPerPeriod - credits)
    const creditPercent = grantPerPeriod > 0
        ? Math.min(100, Math.round((creditsUsed / grantPerPeriod) * 100))
        : 0
    const planCode = subscription?.planCode ?? 'free'
    const planLabel = PLAN_LABELS[planCode] ?? planCode


    const renewsAt = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        })
        : null

    const initials = me?.name
        ? me.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : me?.email?.slice(0, 2).toUpperCase() ?? 'U'

    const isDark = mounted && theme === 'dark'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1400px] w-[95vw] p-0 gap-0 overflow-hidden border-border/60 h-[80vh] flex flex-col">
                <DialogTitle className="sr-only">Settings</DialogTitle>

                <div className="flex flex-1 min-h-0">
                    {/* Sidebar */}
                    <aside className="w-[210px] shrink-0 border-r border-border/50 flex flex-col py-5 px-2.5 bg-muted/20">
                        <h2 className="text-sm font-semibold text-foreground px-2.5 mb-4">Settings</h2>

                        <nav className="flex-1 space-y-1.5">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-sm transition-colors text-left',
                                        activeTab === item.id
                                            ? 'bg-background text-foreground font-medium shadow-sm border border-border/40'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>




                    </aside>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'account' && (
                            <AccountTab
                                me={me}
                                initials={initials}
                                credits={credits}
                                creditsUsed={creditsUsed}
                                grantPerPeriod={grantPerPeriod}
                                creditPercent={creditPercent}
                                soundEnabled={soundEnabled}
                                setSoundEnabled={setSoundEnabled}
                            />
                        )}
                        {activeTab === 'billing' && (
                            <BillingTab
                                planCode={planCode}
                                planLabel={planLabel}
                                renewsAt={renewsAt}
                                credits={credits}
                                creditsUsed={creditsUsed}
                                grantPerPeriod={grantPerPeriod}
                                rolloverLimit={rolloverLimit}
                                creditPercent={creditPercent}
                                billingCycle={billingCycle}
                                setBillingCycle={setBillingCycle}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

type BillingTabProps = {
    planCode: string
    planLabel: string
    renewsAt: string | null
    credits: number
    creditsUsed: number
    grantPerPeriod: number
    rolloverLimit: number
    creditPercent: number
    billingCycle: BillingCycle
    setBillingCycle: (c: BillingCycle) => void
}

const BillingTab = ({
    planCode, planLabel, renewsAt,
    credits, creditsUsed, grantPerPeriod, rolloverLimit, creditPercent,
    billingCycle, setBillingCycle,
}: BillingTabProps) => (
    <div className="p-8">
        <h3 className="text-lg font-semibold text-foreground">Plans &amp; credits</h3>
        <p className="text-sm text-muted-foreground mt-0.5 mb-6">
            Manage your subscription plan and credit balance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-8">
            {/* Current plan card */}
            <div className="md:col-span-3 rounded-xl border border-border/60 bg-muted/20 p-5 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-start gap-3">
                    <div>
                        <p className="text-base font-bold text-foreground">
                            You&apos;re on {planLabel} Plan
                        </p>
                        {renewsAt && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Renews {renewsAt}
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-3"
                        onClick={() => window.open('https://billing.stripe.com', '_blank')}
                    >
                        Manage
                    </Button>
                </div>
            </div>

            {/* Credits tracker */}
            <div className="md:col-span-7 rounded-xl border border-border/60 bg-muted/20 p-5 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">Credits used</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {creditsUsed} / {grantPerPeriod}
                    </p>
                </div>
                <Progress value={creditPercent} className="h-2 mb-4" />
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <Check className="size-3 shrink-0 text-primary" />
                        {credits} credits remaining
                    </li>
                    <li className="flex items-center gap-2">
                        <Check className="size-3 shrink-0 text-primary" />
                        Up to {rolloverLimit} credits rollover
                    </li>
                </ul>
            </div>
        </div>

        <PricingComponent
            plans={allPlans}
            billingCycle={billingCycle}
            onCycleChange={setBillingCycle}
            onPlanSelect={() => { }}
            activePlanCode={planCode}
            className="px-0 py-0"
        />
    </div>
)

// ─── Account Tab ─────────────────────────────────────────────────────────────

type AccountTabProps = {
    me: { name?: string; email?: string; image?: string } | null
    initials: string
    credits: number
    creditsUsed: number
    grantPerPeriod: number
    creditPercent: number
    soundEnabled: boolean
    setSoundEnabled: (v: boolean) => void
}

const AccountTab = ({
    me, initials, credits, creditsUsed, grantPerPeriod,
    creditPercent, soundEnabled, setSoundEnabled,
}: AccountTabProps) => (
    <div className="p-8">
        <h3 className="text-lg font-semibold text-foreground">Account</h3>
        <p className="text-sm text-muted-foreground mt-0.5 mb-6">Manage your account details.</p>

        {/* Avatar */}
        <div className="mb-6">
            <div className="relative w-fit">
                <Avatar className="size-28 ring-2 ring-border shadow-sm">
                    <AvatarImage src={me?.image ?? ''} />
                    <AvatarFallback className="text-3xl font-semibold bg-muted text-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 size-7 bg-destructive rounded-full flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors">
                    <Trash2 className="size-3.5 text-white" />
                </button>
            </div>
        </div>

        {/* Name */}
        <div className="mb-4">
            <label className="text-sm font-medium text-foreground block mb-1.5">Name</label>
            <input
                readOnly
                value={me?.name ?? ''}
                className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:outline-none"
            />
        </div>

        {/* Email */}
        <div className="mb-7">
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input
                readOnly
                value={me?.email ?? ''}
                className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground focus:outline-none"
            />
        </div>

        {/* Sounds */}
        <div className="mb-7">
            <h4 className="text-base font-semibold text-foreground mb-3">Sounds</h4>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-foreground">Play sound on completion</span>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            {soundEnabled && (
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted/30 transition-colors">
                        <span>Celebration Pop</span>
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors text-muted-foreground">
                        <Volume2 className="size-4" />
                    </button>
                </div>
            )}
        </div>

        {/* Credits */}
        <div className="mb-8">
            <h4 className="text-base font-semibold text-foreground mb-3">Credits</h4>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 w-fit min-w-[220px]">
                <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-medium text-foreground">
                        {creditsUsed} / {grantPerPeriod} used
                    </p>
                    <p className="text-xs text-muted-foreground">{credits} left</p>
                </div>
                <Progress value={creditPercent} className="h-2 w-40" />
            </div>
        </div>

        {/* Delete account */}
        <div className="pt-5 border-t border-border/50 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-foreground">Delete account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Permanently delete your account. This cannot be undone.
                </p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs shrink-0"
            >
                Delete Account
            </Button>
        </div>
    </div>
)

export default ProfileModal
