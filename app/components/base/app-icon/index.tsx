import classNames from 'classnames'
import style from './style.module.css'
import WacLogo from '@/public/WAC-LOGO.svg'

type Size = 'xs' | 'tiny' | 'small' | 'medium' | 'large'

export type AppIconProps = {
  size?: Size
  className?: string
  background?: string
  rounded?: boolean
  icon?: string
}

const AppIcon = ({
  size = 'medium',
  className,
  background = 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%)',
  rounded = false,
  icon,
}: AppIconProps) => {
  return (
    <span
      className={classNames(
        style.appIcon,
        size !== 'medium' && style[size],
        rounded && style.rounded,
        className ?? '',
        'flex items-center justify-center'
      )}
      style={{
        background,
      }}
    >
      <img
        src={icon || WacLogo.src}
        alt="Icon"
        className="w-15 h-15 object-contain"
      />
    </span>
  )
}

export default AppIcon
