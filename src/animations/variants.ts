import type { Transition, Variants } from 'framer-motion'

// Spring lebih empuk (tidak overshoot kasar)
export const springConfig: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 30,
}

// Easing standar untuk animasi smooth
const smoothEase: [number, number, number, number] = [0.25, 1, 0.5, 1] // kuartik ease-out

// ---------- PAGE TRANSITION ----------
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export const pageTransitionConfig: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
}

// ---------- CARD STAGGER ----------
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

// Transisi item card biar nggak pakai spring default
export const cardStaggerItemTransition: Transition = {
  duration: 0.4,
  ease: smoothEase,
}

// ---------- SIDEBAR ----------
export const sidebarSlide: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
}

export const sidebarSlideConfig: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
}

// ---------- MODAL ----------
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

// Transisi modal agar lembut dan cepat
export const modalTransition: Transition = {
  duration: 0.3,
  ease: smoothEase,
}

// ---------- FADE UP ----------
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export const fadeUpTransition: Transition = {
  duration: 0.5,
  ease: smoothEase,
}

// ---------- BUTTON HOVER ----------
export const buttonHover = {
  y: -4,
  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
}

// Spring ringan untuk tombol
export const buttonHoverTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
}

// ---------- DOOR ----------
export const doorLeft: Variants = {
  closed: { x: 0 },
  open: { x: '-100%' },
}

export const doorRight: Variants = {
  closed: { x: 0 },
  open: { x: '100%' },
}

export const doorTransition: Transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
}

// ---------- ZOOM BLUR ----------
export const zoomBlur: Variants = {
  initial: { scale: 1, filter: 'blur(0px)' },
  animate: { scale: 1.05, filter: 'blur(8px)' },
}

export const zoomBlurTransition: Transition = {
  duration: 1.5,
  ease: smoothEase,
}