import { ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from '@projectmgmt/ui'
import { cn } from '@projectmgmt/ui'

interface DashboardWidgetProps {
  title: string
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
  className?: string
  actions?: ReactNode
}

export function DashboardWidget({
  title,
  children,
  size = 'medium',
  className,
  actions,
}: DashboardWidgetProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        size === 'small' && 'p-4',
        size === 'medium' && 'p-6',
        size === 'large' && 'p-6',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {actions}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={cn(
        size === 'small' && 'min-h-[120px]',
        size === 'medium' && 'min-h-[200px]',
        size === 'large' && 'min-h-[300px]'
      )}>
        {children}
      </div>
    </div>
  )
}