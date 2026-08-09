import { motion, useReducedMotion } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'David Martinez',
    role: 'Plant Manager, Apex Manufacturing',
    quote: 'FIYRO transformed how we handle IT requests. Ticket resolution time dropped 60% in the first quarter.',
  },
  {
    name: 'Lisa Thompson',
    role: 'IT Director, Global Industries',
    quote: 'QR Code asset tracking saves us tremendous time. Technicians can view repair history right at the work site.',
  },
  {
    name: 'James Wilson',
    role: 'Operations Lead, SteelWorks Corp',
    quote: 'Finally, a platform that understands operational IT needs. The dashboard gives real visibility into IT performance.',
  },
]

function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-semibold ${
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
      }`}
    >
      {initials}
    </span>
  )
}

export function Testimonials() {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  const headerInitial = animate ? { opacity: 0, y: 20 } : false
  const headerWhileInView = animate ? { opacity: 1, y: 0 } : undefined
  const cardInitial = animate ? { opacity: 0, y: 24 } : false
  const cardWhileInView = animate ? { opacity: 1, y: 0 } : undefined

  const primary = testimonials[0]
  const secondary = testimonials.slice(1)

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      {/* Slightly richer layered surface — continues the page's depth rhythm */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse at center, black 25%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 25%, transparent 72%)',
          }}
        />
        <div
          className="absolute -right-1/4 top-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(168, 85, 247, 0.05), transparent 60%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={headerInitial}
          whileInView={headerWhileInView}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            What People Say
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
            Built Around the People Who Use It.
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl leading-relaxed">
            Stories from IT professionals using FIYRO every day.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Primary testimonial — the human focus */}
          <motion.div
            className="lg:col-span-3"
            initial={cardInitial}
            whileInView={cardWhileInView}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            <figure className="group relative overflow-hidden h-full rounded-2xl border border-[var(--color-border-light)] bg-bg-secondary/60 p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300">
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(ellipse at 85% 15%, rgba(99, 102, 241, 0.07), transparent 50%)',
                }}
              />
              <blockquote className="relative">
                <Quote
                  aria-hidden="true"
                  className="h-9 w-9 text-brand-primary/60"
                />
                <p className="mt-6 text-xl md:text-2xl leading-relaxed text-text-secondary">
                  &ldquo;{primary.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="relative mt-8 flex items-center gap-3">
                <InitialsAvatar name={primary.name} size="md" />
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    {primary.name}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {primary.role}
                  </div>
                </div>
              </figcaption>
            </figure>
          </motion.div>

          {/* Secondary testimonials — lighter supporting voices */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {secondary.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={cardInitial}
                whileInView={cardWhileInView}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.5,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                <figure className="group h-full rounded-2xl border border-[var(--color-border-light)] bg-bg-tertiary p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div
                    aria-hidden="true"
                    className="h-px w-8 bg-gradient-to-r from-brand-primary to-transparent"
                  />
                  <blockquote className="mt-4">
                    <p className="text-sm md:text-base leading-relaxed text-text-secondary">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                  </blockquote>
                  <figcaption className="mt-5">
                    <div className="text-sm font-semibold text-text-primary">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {testimonial.role}
                    </div>
                  </figcaption>
                </figure>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}