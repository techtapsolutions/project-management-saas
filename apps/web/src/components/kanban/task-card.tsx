'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip, User } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

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

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
    }
  }

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return 'text-gray-500 dark:text-gray-400'
    
    const due = new Date(dueDate)
    if (isPast(due) && !isToday(due)) {
      return 'text-red-600 dark:text-red-400'
    } else if (isToday(due)) {
      return 'text-orange-600 dark:text-orange-400'
    } else if (isTomorrow(due)) {
      return 'text-yellow-600 dark:text-yellow-400'
    }
    return 'text-gray-500 dark:text-gray-400'
  }

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null
    
    const due = new Date(dueDate)
    if (isToday(due)) {
      return 'Today'
    } else if (isTomorrow(due)) {
      return 'Tomorrow'
    } else if (isPast(due) && !isToday(due)) {
      return `${formatDistanceToNow(due)} ago`
    }
    return formatDistanceToNow(due, { addSuffix: true })
  }

  const getTagColor = (tag: string) => {
    // Simple hash to get consistent colors for tags
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    ]
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 
        shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing
        ${isSortableDragging || isDragging ? 'opacity-50 transform rotate-3 shadow-lg' : ''}
      `}
    >
      {/* Priority indicator */}
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)} mb-2`}>
        {task.priority}
      </div>
      
      {/* Task title */}
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>
      
      {/* Task description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 rounded text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center space-x-1">
              {task.assignee.avatarUrl ? (
                <img
                  src={task.assignee.avatarUrl}
                  alt={task.assignee.name}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          )}
          
          {/* Comments indicator */}
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-3 w-3" />
            <span>2</span>
          </div>
          
          {/* Attachments indicator */}
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Paperclip className="h-3 w-3" />
            <span>1</span>
          </div>
        </div>
        
        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center space-x-1 ${getDueDateColor(task.dueDate)}`}>
            <Calendar className="h-3 w-3" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}