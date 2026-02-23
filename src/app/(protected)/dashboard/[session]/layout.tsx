import React, { Suspense } from 'react'
import NavBar from '@/components/navbar'

// ⚠️ DO NOT add async preloadQuery calls here.
// ConvexAuthNextjsProvider.onChange calls invalidateCache() on every token
// refresh, which busts the Next.js Router Cache and re-runs ALL async server
// components in the tree. Keeping this layout synchronous means the re-run
// is instant (no Convex round-trip) and the loading.tsx never flickers.
//
// Auth guard (unauthenticated → /auth/sign-in) is handled by middleware.tsx.
// Entitlement guard should be done client-side via useQuery in the page itself.

type Props = {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
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