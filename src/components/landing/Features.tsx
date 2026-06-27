import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { cardStaggerContainer, cardStaggerItem, fadeUp } from '@/animations/variants'

const features = [
  {
    icon: '🎫',
    title: 'Smart Ticketing',
    description: 'Create, track, and resolve IT tickets with priority-based workflows and real-time status updates.',
  },
  {
    icon: '💻',
    title: 'Asset Management',
    description: 'Track every device, printer, and access point across your entire industrial infrastructure.',
  },
  {
    icon: '📱',
    title: 'QR Asset Tracking',
    description: 'Generate QR codes for instant asset lookup, repair history, and status verification on-site.',
  },
  {
    icon: '📊',
    title: 'Infrastructure Monitoring',
    description: 'Monitor network health, device status, and system performance from a unified dashboard.',
  },
  {
    icon: '📈',
    title: 'Analytics & Reports',
    description: 'Gain insights with category breakdowns, resolution metrics, and trend analysis for IT leadership.',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Stay informed with real-time alerts for critical tickets, asset maintenance, and system events.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Everything You Need
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            A comprehensive IT service management platform built for industrial environments.
          </p>
        </motion.div>

        <motion.div
          variants={cardStaggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardStaggerItem}>
              <Card hover className="h-full">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
