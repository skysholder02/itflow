import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const workflowSteps = [
  {
    number: '01',
    title: 'Report',
    description:
      'Team members raise the moment something stops working, capturing the details needed to act quickly.',
  },
  {
    number: '02',
    title: 'Assign',
    description:
      'FIYRO routes every request to the right IT support team or vendor based on context, priority, and expertise.',
  },
  {
    number: '03',
    title: 'Fix',
    description:
      'IT teams and vendors execute the work while status stays visible from a single, shared view.',
  },
  {
    number: '04',
    title: 'Resolve',
    description:
      'Issues are closed with a complete record, and every problem becomes a confirmed step forward.',
  },
]

interface WorkflowChoreographyConfig {
  root: HTMLElement
  start: string
  end: string
  baseScale: number
  activeZ: number
  settleZ: number
  finalZ: number
  sceneIntro: { rotationY: number; rotationX: number }
  sceneFocus: { rotationY: number; rotationX: number }
  bgY: [number, number]
  fgY: [number, number]
  flipStart: number
  flipStagger: number
  flipDuration: number
}

function buildWorkflowChoreography(cfg: WorkflowChoreographyConfig) {
  const q = gsap.utils.selector(cfg.root)
  const panels = q('[data-fiyro-panel]')
  const dots = q('[data-fiyro-progress-dot]')
  const labels = q('[data-fiyro-progress-label]')

  gsap.set(panels, {
    y: 24,
    scale: cfg.baseScale,
    z: -cfg.activeZ * 0.8,
  })
  gsap.set(labels, { opacity: 0.5 })
  gsap.set(dots, { scale: 0, opacity: 0 })
  gsap.set('[data-fiyro-progress-fill]', { scaleX: 0 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: cfg.root,
      start: cfg.start,
      end: cfg.end,
      scrub: 1,
    },
    defaults: { ease: 'none' },
  })

  // 3D FLIP — back → front, cascading left → right, bound to scroll scrub.
  // The card inner rotates 180deg (back face shown) → 0deg (front face shown).
  // Each card flips in sequence so the wave reads REPORT → ASSIGN → FIX → RESOLVE.
  const cardInners = q('[data-fiyro-card-inner]')
  tl.set(cardInners, { rotationY: 180 }, 0)
  cardInners.forEach((inner, i) => {
    tl.to(
      inner,
      { rotationY: 0, duration: cfg.flipDuration, ease: 'sine.inOut' },
      cfg.flipStart + i * cfg.flipStagger,
    )
  })

  // PHASE 1 — INTRO: calm, neutral beginning
  tl.to(
    panels,
    {
      y: 8,
      scale: cfg.baseScale + 0.015,
      duration: 0.18,
    },
    0,
  ).to(
    '[data-fiyro-scene]',
    {
      rotationY: cfg.sceneIntro.rotationY,
      rotationX: cfg.sceneIntro.rotationX,
      duration: 0.18,
    },
    0,
  )

  // PHASE 2 — WORKFLOW REVEAL, sequential depth choreography
  panels.forEach((panel, i) => {
    const start = 0.18 + i * 0.1
    const duration = 0.14
    const glow = panel.querySelector('[data-fiyro-panel-glow]')
    const dot = dots[i]
    const label = labels[i]

    tl.to(
      panel,
      {
        y: 0,
        scale: 1.01,
        z: cfg.activeZ,
        duration,
      },
      start,
    )
    if (glow) tl.to(glow, { opacity: 0.4, duration }, start)
    if (dot) tl.to(dot, { opacity: 1, scale: 1, duration }, start)
    if (label) tl.to(label, { opacity: 1, duration }, start)

    tl.to(
      panel,
      { scale: 0.985, z: cfg.settleZ, duration: 0.16 },
      start + duration,
    )
  })

  // FIX becomes the visual focus with a gentle scene tilt
  tl.to(
    '[data-fiyro-scene]',
    {
      rotationY: cfg.sceneFocus.rotationY,
      rotationX: cfg.sceneFocus.rotationX,
      duration: 0.22,
    },
    0.46,
  )

  // Progress strip draws across the reveal
  tl.to('[data-fiyro-progress-fill]', { scaleX: 1, duration: 0.5 }, 0.3)

  // PHASE 3 — RESOLUTION, settle into a composed connected state
  tl.to(
    '[data-fiyro-scene]',
    { rotationY: 0, rotationX: 0, duration: 0.3 },
    0.7,
  )
  tl.to(
    panels,
    { y: 0, scale: 1, z: cfg.finalZ, duration: 0.3 },
    0.7,
  )

  // Parallax depth across the whole scroll
  tl.fromTo(
    '[data-fiyro-layer="background"]',
    { y: cfg.bgY[0] },
    { y: cfg.bgY[1], duration: 1 },
    0,
  )
  tl.fromTo(
    '[data-fiyro-layer="foreground"]',
    { y: cfg.fgY[0] },
    { y: cfg.fgY[1], duration: 1 },
    0,
  )
}

