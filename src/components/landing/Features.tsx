import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'

const features = [
  {
    title: 'Ticket Management',
    description: 'Create, track, and resolve IT tickets with priority-based workflows and real-time status updates.',
  },
  {
    title: 'Asset Management',
    description: 'Monitor every device, printer, and access point across your entire operational infrastructure from a single view.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'QR Asset Tracking',
    description: 'Generate QR codes for instant asset lookup, maintenance history, and status checks directly at the location.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M18 14h3v3" />
        <path d="M14 18v3h3" />
        <path d="M14 14h1" />
      </svg>
    ),
  },
  {
    title: 'Vendor Management',
    description: 'Assign vendors, track job progress, and streamline coordination with external IT support partners.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9h1" />
        <path d="M9 13h1" />
        <path d="M9 17h1" />
      </svg>
    ),
  },
  {
    title: 'IT Support Workflow',
    description: 'End-to-end workflow automation for IT support requests, from initial submission through to resolution.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
]

const SLIDE_IMAGES = [
  { src: '/images/auth/slide-1.png', alt: 'ITFlow Dashboard preview' },
  { src: '/images/auth/slide-2.png', alt: 'ITFlow Ticket Management preview' },
  { src: '/images/auth/slide-3.png', alt: 'ITFlow QR Asset System preview' },
]

const SLIDE_INTERVAL_MS = 5000

export function Features() {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  const headerInitial = animate ? { opacity: 0, y: 20 } : false
  const headerWhileInView = animate ? { opacity: 1, y: 0 } : undefined
  const featuredInitial = animate ? { opacity: 0, y: 24, scale: 0.985 } : false
  const featuredWhileInView = animate ? { opacity: 1, y: 0, scale: 1 } : undefined

  const featured = features[0]
  const supporting = features.slice(1)

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Layered background — continues the FiyroExperience depth language */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
        <div
          className="absolute -left-1/4 top-1/3 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(99, 102, 241, 0.05), transparent 60%)',
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
            FIYRO Capabilities
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
            Everything You Need to Solve IT Problems.
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl leading-relaxed">
            FIYRO structures how your organization handles IT — from problem
            reporting and assignment to asset management, service delivery, and
            resolution.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Featured capability — visually dominant */}
          <motion.div
            className="lg:col-span-3"
            initial={featuredInitial}
            whileInView={featuredWhileInView}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-bg-secondary/70 backdrop-blur-sm border border-[var(--color-border-light)] shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 15% 20%, rgba(99, 102, 241, 0.07), transparent 55%)',
                }}
              />
              <div className="relative flex flex-col px-6 sm:px-10 md:px-14 pt-10 md:pt-14 pb-6 md:pb-8">
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
                  {featured.title}
                </h3>
                <div
                  aria-hidden="true"
                  className="mt-6 h-px w-12 bg-brand-primary/40"
                />
                <p className="mt-6 text-base text-text-secondary leading-relaxed max-w-lg">
                  {featured.description}
                </p>
              </div>
              <FeaturedCarousel />
            </div>
          </motion.div>

          {/* Supporting capabilities — refined list */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {supporting.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={featuredInitial}
                whileInView={featuredWhileInView}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.5,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                <article className="group h-full p-5 rounded-2xl bg-bg-tertiary border border-[var(--color-border-light)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary/15 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {feature.title}
                      </h3>
                      <div
                        aria-hidden="true"
                        className="mt-2 h-px w-8 bg-gradient-to-r from-brand-primary to-transparent"
                      />
                      <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedCarousel() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDE_IMAGES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <div className="relative mt-8 md:mt-10 mx-6 sm:mx-10 md:mx-14 mb-8 md:mb-10 overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[#fafafa] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_40px_rgba(0,0,0,0.07)]">
        <div className="relative flex items-center gap-1.5 border-b border-[var(--color-border-light)] px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="pointer-events-none absolute inset-x-0 text-center text-[10px] font-medium tracking-wide text-slate-400">
            fiyro.app/tickets
          </span>
        </div>
        <div className="relative aspect-video overflow-hidden bg-[#f0f2f8] transition-transform duration-300 ease-out group-hover:scale-[1.02]">
          {SLIDE_IMAGES.map((image, index) => (
            <motion.img
              key={image.src}
              src={image.src}
              alt={image.alt}
              draggable={false}
              initial={false}
              aria-hidden={index !== activeSlide}
              className="absolute inset-0 h-full w-full object-contain"
              animate={{ opacity: index === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
      <div className="mx-6 sm:mx-10 md:mx-14 mb-10 md:mb-14 mt-4 flex items-center justify-center gap-2.5">
        {SLIDE_IMAGES.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show ${image.alt}`}
            aria-current={index === activeSlide}
            onClick={() => setActiveSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === activeSlide
                ? 'w-6 bg-text-secondary'
                : 'w-2 bg-text-muted/50 hover:bg-text-muted',
            )}
          />
        ))}
      </div>
    </>
  )
}