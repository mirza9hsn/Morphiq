import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { inngest } from './client'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import Stripe from 'stripe'

const SUBSCRIPTION_CREDITS_GRANT_PER_PERIOD = 10
const SUBSCRIPTION_CREDITS_ROLLOVER_LIMIT = 100

const grantKey = (
    subId: string,
    periodEndMs?: number,
    eventId?: string
): string =>
    periodEndMs != null
        ? `${subId}:${periodEndMs}`
        : eventId != null
            ? `${subId}:evt:${eventId}`
            : `${subId}:first`

export const autosaveProjectWorkflow = inngest.createFunction(
    { id: 'autosave-project-workflow' },
    { event: 'project/autosave.requested' },
    async ({ event }) => {
        const { projectId, shapesData, viewportData } = event.data
        try {
            await fetchMutation(api.projects.updateProjectSketches, {
                projectId,
                sketchesData: shapesData,
                viewportData,
            })
            return { success: true }
        } catch (error) {
            throw error
        }
    }
)

export const handleStripeEvent = inngest.createFunction(
    { id: 'stripe-webhook-handler' },
    { event: 'stripe/webhook.received' },
    async ({ event, step }) => {
        console.log('🚀 [Inngest] Starting Stripe webhook handler')
        const stripeEvent = event.data as Stripe.Event
        const type = stripeEvent.type
        console.log('📦 [Inngest] Event type:', type)

        const handled = [
            'checkout.session.completed',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'invoice.paid',
            'invoice.payment_failed',
        ]

        if (!handled.includes(type)) {
            console.log('⏭️ [Inngest] Unhandled event type, skipping:', type)
            return
        }

        let subscription: Stripe.Subscription | null = null
        let customerId: string | null = null
        let userId: string | null = null

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2026-02-25.clover',
        })

        if (type === 'checkout.session.completed') {
            const session = stripeEvent.data.object as Stripe.Checkout.Session
            customerId = session.customer as string
            userId = session.metadata?.userId ?? null

            if (session.subscription) {
                subscription = await step.run('fetch-subscription', async () => {
                    return await stripe.subscriptions.retrieve(session.subscription as string)
                })
            }
        } else if (
            type === 'customer.subscription.created' ||
            type === 'customer.subscription.updated' ||
            type === 'customer.subscription.deleted'
        ) {
            subscription = stripeEvent.data.object as Stripe.Subscription
            customerId = subscription.customer as string
            userId = subscription.metadata?.userId ?? null
        } else if (type === 'invoice.paid' || type === 'invoice.payment_failed') {
            const invoice = stripeEvent.data.object as Stripe.Invoice
            customerId = invoice.customer as string
            if ((invoice as any).subscription) {
                subscription = await step.run('fetch-subscription-from-invoice', async () => {
                    return await stripe.subscriptions.retrieve((invoice as any).subscription as string)
                })
                userId = subscription?.metadata?.userId ?? null
            }
        }

        if (!subscription) {
            console.log('❌ [Inngest] No subscription found in event, skipping')
            return
        }

        const resolvedUserId: Id<'users'> | null = await step.run('resolve-user', async () => {
            if (userId) {
                console.log('✅ [Inngest] Using metadata userId:', userId)
                return userId as unknown as Id<'users'>
            }

            if (customerId) {
                try {
                    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
                    const email = customer.email
                    if (email) {
                        const foundUserId = await fetchQuery(api.user.getUserIdByEmail, { email })
                        console.log('✅ [Inngest] Found user by email:', foundUserId)
                        return foundUserId
                    }
                } catch (error) {
                    console.error('❌ [Inngest] Failed to resolve user by email:', error)
                }
            }

            return null
        })

        if (!resolvedUserId) {
            console.log('⏭️ [Inngest] No userId resolved, skipping')
            return
        }

        const stripeSubscriptionId = subscription.id
        const currentPeriodEnd = (subscription as any).current_period_end
            ? (subscription as any).current_period_end * 1000
            : undefined
        const status = subscription.status

        const payload = {
            userId: resolvedUserId,
            stripeCustomerId: customerId ?? '',
            stripeSubscriptionId,
            productId: (subscription.items.data[0]?.price?.product as string) ?? undefined,
            priceId: subscription.items.data[0]?.price?.id ?? undefined,
            planCode: undefined as string | undefined,
            status,
            currentPeriodEnd,
            trialEndsAt: (subscription as any).trial_end ? (subscription as any).trial_end * 1000 : undefined,
            cancelAt: (subscription as any).cancel_at ? (subscription as any).cancel_at * 1000 : undefined,
            canceledAt: (subscription as any).canceled_at ? (subscription as any).canceled_at * 1000 : undefined,
            seats: undefined as number | undefined,
            metadata: subscription.metadata,
            creditsGrantPerPeriod: SUBSCRIPTION_CREDITS_GRANT_PER_PERIOD,
            creditsRolloverLimit: SUBSCRIPTION_CREDITS_ROLLOVER_LIMIT,
        }

        console.log('📋 [Inngest] Payload:', JSON.stringify(payload, null, 2))

        const subscriptionId = await step.run('upsert-subscription', async () => {
            try {
                const result = await fetchMutation(api.subscription.upsertSubscription, payload)
                console.log('✅ [Inngest] Subscription upserted:', result)
                return result
            } catch (error) {
                console.error('❌ [Inngest] Failed to upsert subscription:', error)
                throw error
            }
        })

        const isEntitled = ['active', 'trialing'].includes(status)
        const looksCreate = type === 'checkout.session.completed'
        const looksRenew = type === 'invoice.paid'
        const idk = grantKey(stripeSubscriptionId, currentPeriodEnd, stripeEvent.id)

        console.log('🎯 [Inngest] Credit granting analysis:')
        console.log('  - Event type:', type)
        console.log('  - Looks like create:', looksCreate)
        console.log('  - Looks like renew:', looksRenew)
        console.log('  - User entitled:', isEntitled)
        console.log('  - Status:', status)
        console.log('🔑 [Inngest] Idempotency key:', idk)

        if (isEntitled && (looksCreate || looksRenew)) {
            const grant = await step.run('grant-credits', async () => {
                try {
                    const result = await fetchMutation(api.subscription.grantCreditsIfNeeded, {
                        subscriptionId,
                        idempotencyKey: idk,
                        amount: SUBSCRIPTION_CREDITS_GRANT_PER_PERIOD,
                        reason: looksCreate ? 'initial-grant' : 'periodic',
                    })
                    console.log('✅ [Inngest] Credits granted:', result)
                    return result
                } catch (error) {
                    console.error('❌ [Inngest] Failed to grant credits:', error)
                    throw error
                }
            })

            if (grant.ok && !('skipped' in grant && grant.skipped)) {
                await step.sendEvent('credits-granted', {
                    name: 'billing/credits.granted',
                    id: `credits-granted:${stripeSubscriptionId}:${currentPeriodEnd ?? 'first'}`,
                    data: {
                        userId: resolvedUserId,
                        amount: 'granted' in grant ? (grant.granted ?? 10) : 10,
                        balance: 'balance' in grant ? grant.balance : undefined,
                        periodEnd: currentPeriodEnd,
                    },
                })
                console.log('✅ [Inngest] Credits-granted event sent')
            } else {
                console.log('⏭️ [Inngest] Credit grant skipped or failed')
            }
        } else {
            console.log('⏭️ [Inngest] Credit granting conditions not met')
        }

        await step.sendEvent('sub-synced', {
            name: 'billing/subscription.synced',
            id: `sub-synced:${stripeSubscriptionId}:${currentPeriodEnd ?? 'first'}`,
            data: {
                userId: resolvedUserId,
                stripeSubscriptionId,
                status,
                currentPeriodEnd,
            },
        })

        console.log('✅ [Inngest] Subscription synced event sent')

        if (currentPeriodEnd && currentPeriodEnd > Date.now()) {
            const runAt = new Date(
                Math.max(Date.now() + 5000, currentPeriodEnd - 3 * 24 * 60 * 60 * 1000)
            )
            await step.sleepUntil('wait-until-expiry', runAt)

            const stillEntitled = await step.run('check-entitlement', async () => {
                try {
                    const result = await fetchQuery(api.subscription.hasEntitlement, { userId: resolvedUserId })
                    console.log('✅ [Inngest] Entitlement status:', result)
                    return result
                } catch (error) {
                    console.error('❌ [Inngest] Failed to check entitlement:', error)
                    throw error
                }
            })

            if (stillEntitled) {
                await step.sendEvent('pre-expiry', {
                    name: 'billing/subscription.pre_expiry',
                    data: {
                        userId: resolvedUserId,
                        runAt: runAt.toISOString(),
                        periodEnd: currentPeriodEnd,
                    },
                })
            }
        }
    }
)