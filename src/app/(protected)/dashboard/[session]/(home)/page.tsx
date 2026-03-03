import React, { Suspense } from 'react'
import { ProjectsQuery } from '@/convex/query.config'
import ProjectsProvider from '@/components/projects/list/provider'
import ProjectsList from '@/components/projects/list'
import DashboardSidebar from '@/components/dashboard/sidebar'

const Page = async () => {
    const { projects, profile } = await ProjectsQuery()

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Please sign in to view your projects.</p>
            </div>
        )
    }

    return (
        <ProjectsProvider initialProjects={projects}>
            <div className="min-h-screen">
                <Suspense fallback={null}>
                    <DashboardSidebar />
                </Suspense>
                <main className="ml-[250px] min-h-screen overflow-auto pt-14">
                    <ProjectsList />
                </main>
            </div>
        </ProjectsProvider>
    )
}

export default Page
