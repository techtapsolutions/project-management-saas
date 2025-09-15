import { Suspense } from 'react'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { KanbanSkeleton } from '@/components/kanban/kanban-skeleton'
import { BoardHeader } from '@/components/kanban/board-header'

interface KanbanPageProps {
  params: {
    id: string
  }
}

export default function KanbanPage({ params }: KanbanPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <BoardHeader projectId={params.id} />
      
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={<KanbanSkeleton />}>
          <KanbanBoard projectId={params.id} />
        </Suspense>
      </main>
    </div>
  )
}