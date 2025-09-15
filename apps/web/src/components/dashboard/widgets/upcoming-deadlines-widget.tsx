'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import { Calendar, AlertTriangle, Clock } from 'lucide-react'

interface Deadline {
  id: string
  title: string
  type: 'task' | 'milestone' | 'project'
  dueDate: string
  project: {
    id: string
    name: string
  }
  assignee?: {
    id: string
    name: string
    avatarUrl?: string
  }
  status: 'pending' | 'completed' | 'overdue'
}

export function UpcomingDeadlinesWidget() {
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async (): Promise<Deadline[]> => {
      // TODO: Replace with actual API call
      const now = new Date()
      const deadlines: Deadline[] = [
        {
          id: '1',
          title: 'Complete user authentication',
          type: 'task' as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
          project: { id: '1', name: 'Web App Redesign' },
          assignee: { id: '1', name: 'Alice Johnson' },
          status: 'pending' as const,
        },
        {
          id: '2',
          title: 'Design review milestone',
          type: 'milestone' as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days
          project: { id: '1', name: 'Web App Redesign' },
          status: 'pending' as const,
        },
        {
          id: '3',
          title: 'API integration testing',
          type: 'task' as const,
          dueDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago (overdue)
          project: { id: '2', name: 'Mobile App' },
          assignee: { id: '2', name: 'Bob Smith' },
          status: 'overdue' as const,
        },
        {
          id: '4',
          title: 'Marketing campaign launch',
          type: 'project' as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(), // 4 days
          project: { id: '3', name: 'Marketing Campaign' },
          status: 'pending' as const,
        },
        {
          id: '5',
          title: 'Database migration',
          type: 'task' as const,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // 6 hours
          project: { id: '2', name: 'Mobile App' },
          assignee: { id: '3', name: 'Carol Davis' },
          status: 'pending' as const,
        },
      ]
      
      return deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <div className="text-gray-500 dark:text-gray-400">
          No upcoming deadlines
        </div>
      </div>
    )
  }

  const getDeadlineIcon = (type: string, status: string) => {
    if (status === 'overdue') return AlertTriangle
    if (type === 'milestone') return Calendar
    return Clock
  }

  const getDeadlineColor = (status: string, dueDate: string) => {
    if (status === 'overdue') return 'text-red-500'
    
    const due = new Date(dueDate)
    const now = new Date()
    const tomorrow = addDays(now, 1)
    
    if (isBefore(due, tomorrow)) return 'text-yellow-500'
    return 'text-blue-500'
  }

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'overdue') return 'text-red-600 dark:text-red-400'
    
    const due = new Date(dueDate)
    const now = new Date()
    const tomorrow = addDays(now, 1)
    
    if (isBefore(due, tomorrow)) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-4">
      {deadlines.map((deadline) => {
        const Icon = getDeadlineIcon(deadline.type, deadline.status)
        const iconColor = getDeadlineColor(deadline.status, deadline.dueDate)
        const statusColor = getStatusColor(deadline.status, deadline.dueDate)
        
        return (
          <div key={deadline.id} className="flex space-x-3">
            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {deadline.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {deadline.project.name}
                    {deadline.assignee && (
                      <span> • {deadline.assignee.name}</span>
                    )}
                  </p>
                </div>
                
                <div className="ml-2 flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700">
                    {deadline.type}
                  </span>
                </div>
              </div>
              
              <div className="mt-1">
                <span className={`text-xs font-medium ${statusColor}`}>
                  {deadline.status === 'overdue' ? 'Overdue' : ''}
                  {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View calendar
        </button>
      </div>
    </div>
  )
}