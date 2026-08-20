import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui'
import { cn } from '@/utils/cn'

const SHOWCASE_IMAGES = [
  {
    src: '/images/auth/slide-1.png',
    alt: 'ITFlow Dashboard',
    title: 'IT Dashboard',
    description: 'Monitor your entire IT operation from one place.',
  },
  {
    src: '/images/auth/slide-2.png',
    alt: 'ITFlow Ticket Management',
    title: 'Ticket Management',
    description: 'Track, manage, and resolve IT requests efficiently.',
  },
  {
    src: '/images/auth/slide-3.png',
    alt: 'ITFlow QR Code Asset System',
    title: 'QR Asset System',
    description: 'Scan assets instantly and access their information.',
  },
]

const SLIDE_INTERVAL_MS = 7000

export function AuthShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SHOWCASE_IMAGES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const currentImage = SHOWCASE_IMAGES[currentSlide]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-6 sm:p-8 lg:p-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <Logo variant="horizontal" width={132} forceLight />
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-primary">
          IT OPERATIONS PLATFORM
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Your entire IT,<br />in one place.
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">
          One workspace for your entire IT operation.
        </p>
      </header>

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_50px_rgba(15,23,42,0.10)]">
        <div className="relative flex items-center gap-2 border-b border-black/[0.06] bg-[#fafafa] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="pointer-events-none absolute inset-x-0 text-center text-xs font-medium tracking-wide text-slate-400">
            FIYRO
          </span>
        </div>
        <div className="relative aspect-video overflow-hidden bg-[#f0f2f8]">
          {SHOWCASE_IMAGES.map((image, index) => (
            <motion.img
              key={image.src}
              src={image.src}
              alt={image.alt}
              draggable={false}
              initial={false}
              className="absolute inset-0 h-full w-full object-contain"
              animate={{
                opacity: index === currentSlide ? 1 : 0,
                scale: index === currentSlide ? 1 : 1.03,
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-4 text-center">
        <p className="text-sm font-semibold tracking-tight text-slate-800">
          {currentImage.title}
        </p>
        <p className="text-xs leading-relaxed text-slate-500">
          {currentImage.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {SHOWCASE_IMAGES.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show ${image.title}`}
            aria-current={index === currentSlide}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === currentSlide
                ? 'w-6 bg-slate-800'
                : 'w-1.5 bg-slate-300 hover:bg-slate-400',
            )}
          />
        ))}
      </div>
    </div>
  )
}