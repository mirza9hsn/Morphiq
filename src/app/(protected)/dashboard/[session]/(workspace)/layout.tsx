import React, { Suspense } from 'react'
import NavBar from '@/components/navbar'
import { SubscriptionEntitlementQuery } from '@/convex/query.config'
import { redirect } from 'next/navigation'
import { combinedSlug } from '@/lib/utils'

type Props = {
    children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
    const { profileName, entitlement } = await SubscriptionEntitlementQuery()
    if (!entitlement._valueJSON) {

        redirect(`/billing/${combinedSlug(profileName!)}`)

    }
    return (
        <div className="grid grid-cols-1">
            <Suspense fallback={null}>
                <NavBar />
            </Suspense>
            {children}
        </div>
    )
}

export default Layout