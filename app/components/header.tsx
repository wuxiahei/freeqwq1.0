import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon
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
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')

    // 调用导出接口逻辑
    console.log('Exporting conversation as', timestamp)
  }

  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <AppIcon />
        {/* Add other header items as needed */}
      </div>

      <div className="flex items-center">
        {/* 已移除导出按钮 */}
      </div>
    </header>
  )
}

export default Header