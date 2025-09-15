'use client'

import { DashboardWidget } from './dashboard-widget'
import { ProjectsOverviewWidget } from './widgets/projects-overview-widget'
import { TasksOverviewWidget } from './widgets/tasks-overview-widget'
import { RecentActivityWidget } from './widgets/recent-activity-widget'
import { TeamPerformanceWidget } from './widgets/team-performance-widget'
import { UpcomingDeadlinesWidget } from './widgets/upcoming-deadlines-widget'
import { ProjectProgressWidget } from './widgets/project-progress-widget'

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Top row - Key metrics */}
      <div className="lg:col-span-3">
        <DashboardWidget title="Projects Overview" size="medium">
          <ProjectsOverviewWidget />
        </DashboardWidget>
      </div>
      
      <div className="lg:col-span-3">
        <DashboardWidget title="Tasks Overview" size="medium">
          <TasksOverviewWidget />
        </DashboardWidget>
      </div>
      
      <div className="lg:col-span-6">
        <DashboardWidget title="Team Performance" size="large">
          <TeamPerformanceWidget />
        </DashboardWidget>
      </div>

      {/* Second row */}
      <div className="lg:col-span-4">
        <DashboardWidget title="Recent Activity" size="large">
          <RecentActivityWidget />
        </DashboardWidget>
      </div>
      
      <div className="lg:col-span-4">
        <DashboardWidget title="Upcoming Deadlines" size="large">
          <UpcomingDeadlinesWidget />
        </DashboardWidget>
      </div>
      
      <div className="lg:col-span-4">
        <DashboardWidget title="Project Progress" size="large">
          <ProjectProgressWidget />
        </DashboardWidget>
      </div>
    </div>
  )
}