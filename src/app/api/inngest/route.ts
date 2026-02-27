import { inngest } from '@/inngest/client'
import { serve } from 'inngest/next'
import { autosaveProjectWorkflow, handlePolarEvent } from '@/inngest/functions'

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [handlePolarEvent, autosaveProjectWorkflow], //Whatever fucntions or BG-Jobs we want to create/run goes here.
})