'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'
import { CreateColumnDialog } from './create-column-dialog'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string
  assignee?: {
    id: string
    name: string
    avatarUrl?: string
  }
  tags?: string[]
  position: number
}

interface Column {
  id: string
  name: string
  color: string
  position: number
  tasks: Task[]
}

interface KanbanBoardProps {
  projectId: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreateColumn, setShowCreateColumn] = useState(false)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch board data
  const { data: boardData, isLoading } = useQuery({
    queryKey: ['kanban-board', projectId],
    queryFn: async (): Promise<Column[]> => {
      // TODO: Replace with actual API call
      return [
        {
          id: 'col-1',
          name: 'To Do',
          color: '#gray',
          position: 0,
          tasks: [
            {
              id: 'task-1',
              title: 'Design user authentication flow',
              description: 'Create wireframes and user flow for the authentication system',
              status: 'todo',
              priority: 'high',
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
              assignee: {
                id: '1',
                name: 'Alice Johnson',
                avatarUrl: '/avatars/alice.jpg',
              },
              tags: ['ui', 'design'],
              position: 0,
            },
            {
              id: 'task-2',
              title: 'Set up CI/CD pipeline',
              description: 'Configure automated testing and deployment',
              status: 'todo',
              priority: 'medium',
              assignee: {
                id: '2',
                name: 'Bob Smith',
              },
              tags: ['devops'],
              position: 1,
            },
          ],
        },
        {
          id: 'col-2',
          name: 'In Progress',
          color: '#blue',
          position: 1,
          tasks: [
            {
              id: 'task-3',
              title: 'Implement user registration API',
              description: 'Build REST API endpoints for user registration with validation',
              status: 'in_progress',
              priority: 'high',
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
              assignee: {
                id: '3',
                name: 'Carol Davis',
              },
              tags: ['backend', 'api'],
              position: 0,
            },
          ],
        },
        {
          id: 'col-3',
          name: 'Review',
          color: '#yellow',
          position: 2,
          tasks: [
            {
              id: 'task-4',
              title: 'Update project documentation',
              status: 'review',
              priority: 'low',
              assignee: {
                id: '4',
                name: 'David Wilson',
              },
              tags: ['documentation'],
              position: 0,
            },
          ],
        },
        {
          id: 'col-4',
          name: 'Done',
          color: '#green',
          position: 3,
          tasks: [
            {
              id: 'task-5',
              title: 'Set up project structure',
              description: 'Initialize project with TypeScript, Next.js, and Tailwind',
              status: 'done',
              priority: 'medium',
              assignee: {
                id: '1',
                name: 'Alice Johnson',
              },
              tags: ['setup'],
              position: 0,
            },
          ],
        },
      ]
    },
  })

  // Move task mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      fromColumnId,
      toColumnId,
      newPosition,
    }: {
      taskId: string
      fromColumnId: string
      toColumnId: string
      newPosition: number
    }) => {
      // TODO: Replace with actual API call
      console.log('Moving task:', { taskId, fromColumnId, toColumnId, newPosition })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', projectId] })
    },
  })

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    
    // Find the task being dragged
    const task = boardData?.flatMap(col => col.tasks).find(t => t.id === active.id)
    setActiveTask(task || null)
  }, [boardData])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveTask(null)
    
    if (!over || !boardData) return

    const taskId = active.id as string
    const overId = over.id as string

    // Find source column and task
    const sourceColumn = boardData.find(col => 
      col.tasks.some(task => task.id === taskId)
    )
    const task = sourceColumn?.tasks.find(t => t.id === taskId)
    
    if (!sourceColumn || !task) return

    // Determine target column
    let targetColumn = boardData.find(col => col.id === overId)
    if (!targetColumn) {
      // If dropped on a task, find its column
      targetColumn = boardData.find(col => 
        col.tasks.some(t => t.id === overId)
      )
    }
    
    if (!targetColumn) return

    // If same column, reorder tasks
    if (sourceColumn.id === targetColumn.id) {
      const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId)
      const overIndex = sourceColumn.tasks.findIndex(t => t.id === overId)
      
      if (taskIndex !== overIndex) {
        const newTasks = arrayMove(sourceColumn.tasks, taskIndex, overIndex)
        
        // Update positions
        newTasks.forEach((task, index) => {
          task.position = index
        })
        
        // Update local state optimistically
        queryClient.setQueryData(['kanban-board', projectId], (oldData: Column[]) => 
          oldData.map(col => 
            col.id === sourceColumn.id 
              ? { ...col, tasks: newTasks }
              : col
          )
        )
      }
    } else {
      // Move to different column
      const newPosition = targetColumn.tasks.length
      
      // Update local state optimistically
      queryClient.setQueryData(['kanban-board', projectId], (oldData: Column[]) => 
        oldData.map(col => {
          if (col.id === sourceColumn.id) {
            // Remove from source
            return {
              ...col,
              tasks: col.tasks.filter(t => t.id !== taskId)
            }
          } else if (col.id === targetColumn.id) {
            // Add to target
            return {
              ...col,
              tasks: [...col.tasks, { ...task, status: col.name.toLowerCase().replace(' ', '_'), position: newPosition }]
            }
          }
          return col
        })
      )
      
      // Call API to persist the change
      moveTaskMutation.mutate({
        taskId,
        fromColumnId: sourceColumn.id,
        toColumnId: targetColumn.id,
        newPosition,
      })
    }
  }, [boardData, projectId, queryClient, moveTaskMutation])

  if (isLoading) {
    return <KanbanSkeleton />
  }

  if (!boardData || boardData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No board columns found
          </div>
          <button
            onClick={() => setShowCreateColumn(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create your first column
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 h-full overflow-x-auto">
          <SortableContext 
            items={boardData.map(col => col.id)} 
            strategy={verticalListSortingStrategy}
          >
            {boardData.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={column.tasks}
              />
            ))}
          </SortableContext>
          
          {/* Add Column Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCreateColumn(true)}
              className="w-80 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
            >
              + Add Column
            </button>
          </div>
        </div>
        
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {showCreateColumn && (
        <CreateColumnDialog
          projectId={projectId}
          onClose={() => setShowCreateColumn(false)}
        />
      )}
    </div>
  )
}

function KanbanSkeleton() {
  return (
    <div className="h-full p-6">
      <div className="flex space-x-4 h-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-80 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}