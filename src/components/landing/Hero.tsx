import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { fadeUp } from '@/animations/variants'

export function Hero() {
  const navigate = useNavigate()

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              ITFlow
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-4 font-medium">
            One Platform for All IT Services.
          </p>
          <p className="text-text-muted max-w-2xl mx-auto mb-10 text-lg">
            Manage IT Tickets, Monitor Assets and Track Infrastructure in one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')}>
              Get Started
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 glass-card p-1 max-w-3xl mx-auto"
        >
          <div className="rounded-[20px] bg-bg-secondary/80 p-8 md:p-12">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Tickets', value: '248', color: 'from-brand-primary' },
                { label: 'Assets', value: '156', color: 'from-brand-secondary' },
                { label: 'Uptime', value: '99.9%', color: 'from-brand-accent' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.color} to-white bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
