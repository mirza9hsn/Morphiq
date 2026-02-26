import { SubscriptionEntitlementQuery } from '@/convex/query.config'
import { combinedSlug } from '@/lib/utils'
import { redirect } from 'next/navigation'


const Page = async () => {
    const { profileName } = await SubscriptionEntitlementQuery()
    redirect(`/dashboard/${combinedSlug(profileName!)}`)
}

export default Page