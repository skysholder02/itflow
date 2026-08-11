import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

interface HeroWorkflowTransitionProps {
  children: ReactNode
}

/**
 * Hero → Workflow bridge.
 *
 * Renders a small editorial "HOW FIYRO WORKS" label, then reveals the
 * FiyroExperience section as if it emerges from the Hero. The reveal is
 * scroll-linked and finishes before the existing GSAP choreography starts
 * (which remains the owner of the workflow cards afterwards).
 */
export function HeroWorkflowTransition({ children }: HeroWorkflowTransitionProps) {
  const measureRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  const { scrollYProgress } = useScroll({
    target: measureRef,
    offset: ['start end', 'start 0.65'],
  })

  const labelOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1])
  const labelY = useTransform(scrollYProgress, [0, 0.25], [12, 0])

  const emergeY = useTransform(scrollYProgress, [0, 0.35], [30, 0])
  const emergeScale = useTransform(scrollYProgress, [0, 0.35], [0.985, 1])
  const emergeOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0.55, 1])

  return (
    <>
      {/* Transition label */}
      <motion.div
        style={animate ? { opacity: labelOpacity, y: labelY } : undefined}
        aria-hidden="true"
        className="relative z-10 flex items-center justify-center gap-3 px-6 py-10 md:gap-4 md:py-12"
      >
        <span
          className="h-px w-10 bg-gradient-to-r from-transparent to-brand-primary/60 md:w-16"
        />
        <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
          How FIYRO Works
        </p>
        <span
          className="h-px w-10 bg-gradient-to-l from-transparent to-brand-primary/60 md:w-16"
        />
      </motion.div>

      {/* Emergence wrapper — measured by an untransformed sibling to avoid feedback */}
      <div ref={measureRef} className="relative">
        <motion.div
          style={animate ? { y: emergeY, scale: emergeScale, opacity: emergeOpacity } : undefined}
          className="will-change-transform"
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}