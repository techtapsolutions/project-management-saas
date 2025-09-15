'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@projectmgmt/ui'

interface CreateColumnDialogProps {
  projectId: string
  onClose: () => void
}

export function CreateColumnDialog({ projectId, onClose }: CreateColumnDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#blue')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const colors = [
    { value: '#blue', name: 'Blue', class: 'bg-blue-500' },
    { value: '#green', name: 'Green', class: 'bg-green-500' },
    { value: '#yellow', name: 'Yellow', class: 'bg-yellow-500' },
    { value: '#red', name: 'Red', class: 'bg-red-500' },
    { value: '#purple', name: 'Purple', class: 'bg-purple-500' },
    { value: '#gray', name: 'Gray', class: 'bg-gray-500' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual API call
      console.log('Creating column:', { projectId, name: name.trim(), color })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onClose()
    } catch (error) {
      console.error('Error creating column:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Column
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="column-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Column Name
            </label>
            <input
              id="column-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter column name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    w-8 h-8 rounded-full ${colorOption.class} 
                    ${color === colorOption.value 
                      ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' 
                      : 'hover:scale-110'
                    } 
                    transition-all
                  `}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Column'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}