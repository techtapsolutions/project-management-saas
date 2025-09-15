'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react'

interface TaskStats {
  total: number
  todo: number
  inProgress: number
  review: number
  done: number
  blocked: number
  overdue: number
}

export function TasksOverviewWidget() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async (): Promise<TaskStats> => {
      // TODO: Replace with actual API call
      return {
        total: 47,
        todo: 12,
        inProgress: 15,
        review: 8,
        done: 10,
        blocked: 2,
        overdue: 5,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const activeTasksPercentage = ((stats.inProgress + stats.review) / stats.total) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-green-500" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </span>
        </div>
        <Clock className="h-5 w-5 text-blue-500" />
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Total Tasks
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">To Do</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {stats.todo}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {stats.inProgress}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Review</span>
          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            {stats.review}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Done</span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {stats.done}
          </span>
        </div>
        
        {stats.blocked > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Blocked</span>
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {stats.blocked}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Active Tasks</span>
          <span>{Math.round(activeTasksPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${activeTasksPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}