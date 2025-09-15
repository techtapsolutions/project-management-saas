'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { 
  MessageCircle, 
  CheckSquare, 
  Users, 
  FileText, 
  GitBranch,
  AlertCircle
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'task_created' | 'task_completed' | 'comment_added' | 'user_joined' | 'file_uploaded' | 'project_created'
  description: string
  user: {
    id: string
    name: string
    avatarUrl?: string
  }
  project?: {
    id: string
    name: string
  }
  createdAt: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_created':
    case 'task_completed':
      return CheckSquare
    case 'comment_added':
      return MessageCircle
    case 'user_joined':
      return Users
    case 'file_uploaded':
      return FileText
    case 'project_created':
      return GitBranch
    default:
      return AlertCircle
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'task_completed':
      return 'text-green-500'
    case 'task_created':
      return 'text-blue-500'
    case 'comment_added':
      return 'text-purple-500'
    case 'user_joined':
      return 'text-indigo-500'
    case 'file_uploaded':
      return 'text-yellow-500'
    case 'project_created':
      return 'text-emerald-500'
    default:
      return 'text-gray-500'
  }
}

export function RecentActivityWidget() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      // TODO: Replace with actual API call
      return [
        {
          id: '1',
          type: 'task_completed',
          description: 'completed task "Design user authentication flow"',
          user: { id: '1', name: 'Alice Johnson' },
          project: { id: '1', name: 'Web App Redesign' },
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        },
        {
          id: '2',
          type: 'comment_added',
          description: 'commented on task "API Integration"',
          user: { id: '2', name: 'Bob Smith' },
          project: { id: '1', name: 'Web App Redesign' },
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        },
        {
          id: '3',
          type: 'task_created',
          description: 'created task "Update documentation"',
          user: { id: '3', name: 'Carol Davis' },
          project: { id: '2', name: 'Mobile App' },
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        },
        {
          id: '4',
          type: 'user_joined',
          description: 'joined project "Marketing Campaign"',
          user: { id: '4', name: 'David Wilson' },
          project: { id: '3', name: 'Marketing Campaign' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        },
        {
          id: '5',
          type: 'file_uploaded',
          description: 'uploaded file "requirements.pdf"',
          user: { id: '1', name: 'Alice Johnson' },
          project: { id: '1', name: 'Web App Redesign' },
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        },
      ]
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          No recent activity
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type)
        const iconColor = getActivityColor(activity.type)
        
        return (
          <div key={activity.id} className="flex space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.user.name}</span>{' '}
                {activity.description}
              </p>
              
              <div className="flex items-center space-x-2 mt-1">
                {activity.project && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {activity.project.name}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View all activity
        </button>
      </div>
    </div>
  )
}