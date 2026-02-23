import { SubscriptionEntitlementQuery } from '@/convex/query.config'
import { combinedSlug } from '@/lib/utils'
import { redirect } from 'next/navigation'

// This page's only job: redirect to /dashboard/[session].
// It IS async because it needs the profile name to build the slug.
// This is fine here because this page is only ever hit once during the
// initial navigation — the user is then on [session] which has a sync layout.
const Page = async () => {
    const { profileName } = await SubscriptionEntitlementQuery()
    redirect(`/dashboard/${combinedSlug(profileName!)}`)
}

export default Page