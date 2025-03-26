import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'
import { Button } from '@/components/ui/button' // Adjust import path as needed
import { useTranslation } from 'next-i18next' // Assuming you're using next-i18next for translations

const Header: FC = () => {
  const { t } = useTranslation()

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
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          <span>{t('app.chat.export')}</span>
        </Button>
      </div>
    </header>
  )
}

export default Header