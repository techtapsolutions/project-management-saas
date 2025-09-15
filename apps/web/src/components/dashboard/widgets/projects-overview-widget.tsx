'use client'

import { useQuery } from '@tanstack/react-query'
import { Folder, TrendingUp, AlertCircle } from 'lucide-react'

interface ProjectStats {
  total: number
  active: number
  completed: number
  onHold: number
  overdue: number
}

export function ProjectsOverviewWidget() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async (): Promise<ProjectStats> => {
      // TODO: Replace with actual API call
      return {
        total: 12,
        active: 8,
        completed: 3,
        onHold: 1,
        overdue: 2,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-blue-500" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </span>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Total Projects
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {stats.active}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {stats.completed}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            {stats.onHold}
          </span>
        </div>
        
        {stats.overdue > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Overdue</span>
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {stats.overdue}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{
              width: `${(stats.completed / stats.total) * 100}%`,
            }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {Math.round((stats.completed / stats.total) * 100)}% completed
        </div>
      </div>
    </div>
  )
}