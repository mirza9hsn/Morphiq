import ProjectProvider from '@/components/projects/provider'
import { ProjectQuery } from '@/convex/query.config'
import React from 'react'
import InfiniteCanvas from '@/components/canvas'

type CanvasPageProps = {
    searchParams: Promise<{ project: string }>
}

const Page = async ({ searchParams }: CanvasPageProps) => {
    const params = await searchParams
    const projectId = params.project

    if (!projectId) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-muted-foreground">No project selected</p>
            </div>
        )
    }

    const { project, profile } = await ProjectQuery(projectId)

    if (!profile) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Authentication required</p>
            </div>
        )
    }

    return (
        <ProjectProvider initialProject={project}>
            <InfiniteCanvas />
        </ProjectProvider>
    )
}

export default Page
