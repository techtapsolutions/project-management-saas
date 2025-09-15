export function KanbanSkeleton() {
  return (
    <div className="h-full p-6">
      <div className="flex space-x-4 h-full overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-80 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
            {/* Column Header Skeleton */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Tasks Skeleton */}
            <div className="p-2 space-y-2">
              {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => (
                <div key={j} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Add Column Button Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-80 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}