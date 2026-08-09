import { motion, useReducedMotion } from 'framer-motion'
import { Button, Logo } from '@/components/ui'

const heroWorkflow = [
  { number: '01', title: 'Report' },
  { number: '02', title: 'Assign' },
  { number: '03', title: 'Fix' },
  { number: '04', title: 'Resolve' },
]

export function Hero() {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToDemo = () => {
    window.dispatchEvent(new CustomEvent('scroll-to-contact'))
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Soft gradient background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-brand-primary/5 via-brand-secondary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-brand-accent/4 to-brand-primary/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* FIYRO icon */}
        <motion.div
          initial={animate ? { opacity: 0, y: 30 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.02, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="flex justify-center mb-8"
        >
          <Logo variant="icon" width={120} forceLight />
        </motion.div>
        {/* Large headline */}
        <motion.h1
          initial={animate ? { opacity: 0, y: 30 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text-primary leading-[1.05]"
        >
          Fix Your Problem.
          <br />
          Anytime. Anywhere.
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="mt-5 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          A modern IT service platform that helps teams report issues,
          manage assets, and resolve problems faster.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" onClick={scrollToDemo}>
            Request Demo
          </Button>
          <Button variant="secondary" size="lg" onClick={scrollToFeatures}>
            Learn More
          </Button>
        </motion.div>

        {/* Workflow teaser — bridges Hero into FiyroExperience */}
        <motion.div
          initial={animate ? { opacity: 0, y: 60 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.65, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="glass-card p-1">
            <div className="rounded-[20px] bg-bg-secondary/60 p-6 md:p-10">
              <div className="flex items-center justify-center gap-3">
                <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-transparent to-brand-primary/50" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                  The FIYRO Workflow
                </p>
                <span aria-hidden="true" className="h-px w-10 bg-gradient-to-l from-transparent to-brand-primary/50" />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                {heroWorkflow.map((step) => (
                  <div key={step.number} className="group flex flex-col items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-bg-tertiary text-sm font-semibold text-brand-primary shadow-[0_2px_12px_rgba(0,0,0,0.04)] group-hover:bg-brand-primary/10 transition-colors duration-200">
                      {step.number}
                    </span>
                    <span className="text-sm font-semibold text-text-primary">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
