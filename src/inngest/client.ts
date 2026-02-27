import { Inngest } from 'inngest'
import { realtimeMiddleware } from '@inngest/realtime/middleware'

export const inngest = new Inngest({
    id: 'morphiq',
    isDev: process.env.NODE_ENV !== 'production',
    middleware: [realtimeMiddleware()],
})