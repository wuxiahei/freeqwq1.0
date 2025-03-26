import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'

// If you're using shadcn/ui Button, ensure it's installed
// If not, you can use a basic button or create a custom one
const Button = ({ children, className, onClick }: {
  children: React.ReactNode,
  className?: string,
  onClick?: () => void
}) => (
  <button
    className={`px-4 py-2 bg-blue-500 text-white rounded ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
)

const Header: FC = () => {
  const handleExportConversation = () => {
    // Implement export conversation logic
    console.log('Exporting conversation')
  }

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <AppIcon />
        {/* Add other header items as needed */}
      </div>

      <div className="flex items-center">
        <Button
          className="ml-2"
          onClick={handleExportConversation}
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2 inline" />
          <span>Export</span>
        </Button>
      </div>
    </header>
  )
}

export default Header