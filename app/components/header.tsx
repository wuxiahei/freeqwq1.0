import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'
interface HeaderProps {
  title: string
  isMobile: boolean
  onShowSideBar: () => void
  onCreateNewChat: () => void
  onExportConversation: () => void
}
const Header: FC<HeaderProps> = ({
  title,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
  onExportConversation,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-between h-12 px-3 bg-gray-100">
      {isMobile
        ? (
          <div
            className='flex items-center justify-center h-8 w-8 cursor-pointer'
            onClick={() => onShowSideBar?.()}
          >
            <Bars3Icon className="h-4 w-4 text-gray-500" />
          </div>
        )
        : <div></div>}
      <div className='flex items-center space-x-2'>
        <AppIcon size="small" />
        <div className=" text-sm text-gray-800 font-bold">{title}</div>
      </div>
      {isMobile
        ? (
          <>
            <div className='flex items-center justify-center h-8 w-8 cursor-pointer'
              onClick={() => onCreateNewChat?.()}
            >
              <PencilSquareIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportConversation}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                导出对话
              </button>
            </div>
          </>
        )
        : <div></div>}
    </div>
  )
}

export default React.memo(Header)
