import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { inngest } from '@/inngest/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
})

export async function POST(req: NextRequest): Promise<NextResponse> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
    if (!secret) {
        return new NextResponse('Missing STRIPE_WEBHOOK_SECRET', { status: 500 })
    }

    const raw = await req.text()
    const signature = req.headers.get('stripe-signature') ?? ''

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(raw, signature, secret)
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err)
        return new NextResponse('Invalid signature', { status: 403 })
    }

    const id = event.id

    try {
        await inngest.send({
            name: 'stripe/webhook.received',
            id,
            data: event,
        })
    } catch (error) {
        console.error('❌ Failed to send to Inngest:', error)
        return new NextResponse('Failed to process webhook', { status: 500 })
    }

    return NextResponse.json({ ok: true })
}