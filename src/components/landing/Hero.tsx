import { motion } from 'framer-motion'
import { Button } from '@/components/ui'

export function Hero() {
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
        {/* Large headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text-primary leading-[1.05]"
        >
          <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
            One Platform
          </span>
          <br />
          For All IT Services
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="mt-5 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          Streamline ticketing, asset tracking, and infrastructure monitoring
          with a unified platform designed for modern IT operations.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

        {/* Floating glass stats element */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="glass-card p-1">
            <div className="rounded-[20px] bg-bg-secondary/60 p-6 md:p-10">
              <div className="grid grid-cols-3 gap-8 md:gap-12">
                {[
                  { label: 'Tickets Resolved', value: '1,248+', color: 'from-brand-primary' },
                  { label: 'Assets Tracked', value: '856+', color: 'from-brand-secondary' },
                  { label: 'System Uptime', value: '99.9%', color: 'from-brand-accent' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} to-text-primary bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-text-muted mt-2">{stat.label}</div>
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
