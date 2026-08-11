import type { ReactNode } from 'react'

interface HeroWorkflowTransitionProps {
  children: ReactNode
}

/**
 * Hero → Workflow bridge.
 *
 * The Hero is now a sticky window/panel that slides upward as the user scrolls,
 * revealing the Workflow behind it. This component renders a small editorial
 * "HOW FIYRO WORKS" label that belongs to the Workflow layer — it is revealed
 * naturally as the Hero panel rises out of the way.
 *
 * It intentionally applies NO transform/opacity wrapper to the workflow, so
 * FiyroExperience stays in its natural document position and its GSAP
 * ScrollTrigger measurements remain intact.
 */
export function HeroWorkflowTransition({ children }: HeroWorkflowTransitionProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="relative z-0 flex items-center justify-center gap-3 px-6 py-10 md:gap-4 md:py-12"
      >
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-brand-primary/60 md:w-16" />
        <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
          How FIYRO Works
        </p>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-primary/60 md:w-16" />
      </div>
      {children}
    </>
  )
}