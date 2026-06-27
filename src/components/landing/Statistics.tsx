import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card } from '@/components/ui'
import { fadeUp } from '@/animations/variants'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
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
  }, [isInView, target])

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

export function Statistics() {
  return (
    <section id="statistics" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Trusted by IT Teams
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Real numbers from organizations managing their IT infrastructure with ITFlow.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-text-muted text-sm mt-2">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
