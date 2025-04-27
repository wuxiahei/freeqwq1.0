import type { FC } from 'react'
import classNames from 'classnames'
import Image from 'next/image'
import style from './style.module.css'

export type AppIconProps = {
  size?: 'xs' | 'tiny' | 'small' | 'medium' | 'large'
  rounded?: boolean
  icon?: string
  background?: string
  className?: string
}

const AppIcon: FC<AppIconProps> = ({
  size = 'medium',
  rounded = false,
  background,
  icon = '/app/components/chat/icons/1.png',  // 默认使用提供的图片路径
  className,
}) => {
  return (
    <span
      className={classNames(
        style.appIcon,
        size !== 'medium' && style[size],
        rounded && style.rounded,
        className ?? '',
      )}
      style={{
        background,
      }}
    >
      <Image 
        src={icon} 
        alt="App Icon" 
        width={size === 'xs' ? 16 : size === 'tiny' ? 20 : size === 'small' ? 24 : size === 'large' ? 40 : 32} 
        height={size === 'xs' ? 16 : size === 'tiny' ? 20 : size === 'small' ? 24 : size === 'large' ? 40 : 32}
        className={style.iconImage}
      />
    </span>
  )
}

export default AppIcon
