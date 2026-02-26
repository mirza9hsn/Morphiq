import React, { Suspense } from 'react'
import NavBar from '@/components/navbar'


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