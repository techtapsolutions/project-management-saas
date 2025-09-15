'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'

interface ProjectProgress {
  id: string
  name: string
  completionPercentage: number
  tasksCompleted: number
  totalTasks: number
  dueDate?: string
  status: 'on_track' | 'at_risk' | 'behind' | 'completed'
}

export function ProjectProgressWidget() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['project-progress'],
    queryFn: async (): Promise<ProjectProgress[]> => {
      // TODO: Replace with actual API call
      return [
        {
          id: '1',
          name: 'Web App Redesign',
          completionPercentage: 75,
          tasksCompleted: 18,
          totalTasks: 24,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks
          status: 'on_track',
        },
        {
          id: '2',
          name: 'Mobile App',
          completionPercentage: 45,
          tasksCompleted: 12,
          totalTasks: 28,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week
          status: 'at_risk',
        },
        {
          id: '3',
          name: 'Marketing Campaign',
          completionPercentage: 25,
          tasksCompleted: 5,
          totalTasks: 20,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days
          status: 'behind',
        },
        {
          id: '4',
          name: 'API Documentation',
          completionPercentage: 100,
          tasksCompleted: 8,
          totalTasks: 8,
          status: 'completed',
        },
        {
          id: '5',
          name: 'Database Migration',
          completionPercentage: 80,
          tasksCompleted: 16,
          totalTasks: 20,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(), // 3 weeks
          status: 'on_track',
        },
      ]
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <div className="text-gray-500 dark:text-gray-400">
          No projects to track
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'on_track':
        return 'text-blue-600 dark:text-blue-400'
      case 'at_risk':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'behind':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'on_track':
        return 'bg-blue-500'
      case 'at_risk':
        return 'bg-yellow-500'
      case 'behind':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'on_track':
        return 'On Track'
      case 'at_risk':
        return 'At Risk'
      case 'behind':
        return 'Behind'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {project.name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {project.tasksCompleted}/{project.totalTasks} tasks
                </span>
                <span className={`text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {project.completionPercentage}%
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(project.status)}`}
              style={{
                width: `${project.completionPercentage}%`,
              }}
            />
          </div>
        </div>
      ))}
      
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {projects.filter(p => p.status === 'completed').length} of {projects.length} projects completed
        </div>
        
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View all projects
        </button>
      </div>
    </div>
  )
}