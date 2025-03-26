// 头部组件，包含应用图标和导航按钮
import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid'
import AppIcon from '@/app/components/base/app-icon'

<Button
  className="ml-2"
  onClick={() => handleExportConversation()}
  icon={<ArrowDownTrayIcon className="w-4 h-4" />}
>
  <span>{t('app.chat.export')}</span>
</Button>
