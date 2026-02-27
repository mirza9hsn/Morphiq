import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { inngest } from './client'
import { api } from '../../convex/_generated/api'
import { isPolarWebhookEvent, ReceivedEvent, PolarSubscription, extractSubscriptionLike, PolarOrder, PolarCustomer, toMs, isEntitledStatus } from '@/types/polar'
import { Id } from '../../convex/_generated/dataModel'
import { getByPolarId } from '../../convex/subscription'

const SUBSCRIPTION_CREDITS_GRANT_PER_PERIOD = 10
const SUBSCRIPTION_CREDITS_ROLLOVER_LIMIT = 100


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


export const extractOrderLike = (data: unknown): PolarOrder | null => {
    if (!data || typeof data !== 'object') return null
    const d = data as Record<string, unknown>
    const id = d.id
    if (typeof id !== 'string') return null
    return {
        id,
        billing_reason: d.billing_reason as string | undefined | null,
        subscription_id: d.subscription_id as string | undefined | null,
        customer: d.customer as PolarCustomer | undefined | null,
        customer_id: d.customer_id as string | undefined | null,
        metadata: (d.metadata as Record<string, unknown> | undefined) ?? null,
    }
}

const grantKey = (
    subId: string,
    periodEndMs?: number,
    eventId?: string | number
): string =>
    periodEndMs != null
        ? `${subId}:${periodEndMs}`
        : eventId != null
            ? `${subId}:evt:${eventId}`
            : `${subId}:first`

