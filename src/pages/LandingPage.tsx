import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { FiyroExperience } from '@/components/landing/FiyroExperience'
import { HeroWorkflowTransition } from '@/components/landing/HeroWorkflowTransition'
import { Features } from '@/components/landing/Features'
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
      <Features />
      <Statistics />
      <Testimonials />
      <Contact />
      <Footer />
    </PageTransition>
  )
}
