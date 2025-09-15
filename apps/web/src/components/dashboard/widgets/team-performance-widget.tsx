'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TeamMember {
  id: string
  name: string
  tasksCompleted: number
  tasksInProgress: number
  hoursLogged: number
  avatarUrl?: string
}

export function TeamPerformanceWidget() {
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team-performance'],
    queryFn: async (): Promise<TeamMember[]> => {
      // TODO: Replace with actual API call
      return [
        {
          id: '1',
          name: 'Alice J.',
          tasksCompleted: 12,
          tasksInProgress: 3,
          hoursLogged: 38.5,
        },
        {
          id: '2',
          name: 'Bob S.',
          tasksCompleted: 8,
          tasksInProgress: 5,
          hoursLogged: 42.0,
        },
        {
          id: '3',
          name: 'Carol D.',
          tasksCompleted: 15,
          tasksInProgress: 2,
          hoursLogged: 35.2,
        },
        {
          id: '4',
          name: 'David W.',
          tasksCompleted: 6,
          tasksInProgress: 4,
          hoursLogged: 28.8,
        },
        {
          id: '5',
          name: 'Emma R.',
          tasksCompleted: 10,
          tasksInProgress: 6,
          hoursLogged: 40.5,
        },
      ]
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (!teamData || teamData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No team performance data available
      </div>
    )
  }

  const chartData = teamData.map(member => ({
    name: member.name,
    completed: member.tasksCompleted,
    inProgress: member.tasksInProgress,
    hours: member.hoursLogged,
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tasks Completed vs In Progress
        </div>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="name" 
              className="text-xs fill-gray-600 dark:fill-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-xs fill-gray-600 dark:fill-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Bar 
              dataKey="completed" 
              fill="#10b981" 
              name="Completed"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="inProgress" 
              fill="#3b82f6" 
              name="In Progress"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {teamData.reduce((sum, member) => sum + member.tasksCompleted + member.tasksInProgress, 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Hours</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(teamData.reduce((sum, member) => sum + member.hoursLogged, 0))}h
          </div>
        </div>
      </div>
    </div>
  )
}