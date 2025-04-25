import { getLocaleOnServer } from '@/i18n/server'
import { Metadata } from 'next'

import './styles/globals.css'
import './styles/markdown.scss'

export const metadata: Metadata = {
  icons: {
    icon: '/WAC-LOGO.svg',  // 将 SVG 文件放在 public 目录下
  },
}

const LocaleLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full">
      <body className="h-full">
        <div className="overflow-x-auto">
          <div className="w-screen h-screen min-w-[300px]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

export default LocaleLayout