export const handlePolarEvent = inngest.createFunction(
    { id: 'polar-webhook-handler' },
    { event: 'polar/webhook.received' },
    async ({ event, step }) => {
        console.log('🚀 [Inngest] Starting Polar webhook handler')
        console.log(
            '📦 [Inngest] Raw event data:',
            JSON.stringify(event.data, null, 2)
        )

        if (!isPolarWebhookEvent(event.data)) {
            return
        }

        const incoming = event.data as ReceivedEvent
        const type = incoming.type
        const dataUnknown = incoming.data

        const sub: PolarSubscription | null = extractSubscriptionLike(dataUnknown)
        const order: PolarOrder | null = extractOrderLike(dataUnknown)
        if (!sub && !order) {
            return
        }

        const userId: Id<'users'> | null = await step.run(
            'resolve-user',
            async () => {
                const metaUserId =
                    (sub?.metadata?.userId as string | undefined) ??
                    (order?.metadata?.userId as string | undefined)

                if (metaUserId) {
                    console.log('✅ [Inngest] Using metadata userId:', metaUserId)
                    return metaUserId as unknown as Id<'users'>
                }

                const email = sub?.customer?.email ?? order?.customer?.email ?? null
                console.log('📧 [Inngest] Customer email:', email)
                if (email) {
                    try {
                        console.log('🔍 [Inngest] Looking up user by email:', email)
                        const foundUserId = await fetchQuery(api.user.getUserIdByEmail, {
                            email,
                        })

                        console.log('✅ [Inngest] Found user ID by email:', foundUserId)
                        return foundUserId
                    } catch (error) {
                        console.error(
                            '❌ [Inngest] Failed to resolve user by email:',
                            error
                        )
                        console.error('📧 [Inngest] Email lookup failed for:', email)
                        return null
                    }
                }

                console.log('❌ [Inngest] No email found to lookup user')
                return null
            }
        )
        console.log('✅ [Inngest] Resolved user ID:', userId)

        if (!userId) {
            console.log(
                '⏭️ [Inngest] No user ID resolved, skipping webhook processing'
            )
            return
        }

        const polarSubscriptionId = sub?.id ?? order?.subscription_id ?? ''
        console.log('🆔 [Inngest] Polar subscription ID:', polarSubscriptionId)
        if (!polarSubscriptionId) {
            console.log('❌ [Inngest] No polar subscription ID found, skipping')
            return
        }

        const currentPeriodEnd = toMs(sub?.current_period_end)
        const payload = {
            userId,
            polarCustomerId:
                sub?.customer?.id ?? sub?.customer_id ?? order?.customer_id ?? '',
            polarSubscriptionId,
            productId: sub?.product_id ?? sub?.product?.id ?? undefined,
            priceId: sub?.prices?.[0]?.id ?? undefined,
            planCode: sub?.plan_code ?? sub?.product?.name ?? undefined,
            status: sub?.status ?? 'updated',
            currentPeriodEnd,
            trialEndsAt: toMs(sub?.trial_ends_at),
            cancelAt: toMs(sub?.cancel_at),
            canceledAt: toMs(sub?.canceled_at),
            seats: sub?.seats ?? undefined,
            metadata: dataUnknown, // Keep as any to match Convex schema
            creditsGrantPerPeriod: SUBSCRIPTION_CREDITS_GRANT_PER_PERIOD,
            creditsRolloverLimit: SUBSCRIPTION_CREDITS_ROLLOVER_LIMIT,
        }

        console.log(
            '📋 [Inngest] Subscription payload:',
            JSON.stringify(payload, null, 2)
        )

        const subscriptionId = await step.run('upsert-subscription', async () => {
            try {
                console.log('💾 [Inngest] Upserting subscription to Convex...')
                console.log('🔍 [Inngest] Checking for existing subscriptions first...')

                const existingByPolar = await fetchQuery(
                    api.subscription.getByPolarId,
                    {
                        polarSubscriptionId: payload.polarSubscriptionId,
                    }
                )
                console.log('✅ [Inngest] Exsisiting Subscription PolarID:', existingByPolar ? 'Found' : 'None')
                const existingByUser = await fetchQuery(
                    api.subscription.getSubscriptionForUser,
                    {
                        userId: payload.userId,
                    }
                )
                console.log(
                    '📊 [Inngest] Existing subscription by User ID:',
                    existingByUser ? 'Found' : 'None'
                )

                if (
                    existingByPolar &&
                    existingByUser &&
                    existingByPolar._id !== existingByUser._id
                ) {
                    console.warn(
                        '⚠️ [Inngest] DUPLICATE DETECTED: User has different subscription by Polar ID vs User ID!'
                    )
                    console.warn(' - By Polar ID:', existingByPolar)
                    console.warn(' - By User ID:', existingByUser)
                }
                const result = await fetchMutation(api.subscription.upsertSubscription, payload)

                const allUserSubs = await fetchQuery(api.subscription.getAllForUser, {
                    userId: payload.userId,
                })

                if (allUserSubs && allUserSubs.length > 1) {
                    allUserSubs.forEach((sub, index) => {
                        console.error(
                            `${index + 1}. ID: ${sub._id}, Polar ID: ${sub.polarSubscriptionId}, Status: ${sub.status}`
                        )
                    })
                }

                return result
            } catch (error) {


                console.error('❌ [Inngest] Failed to upsert subscription:', error)
                console.error('Failed Payload:', JSON.stringify(payload, null, 2))
                throw error
            }

        })

        const looksCreate = /subscription\.created/i.test(type)
        const looksRenew =
            /subscription\.renew|order\.created|invoice\.paid|order\.paid/i.test(type)

        const entitled = isEntitledStatus(payload.status)

        console.log('🎯 [Inngest] Credit granting analysis:')
        console.log('  - Event type:', type)
        console.log('  - Looks like create:', looksCreate)
        console.log('  - Looks like renew:', looksRenew)
        console.log('  - User entitled:', entitled)
        console.log('  - Status:', payload.status)


        const idk = grantKey(polarSubscriptionId, currentPeriodEnd, incoming.id)    //idk => idempotencykey

        console.log('🔑 [Inngest] Idempotency key:', idk)

        if (
            entitled &&
            (looksCreate || looksRenew || true) /* allow on first known period */
        ) {
            const grant = await step.run('grant-credits', async () => {

                try {
                    console.log(
                        '💾 [Inngest] Granting credits to subscription:',
                        subscriptionId
                    )

                    const result = await fetchMutation(
                        api.subscription.grantCreditsIfNeeded,
                        {
                            subscriptionId,
                            idempotencyKey: idk,
                            amount: 10,
                            reason: looksCreate ? 'initial-grant' : 'periodic'
                        }
                    )

                    console.log('✅ [Inngest] Credits granted successfully:', result)
                    return result
                } catch (error) {
                    console.error('❌ [Inngest] Failed to grant credits:', error)
                    throw error
                }

            })

            console.log('📊 [Inngest] Grant result:', grant)
            if (grant.ok && !('skipped' in grant && grant.skipped)) {
                await step.sendEvent('credits-granted', {
                    name: 'billing/credits.granted',
                    id: `credits-granted:${polarSubscriptionId}:${currentPeriodEnd ?? 'first'}`,
                    data: {
                        userId,
                        amount: 'granted' in grant ? (grant.granted ?? 10) : 10,
                        balance: 'balance' in grant ? grant.balance : undefined,
                        periodEnd: currentPeriodEnd,
                    },
                })
                console.log('✅ [Inngest] Credits-granted event sent')
            } else {
                console.log('⏭️ [Inngest] Credit grant was skipped or failed')
            }


        }
        else {
            console.log('⏭️ [Inngest] Credit granting conditions not met')
        }

        await step.sendEvent('sub-synced', {
            name: 'billing/subscription.synced',
            id: `sub-synced:${polarSubscriptionId}:${currentPeriodEnd ?? 'first'}`,
            data: {
                userId,
                polarSubscriptionId,
                status: payload.status,
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
                    console.log('🔍 [Inngest] Checking entitlement status...')
                    const result = await fetchQuery(api.subscription.hasEntitlement, {
                        userId,
                    })
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
                        userId,
                        runAt: runAt.toISOString(),
                        periodEnd: currentPeriodEnd,
                    },
                })
            }
        }

    })

