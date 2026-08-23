import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BehindTheOperationPlayer } from './BehindTheOperationPlayer'
import { getLandingMediaUrl } from '@/services/supabase/storage'

// Poster is served from the public `landing-media` Supabase Storage bucket
// (falls back to the legacy local path when Supabase is not configured).
// TODO(STEP 5D.17B): the 513 MB introduction video exceeds Supabase Storage's
// per-object size limit, so it is still served locally from
// public/videos/canopus-introduction.mp4. Once a <limit-compliant version is
// uploaded to landing-media/company/canopus-introduction.mp4, switch VIDEO_SRC
// to getLandingMediaUrl('company/canopus-introduction.mp4', '/videos/canopus-introduction.mp4').
const VIDEO_SRC = '/videos/canopus-introduction.mp4'
const VIDEO_POSTER = getLandingMediaUrl('company/canopuss.png', '/images/canopuss.png')

export function BehindTheOperation() {
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion
  const [playerOpen, setPlayerOpen] = useState(false)

  const headerInitial = animate ? { opacity: 0, y: 20 } : false
  const headerWhileInView = animate ? { opacity: 1, y: 0 } : undefined
  const mediaInitial = animate ? { opacity: 0, y: 24 } : false
  const mediaWhileInView = animate ? { opacity: 1, y: 0 } : undefined

  return (
    <section id="behind-the-operation" className="relative py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={headerInitial}
          whileInView={headerWhileInView}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            FIYRO
          </p>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
            Powering IT Operations at PT. Canopus Konverta Industri
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl leading-relaxed">
            Take a closer look at the environment, operations, and IT infrastructure that inspired FIYRO.
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => setPlayerOpen(true)}
          aria-label="Open Behind the Operation video"
          initial={mediaInitial}
          whileInView={mediaWhileInView}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="group relative mt-16 block w-full overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[#0b0b10] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.08)] cursor-pointer text-left md:mx-auto md:max-w-3xl lg:max-w-none"
        >
          <video
            src={VIDEO_SRC}
            poster={VIDEO_POSTER}
            preload="metadata"
            playsInline
            aria-hidden="true"
            tabIndex={-1}
            className="pointer-events-none block aspect-video w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white text-[#0b0b10] shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-transform duration-200 group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </motion.button>
      </div>

      <BehindTheOperationPlayer
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        src={VIDEO_SRC}
        poster={VIDEO_POSTER}
      />
    </section>
  )
}