export function FiyroExperience() {
  const rootRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        buildWorkflowChoreography({
          root,
          start: 'top 75%',
          end: 'bottom 25%',
          baseScale: 0.965,
          activeZ: 28,
          settleZ: -6,
          finalZ: 6,
          sceneIntro: { rotationY: -2, rotationX: 1 },
          sceneFocus: { rotationY: 3, rotationX: -1.5 },
          bgY: [30, -30],
          fgY: [-40, 40],
          flipStart: 0.08,
          flipStagger: 0.12,
          flipDuration: 0.36,
        })
      })

      mm.add('(min-width: 768px) and (max-width: 1023.98px)', () => {
        buildWorkflowChoreography({
          root,
          start: 'top 80%',
          end: 'bottom 20%',
          baseScale: 0.975,
          activeZ: 20,
          settleZ: -4,
          finalZ: 4,
          sceneIntro: { rotationY: -1.5, rotationX: 0.5 },
          sceneFocus: { rotationY: 2, rotationX: -1 },
          bgY: [20, -20],
          fgY: [-24, 24],
          flipStart: 0.08,
          flipStagger: 0.08,
          flipDuration: 0.24,
        })
      })

      mm.add('(max-width: 767.98px)', () => {
        const q = gsap.utils.selector(root)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 85%',
            end: 'bottom 10%',
            scrub: 1,
          },
          defaults: { ease: 'none' },
        })

        // Simple mobile choreography — no scene rotation, no translateZ
        // Gentle 3D flip: back → front, cascading left → right, scrub-bound.
        const cardInners = q('[data-fiyro-card-inner]')
        tl.set(cardInners, { rotationY: 180 }, 0)
        cardInners.forEach((inner, i) => {
          tl.to(
            inner,
            { rotationY: 0, duration: 0.2, ease: 'sine.inOut' },
            0.04 + i * 0.06,
          )
        })
        tl.fromTo(
          q('[data-fiyro-panel]'),
          { y: 18 },
          { y: 0, duration: 1 },
          0,
        )
          .fromTo(
            '[data-fiyro-layer="background"]',
            { y: 16 },
            { y: -16, duration: 1 },
            0,
          )
          .fromTo(
            '[data-fiyro-layer="foreground"]',
            { y: -12 },
            { y: 12, duration: 1 },
            0,
          )
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="fiyro-experience"
      className="relative py-24 overflow-hidden"
    >
      {/* BACKGROUND LAYER — slow decorative depth */}
      <div
        data-fiyro-layer="background"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
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
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[540px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(99, 102, 241, 0.06), transparent 62%)',
          }}
        />
      </div>

      {/* MIDDLE LAYER — the workflow structure */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <p
            data-fiyro-header
            className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary"
          >
            FIYRO Workflow
          </p>
          <h2
            data-fiyro-header
            className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight"
          >
            From Problem to Resolution.
          </h2>
          <p
            data-fiyro-description
            className="mt-4 text-lg text-text-secondary max-w-xl leading-relaxed"
          >
            FIYRO connects problem reporting, assignment, work execution, and
            resolution in one continuous workflow — so every issue moves
            quickly from incident to outcome.
          </p>
        </div>

        {/* Stage progression strip — connects REPORT → ASSIGN → FIX → RESOLVE */}
        <div
          data-fiyro-progress
          className="hidden md:block relative max-w-xl mt-12"
          aria-hidden="true"
        >
          <div className="absolute top-[6px] left-0 right-0 h-px bg-[var(--color-border-light)]" />
          <div
            data-fiyro-progress-fill
            className="absolute top-[6px] left-0 h-px w-full origin-left bg-gradient-to-r from-brand-primary to-brand-accent"
          />
          <div className="relative flex justify-between">
            {workflowSteps.map((step) => (
              <div key={step.number} className="flex flex-col items-center gap-2">
                <div className="relative h-[13px] w-[13px]">
                  <div className="absolute inset-0 rounded-full border border-[var(--color-border-light)] bg-bg-tertiary" />
                  <div
                    data-fiyro-progress-dot
                    className="absolute inset-0 rounded-full bg-brand-primary"
                  />
                </div>
                <span
                  data-fiyro-progress-label
                  className="text-[10px] font-semibold tracking-widest text-text-muted"
                >
                  {step.number}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 [perspective:1200px]">
          <div
            data-fiyro-scene
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 [transform-style:preserve-3d]"
          >
            {workflowSteps.map((step) => (
              <article
                key={step.number}
                data-fiyro-panel
                className="group relative h-full [transform-style:preserve-3d]"
              >
                <div
                  data-fiyro-card-inner
                  className="relative h-full [transform-style:preserve-3d]"
                >
                  {/* FRONT FACE — the existing workflow card */}
                  <div
                    data-fiyro-card-front
                    className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-bg-tertiary border border-[var(--color-border-light)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-7 [backface-visibility:hidden]"
                  >
                    <div
                      data-fiyro-panel-glow
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12), transparent 70%)',
                      }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-widest text-text-muted">
                        {step.number}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-brand-primary/50"
                      />
                    </div>
                    <h3 className="relative mt-5 text-base font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <div
                      aria-hidden="true"
                      className="relative mt-3 h-px w-8 bg-gradient-to-r from-brand-primary to-transparent"
                    />
                    <p className="relative mt-4 text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* BACK FACE — minimal premium flip face (initial state: hidden behind front) */}
                  <div
                    data-fiyro-card-back
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-bg-tertiary border border-[var(--color-border-light)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-7 [transform:rotateY(180deg)] [backface-visibility:hidden]"
                    aria-hidden="true"
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      aria-hidden="true"
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
                      className="absolute right-[-20%] bottom-[-30%] w-48 h-48 rounded-full pointer-events-none"
                      aria-hidden="true"
                      style={{
                        background:
                          'radial-gradient(circle at center, rgba(99, 102, 241, 0.08), transparent 62%)',
                      }}
                    />
                    <div className="relative flex items-start justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
                        FIYRO
                      </span>
                      <span className="text-xs font-semibold tracking-widest text-brand-primary">
                        {step.number}
                      </span>
                    </div>
                    <div className="relative mt-auto pt-8">
                      <div
                        aria-hidden="true"
                        className="h-px w-8 bg-gradient-to-r from-brand-primary to-transparent"
                      />
                      <span className="block mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
                        Workflow
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* FOREGROUND LAYER — fast decorative accents */}
      <div
        data-fiyro-layer="foreground"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute right-[8%] top-[16%] w-20 h-20 rounded-full border border-[var(--color-border-light)] opacity-70" />
        <div className="absolute left-[6%] bottom-[14%] w-4 h-4 rotate-45 bg-brand-primary/10" />
      </div>
    </section>
  )
}