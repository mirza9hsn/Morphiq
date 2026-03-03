import React, { Suspense } from 'react'
import NavBar from '@/components/navbar'

type Props = { children: React.ReactNode }

const HomeLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={null}>
                <NavBar />
            </Suspense>
            {children}
        </div>
    )
}

export default HomeLayout
