'use client'
import { useProjectCreation } from '@/hooks/use-project'
import { useAppSelector } from '@/redux/store'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Clock, LayoutGrid, Loader2, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const ProjectsList = () => {
    const { projects, canCreate, createProject, isCreating } = useProjectCreation()
    const user = useAppSelector((state) => state.profile.user)
    const search = useAppSelector((state) => state.projects.searchQuery)

    if (!canCreate) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <p className="text-muted-foreground text-sm">Please sign in to view your projects.</p>
            </div>
        )
    }

    const sorted = [...projects].sort((a, b) => b.lastModified - a.lastModified)
    const displayed = search
        ? sorted.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : sorted

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <div className="px-6 py-4">
                <h1 className="text-lg font-semibold text-foreground">My Projects</h1>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-auto px-6 py-6">

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {projects.length > 0 && (
                        <button
                            onClick={() => createProject()}
                            disabled={isCreating}
                            className={cn(
                                'group relative aspect-[4/3] rounded-xl border-2 border-dashed border-border/60',
                                'flex flex-col items-center justify-center gap-2',
                                'bg-muted/20 hover:bg-muted/40 hover:border-primary/40',
                                'transition-all duration-200',
                                isCreating && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            <div className={cn(
                                'size-9 rounded-full flex items-center justify-center',
                                'bg-muted border border-border/60',
                                'group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground',
                                'transition-all duration-200'
                            )}>
                                {isCreating
                                    ? <Loader2 className="size-4 animate-spin" />
                                    : <Plus className="size-4" />}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                {isCreating ? 'Creating…' : 'New project'}
                            </span>
                        </button>
                    )}

                    {displayed.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            username={user?.name ?? ''}
                        />
                    ))}
                </div>

                {/* Empty state */}
                {projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-14 rounded-2xl bg-muted border border-border/60 flex items-center justify-center mb-4">
                            <Sparkles className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">No projects yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-6">
                            Start by creating your first project. Upload a moodboard and let AI generate your UI.
                        </p>
                        <button
                            onClick={() => createProject()}
                            disabled={isCreating}
                            className="flex items-center gap-2 px-4 h-9 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                            {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                            {isCreating ? 'Creating…' : 'Create first project'}
                        </button>
                    </div>
                )}

                {/* Search no-results */}
                {projects.length > 0 && displayed.length === 0 && search && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-muted-foreground">No projects match &ldquo;{search}&rdquo;</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

type ProjectCardProps = {
    project: {
        _id: string
        name: string
        thumbnail?: string
        lastModified: number
    }
    username: string
}

const ProjectCard = ({ project, username }: ProjectCardProps) => (
    <Link
        href={username ? `/dashboard/${username}/canvas?project=${project._id}` : '#'}
        className="group block"
    >
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/40 group-hover:border-border/80 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
            {project.thumbnail ? (
                <Image
                    src={project.thumbnail}
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/40">
                    <LayoutGrid className="size-6 text-border" />
                </div>
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-200" />
        </div>

        <div className="mt-2.5 px-0.5">
            <p className="text-sm font-medium text-foreground truncate leading-tight group-hover:text-primary transition-colors duration-150">
                {project.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
                <Clock className="size-2.5 text-muted-foreground/60 shrink-0" />
                <p className="text-[11px] text-muted-foreground truncate">
                    {formatDistanceToNow(new Date(project.lastModified), { addSuffix: true })}
                </p>
            </div>
        </div>
    </Link>
)

export default ProjectsList
