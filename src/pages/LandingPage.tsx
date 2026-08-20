import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { FiyroExperience } from '@/components/landing/FiyroExperience'
import { HeroWorkflowTransition } from '@/components/landing/HeroWorkflowTransition'
import { Features } from '@/components/landing/Features'
import { BehindTheOperation } from '@/components/landing/BehindTheOperation'
import { Statistics } from '@/components/landing/Statistics'
import { Testimonials } from '@/components/landing/Testimonials'
import { Contact } from '@/components/landing/Contact'
import { Footer } from '@/components/landing/Footer'
import { GlowBackground } from '@/components/ui'
import { PageTransition } from '@/components/ui'

export function LandingPage() {
  return (
    <PageTransition className="relative min-h-screen light-theme">
      <GlowBackground />
      <Navbar />
      {/* Hero window stage — the sticky Hero (cover) lives inside this bounded
          container so it is pinned only while the Workflow is revealed behind
          it, then releases naturally as the page continues. `isolate` makes the
          stage a self-contained stacking context so the Hero (z-20, front
          layer) always paints above the Workflow (z-0, back layer). */}
      <div className="relative isolate">
        {/* FRONT LAYER — the Hero cover. Kept as the first in-flow child so it
            sits at the top of the page; sticky + z-20 keeps it above the back
            layer at all scroll positions. */}
        <Hero />
        {/* BACK LAYER — HOW FIYRO WORKS + FiyroExperience, wrapped in their own
            stacking context at z-0 so no workflow descendant (including the 3D
            perspective/preserve-3d choreography) can paint above the cover. */}
        <div className="relative z-0">
          <HeroWorkflowTransition>
            <FiyroExperience />
          </HeroWorkflowTransition>
        </div>
      </div>
      {/* WHITE FOREGROUND — the CURTAIN layer. Normal-flow white content in
          front (z-10). This is the ONLY layer that moves upward; as it slides
          away it physically uncovers the Contact Sales scene pinned behind it. */}
      <div className="relative z-10 bg-bg-primary pb-[70px]">
        <Features />
        <BehindTheOperation />
        <Statistics />
        <Testimonials />
      </div>
      {/* CONTACT SALES STAGE — Contact Sales sits BEHIND the white foreground
          (z-0) and is pulled up 100svh so its full viewport is covered by the
          white curtain's final viewport. The sticky frame pins Contact Sales to
          the viewport while the white foreground scrolls up and uncovers it
          from the bottom up — Contact Sales itself never moves. The pin
          exhausts exactly when the reveal completes, so Contact Sales leaves
          normally and the Footer (the next sibling) follows immediately. */}
      <div className="relative isolate -mt-[100svh]">
        {/* BACK LAYER — Contact Sales: pinned, stationary, never translated. */}
        <div className="sticky top-0 z-0 h-svh w-full overflow-hidden">
          <Contact />
        </div>
        {/* ANCHOR — sits at the reveal-complete / pin-release point, so #contact
            scrolls to a fully-visible Contact Sales with the Footer's first
            pixels at the viewport bottom. Its height also provides the stage's
            handoff room below the pinned frame (where Contact Sales scrolls out
            as the Footer scrolls in). */}
        <div id="contact" aria-hidden="true" className="h-svh pointer-events-none" />
      </div>
      <Footer />
    </PageTransition>
  )
}
