import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setCount(target)
      return
    }
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target, reducedMotion])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

const stats = [
  { label: 'Tickets Resolved', value: 1248, suffix: '+' },
  { label: 'Assets Tracked', value: 856, suffix: '+' },
  { label: 'System Uptime', value: 99, suffix: '.9%' },
  { label: 'Active Users', value: 340, suffix: '+' },
]

const dividerClasses = [
  'border-r border-[var(--color-border-light)] lg:border-r-0',
  'lg:border-l',
  'border-r border-t border-[var(--color-border-light)] lg:border-t-0 lg:border-r-0 lg:border-l',
  'border-t border-[var(--color-border-light)] lg:border-t-0 lg:border-l',
]

export function Statistics() {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  const headerInitial = animate ? { opacity: 0, y: 20 } : false
  const headerWhileInView = animate ? { opacity: 1, y: 0 } : undefined
  const panelInitial = animate ? { opacity: 0, y: 24 } : false
  const panelWhileInView = animate ? { opacity: 1, y: 0 } : undefined

  return (
    <section id="statistics" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={headerInitial}
          whileInView={headerWhileInView}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            FIYRO By The Numbers
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
            Built to Keep IT Moving.
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl leading-relaxed">
            Real numbers from organizations managing IT infrastructure with
            FIYRO.
          </p>
        </motion.div>

        <motion.div
          initial={panelInitial}
          whileInView={panelWhileInView}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="relative mt-16"
        >
          {/* Restrained brand glow behind the shared surface */}
          <div
            className="absolute -inset-8 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08), transparent 65%)',
            }}
          />

          {/* One cohesive statistics surface */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-bg-secondary/70 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`relative px-6 py-10 md:py-14 text-center ${dividerClasses[i]}`}
                >
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-3 text-sm text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}