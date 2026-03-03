import { ProfileQuery } from '@/convex/query.config'
import { combinedSlug } from '@/lib/utils'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { normalizeProfile } from '@/types/user'
import { fetchMutation } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { api } from '../../../../convex/_generated/api'
import { ConvexUserRaw } from '@/types/user'


const Page = async () => {
    const rawProfile = await ProfileQuery()
    const profile = normalizeProfile(rawProfile._valueJSON as unknown as ConvexUserRaw | null)

    if (!profile) {
        redirect('/auth/sign-in')
    }

    await fetchMutation(
        api.subscription.enrollFreePlan,
        {},
        { token: await convexAuthNextjsToken() }
    )

    redirect(`/dashboard/${combinedSlug(profile.name!)}`)
}

export default Page