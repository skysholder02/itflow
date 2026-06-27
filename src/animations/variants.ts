import type { Transition, Variants } from 'framer-motion'

export const springConfig = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 20,
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
}

export const pageTransitionConfig: Transition = {
  ...springConfig,
  duration: 0.5,
}

export const cardStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
}

export const cardStaggerItem: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
}

export const sidebarSlide: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
}

export const sidebarSlideConfig: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
}

export const modalScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export const buttonHover = {
  y: -4,
  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
}

export const doorLeft: Variants = {
  closed: { x: 0 },
  open: { x: '-100%' },
}

export const doorRight: Variants = {
  closed: { x: 0 },
  open: { x: '100%' },
}

export const zoomBlur: Variants = {
  initial: { scale: 1, filter: 'blur(0px)' },
  animate: { scale: 1.05, filter: 'blur(8px)' },
}
