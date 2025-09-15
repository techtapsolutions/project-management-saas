import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardGrid />
          </Suspense>
        </div>
      </main>
    </div>
  )
}