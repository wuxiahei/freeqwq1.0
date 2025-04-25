import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'
import Tooltip from '@/app/components/base/tooltip'
import { useTranslation } from 'react-i18next'

export type IHeaderProps = {
  title: string
  onHideSideBar?: () => void
  onCreateNewChat?: () => void
}

const Header: FC<IHeaderProps> = ({
  title,
  onHideSideBar,
  onCreateNewChat,
}) => {
  const { t } = useTranslation()
  return (
    <div className="shrink-0 flex items-center justify-between h-12 px-2 mt-2 bg-gray-100">
      <div className='flex items-center justify-between w-full'>
        <div onClick={onCreateNewChat} className='flex items-center space-x-2 pl-2'>
          <AppIcon size="small" />
          {/* <div className="text-sm text-gray-800 font-bold">{title}</div> */}
        </div>
        <div className="flex justify-center px-4">
          <div className="text-gray-400 font-normal text-xs">{title}</div>
        </div>
        <Tooltip selector='sidebar-close'
          position='right'
          htmlContent={
            <div>
              <div>{t('common.operation.closeSidebar')}</div>
            </div>
          }
        >
          <button className="p-1 w-8 h-8 hover:bg-gray-200 rounded-lg flex items-center justify-center"
            onClick={onHideSideBar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 1024 1024" className="iconify text-gray-500"><path d="M861.866667 162.133333c-17.066667-17.066667-42.666667-29.866667-68.266667-29.866666H226.133333c-25.6 0-51.2 8.533333-68.266666 29.866666S128 204.8 128 230.4v567.466667c0 25.6 8.533333 51.2 29.866667 68.266666 17.066667 17.066667 42.666667 29.866667 68.266666 29.866667h567.466667c25.6 0 51.2-8.533333 68.266667-29.866667 17.066667-17.066667 29.866667-42.666667 29.866666-68.266666V226.133333c0-25.6-8.533333-46.933333-29.866666-64zM366.933333 814.933333H226.133333c-4.266667 0-8.533333 0-12.8-4.266666-4.266667-4.266667-4.266667-8.533333-4.266666-12.8V226.133333c0-4.266667 0-8.533333 4.266666-12.8 4.266667-4.266667 8.533333-4.266667 12.8-4.266666h140.8v605.866666z m448-17.066666c0 4.266667 0 8.533333-4.266666 12.8-4.266667 4.266667-8.533333 4.266667-12.8 4.266666h-354.133334V209.066667h354.133334c4.266667 0 8.533333 0 12.8 4.266666 4.266667 4.266667 4.266667 8.533333 4.266666 12.8v571.733334z" fill="currentColor" /></svg>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default React.memo(Header)
