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
      <Hero />
      <HeroWorkflowTransition>
        <FiyroExperience />
      </HeroWorkflowTransition>
      <Features />
      <Statistics />
      <Testimonials />
      <Contact />
      <Footer />
    </PageTransition>
  )
}
