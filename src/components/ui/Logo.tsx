import { cn } from '@/utils/cn'
import { motion, type Transition } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import iconDark from '@/assets/branding/fiyro-icon-dark.svg'
import iconLight from '@/assets/branding/fiyro-icon-light.svg'
import verticalDark from '@/assets/branding/fiyro-vertical-dark.svg'
import verticalLight from '@/assets/branding/fiyro-vertical-light.svg'
import horizontalDark from '@/assets/branding/fiyro-horizontal-dark.svg'
import horizontalLight from '@/assets/branding/fiyro-horizontal-light.svg'

type LogoVariant = 'icon' | 'vertical' | 'horizontal'

interface LogoProps {
  variant?: LogoVariant
  size?: 'sm' | 'md' | 'lg'
  /** Fixed pixel width; height auto-scales to preserve aspect ratio. */
  width?: number
  /** Fixed pixel height; width auto-scales to preserve aspect ratio. */
  height?: number
  layoutId?: string
  className?: string
  transition?: Transition
  /** Force the dark (white) variant regardless of active theme. */
  forceDark?: boolean
  /** Force the light (dark) variant regardless of active theme. */
  forceLight?: boolean
}

const assets = {
  icon: { dark: iconDark, light: iconLight },
  vertical: { dark: verticalDark, light: verticalLight },
  horizontal: { dark: horizontalDark, light: horizontalLight },
}

const sizes = {
  sm: 'h-7',
  md: 'h-10',
  lg: 'h-14',
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  width,
  height,
  layoutId,
  className,
  transition,
  forceDark = false,
  forceLight = false,
}: LogoProps) {
  const { theme } = useTheme()
  const mode = forceDark ? 'dark' : forceLight ? 'light' : theme
  const src = assets[variant][mode]

  const style =
    width != null || height != null
      ? { width: width != null ? `${width}px` : undefined, height: height != null ? `${height}px` : undefined }
      : undefined

  return (
    <motion.div
      layoutId={layoutId}
      transition={transition}
      className={cn('flex items-center', className)}
    >
      <img
        src={src}
        alt="FIYRO"
        style={style}
        className={style ? cn('w-auto') : cn('w-auto', sizes[size])}
      />
    </motion.div>
  )
}