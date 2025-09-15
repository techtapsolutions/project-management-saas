'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MoreVertical, Plus } from 'lucide-react'
import { TaskCard } from './task-card'

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
}

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const getColorClasses = (color: string) => {
    switch (color) {
      case '#blue':
        return 'bg-blue-100 border-blue-200 dark:bg-blue-900 dark:border-blue-800'
      case '#green':
        return 'bg-green-100 border-green-200 dark:bg-green-900 dark:border-green-800'
      case '#yellow':
        return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800'
      case '#red':
        return 'bg-red-100 border-red-200 dark:bg-red-900 dark:border-red-800'
      case '#purple':
        return 'bg-purple-100 border-purple-200 dark:bg-purple-900 dark:border-purple-800'
      default:
        return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getHeaderColorClasses = (color: string) => {
    switch (color) {
      case '#blue':
        return 'text-blue-700 dark:text-blue-300'
      case '#green':
        return 'text-green-700 dark:text-green-300'
      case '#yellow':
        return 'text-yellow-700 dark:text-yellow-300'
      case '#red':
        return 'text-red-700 dark:text-red-300'
      case '#purple':
        return 'text-purple-700 dark:text-purple-300'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-lg border-2 transition-colors ${
        isOver 
          ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
          : getColorClasses(column.color)
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-current/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className={`font-semibold text-sm ${getHeaderColorClasses(column.color)}`}>
              {column.name}
            </h3>
            <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          
          <button className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors">
            <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <button className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>
      
      {/* Tasks List */}
      <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-200px)] overflow-y-auto">
        <SortableContext 
          items={tasks.map(task => task.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks
            .sort((a, b) => a.position - b.position)
            .map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
        </SortableContext>
        
        {tasks.length === 0 && !isOver && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}