import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { cardStaggerContainer, cardStaggerItem, fadeUp } from '@/animations/variants'

const testimonials = [
  {
    name: 'David Martinez',
    role: 'Plant Manager, Apex Manufacturing',
    quote: 'ITFlow transformed how we handle IT requests. Ticket resolution time dropped by 60% in the first quarter.',
    avatar: 'DM',
  },
  {
    name: 'Lisa Thompson',
    role: 'IT Director, Global Industries',
    quote: 'The QR asset tracking alone saved us countless hours. Technicians can pull up repair history instantly on the factory floor.',
    avatar: 'LT',
  },
  {
    name: 'James Wilson',
    role: 'Operations Lead, SteelWorks Corp',
    quote: 'Finally, a platform that understands industrial IT. The dashboard gives our leadership real visibility into IT performance.',
    avatar: 'JW',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            What Teams Say
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Hear from IT professionals who rely on ITFlow every day.
          </p>
        </motion.div>

        <motion.div
          variants={cardStaggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={cardStaggerItem}>
              <Card className="h-full flex flex-col">
                <p className="text-text-secondary text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
