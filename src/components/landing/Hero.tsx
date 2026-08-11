import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

interface FloatingCardProps {
  className?: string
  children: ReactNode
  entranceDelay?: number
  floatY?: number
  duration?: number
  floatDelay?: number
  exitStyle?: MotionStyle
}

function FloatingCard({
  className,
  children,
  entranceDelay = 0.7,
  floatY = -8,
  duration = 6,
  floatDelay = 0,
  exitStyle,
}: FloatingCardProps) {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  return (
    <motion.div
      style={reducedMotion ? undefined : exitStyle}
      className={className}
    >
      <motion.div
        initial={animate ? { opacity: 0, y: 28, scale: 0.96 } : false}
        animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ delay: entranceDelay, duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="h-full transform-gpu"
      >
        <motion.div
          animate={animate ? { y: [0, floatY, 0] } : undefined}
          transition={
            animate
              ? { duration, repeat: Infinity, ease: 'easeInOut', delay: 0.9 + floatDelay }
              : undefined
          }
          className="h-full transform-gpu"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Hero collapse — scroll-linked (does NOT animate the workflow panels below)
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -40])
  const contentScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.96])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 0.5, 0.35])
  const subY = useTransform(scrollYProgress, [0, 0.55], [0, -24])
  const subOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.4])

  // Floating card exits — gentle outward drift, slight scale-down, fade
  const cardAExit = {
    x: useTransform(scrollYProgress, [0, 0.45], [0, 22]),
    y: useTransform(scrollYProgress, [0, 0.45], [0, -20]),
    scale: useTransform(scrollYProgress, [0, 0.45], [1, 0.97]),
    opacity: useTransform(scrollYProgress, [0.25, 0.55], [1, 0]),
  }
  const chipExit = {
    x: useTransform(scrollYProgress, [0, 0.45], [0, 18]),
    y: useTransform(scrollYProgress, [0, 0.45], [0, -14]),
    scale: useTransform(scrollYProgress, [0, 0.45], [1, 0.98]),
    opacity: useTransform(scrollYProgress, [0.25, 0.55], [1, 0]),
  }
  const cardBExit = {
    x: useTransform(scrollYProgress, [0, 0.45], [0, -24]),
    y: useTransform(scrollYProgress, [0, 0.45], [0, 18]),
    scale: useTransform(scrollYProgress, [0, 0.45], [1, 0.97]),
    opacity: useTransform(scrollYProgress, [0.25, 0.55], [1, 0]),
  }

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToDemo = () => {
    window.dispatchEvent(new CustomEvent('scroll-to-contact'))
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-24 lg:pb-28 lg:pt-28"
    >
      {/* ============ BACKGROUND LAYER ============ */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {/* masked grid texture — continues the page's surface language */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage:
              'radial-gradient(ellipse at 42% 42%, black 30%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at 42% 42%, black 30%, transparent 78%)',
          }}
        />

        {/* soft FIYRO blue glows — asymmetric, away from the editorial column */}
        <div className="absolute left-[8%] top-[4%] h-[460px] w-[460px] rounded-full bg-gradient-to-b from-brand-primary/5 via-brand-secondary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-[4%] right-[10%] h-[420px] w-[420px] rounded-full bg-gradient-to-l from-brand-accent/5 to-brand-primary/5 blur-3xl" />

        {/* oversized background typography */}
        <motion.span
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ delay: 0.3, duration: 1.4, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-end overflow-hidden"
        >
          <span className="select-none whitespace-nowrap text-[20vw] font-black leading-none tracking-[-0.05em] text-brand-primary/5 md:text-[16vw] lg:text-[12rem] xl:text-[13.5rem]">
            IT SUPPORT
          </span>
        </motion.span>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <motion.div
        style={animate ? { y: contentY, scale: contentScale, opacity: contentOpacity } : undefined}
        className="relative z-10 w-full max-w-7xl px-6 transform-gpu"
      >
        <div className="max-w-3xl">
          {/* eyebrow */}
          <motion.div
            initial={animate ? { opacity: 0, y: 16 } : false}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-3"
          >
            <span
              aria-hidden="true"
              className="h-px w-10 bg-gradient-to-r from-brand-primary/60 to-transparent"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              FIYRO · IT Service Platform
            </p>
          </motion.div>

          {/* headline — the dominant editorial element */}
          <motion.h1
            initial={animate ? { opacity: 0, y: 30 } : false}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="mt-6 max-w-4xl text-[clamp(2.5rem,6.5vw,5.75rem)] font-bold leading-[1.04] tracking-[-0.03em] text-text-primary"
          >
            <span className="block">Fix Your Problem.</span>
            <span className="block">
              Anytime. <span className="text-brand-primary">Anywhere.</span>
            </span>
          </motion.h1>

          <motion.div
            style={animate ? { y: subY, opacity: subOpacity } : undefined}
            className="transform-gpu"
          >
            {/* supporting text */}
            <motion.p
              initial={animate ? { opacity: 0, y: 20 } : false}
              animate={animate ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="mt-6 max-w-xl text-lg text-text-secondary leading-relaxed md:text-xl"
            >
              A modern IT service platform that helps teams report issues, manage
              assets, and resolve problems faster.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={animate ? { opacity: 0, y: 20 } : false}
              animate={animate ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.45, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <Button size="lg" onClick={scrollToDemo}>
                Request Demo
              </Button>
              <Button variant="secondary" size="lg" onClick={scrollToFeatures}>
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ============ FLOATING FIYRO UI ELEMENTS ============ */}
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        {/* Card A — live ticket */}
        <FloatingCard
          className="absolute bottom-4 right-4 w-44 md:bottom-[12%] md:right-[6%] md:top-auto md:w-[230px] lg:bottom-auto lg:right-[6%] lg:top-[16%] lg:w-[258px] xl:right-[7%] xl:w-[278px]"
          entranceDelay={0.7}
          floatY={-8}
          duration={6}
          exitStyle={animate ? cardAExit : undefined}
        >
          <div className={cn('glass-card w-full p-4')}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                IT Support
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-text-primary">Printer Issue</p>
            <p className="mt-0.5 text-xs text-text-muted">Ticket #1024 · Queue 01</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                Status
              </span>
              <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                Resolved
              </span>
            </div>
          </div>
        </FloatingCard>

        {/* small stat chip */}
        <FloatingCard
          className="absolute right-[14%] top-[40%] hidden xl:flex"
          entranceDelay={0.85}
          floatY={-6}
          duration={5.5}
          floatDelay={0.8}
          exitStyle={animate ? chipExit : undefined}
        >
          <div
            className={cn(
              'glass-card flex items-center gap-2.5 px-4 py-2.5',
            )}
          >
            <span className="text-brand-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </span>
            <span className="whitespace-nowrap text-xs font-semibold text-text-primary">
              1,248 tickets resolved
            </span>
          </div>
        </FloatingCard>

        {/* Card B — asset status */}
        <FloatingCard
          className="absolute bottom-[16%] right-[10%] hidden w-[236px] lg:block xl:right-[12%] xl:w-[252px]"
          entranceDelay={1}
          floatY={-9}
          duration={7}
          floatDelay={0.4}
          exitStyle={animate ? cardBExit : undefined}
        >
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Asset Status
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/60" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" rx="1" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">Printer — Production</p>
                <p className="text-xs text-text-muted">Bldg 2 / Floor 3</p>
              </div>
            </div>
            <span className="mt-4 inline-block rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
              Operational
            </span>
          </div>
        </FloatingCard>
      </div>
    </section>
  )
}