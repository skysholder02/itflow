import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui'
import { doorLeft, doorRight, doorTransition, springConfig } from '@/animations/variants'

type Step = 'doorClose' | 'workspaceInit' | 'doorOpen'

interface DesktopTransitionProps {
  onFinish: () => void
  onWorkspaceReady: () => void
  shouldProceed: boolean
}

export function DesktopTransition({ onFinish, onWorkspaceReady, shouldProceed }: DesktopTransitionProps) {
  const [step, setStep] = useState<Step>('doorClose')
  const [workspaceReady, setWorkspaceReady] = useState(false)

  // Timer-driven step progression.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    if (step === 'doorClose') {
      timers.push(setTimeout(() => setStep('workspaceInit'), 800))
    } else if (step === 'workspaceInit') {
      timers.push(setTimeout(() => setWorkspaceReady(true), 1200))
    } else if (step === 'doorOpen') {
      timers.push(setTimeout(() => onFinish(), 800))
    }

    return () => timers.forEach(clearTimeout)
  }, [step, onFinish])

  // Notify parent when workspace preparation finishes.
  useEffect(() => {
    if (workspaceReady && step === 'workspaceInit') {
      onWorkspaceReady()
    }
  }, [workspaceReady, step, onWorkspaceReady])

  // Advance to doorOpen when the parent signals (navigation done).
  useEffect(() => {
    if (shouldProceed && step === 'workspaceInit' && workspaceReady) {
      setStep('doorOpen')
    }
  }, [shouldProceed, step, workspaceReady])

  const doorsOpen = step === 'doorOpen'
  const showLogo = step !== 'doorOpen'

  return (
    <div className="absolute inset-0">
      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
          >
            <Logo size="lg" />
          </motion.div>
        </div>
      )}

      {step === 'workspaceInit' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-1/4 flex flex-col items-center gap-3"
          >
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-xs text-text-muted">Preparing Workspace</span>
          </motion.div>
        </div>
      )}

      <motion.div
        variants={doorLeft}
        initial="open"
        animate={doorsOpen ? 'open' : 'closed'}
        transition={doorTransition}
        className="absolute top-0 left-0 w-1/2 h-full bg-bg-primary border-r border-white/6 z-10"
      />
      <motion.div
        variants={doorRight}
        initial="open"
        animate={doorsOpen ? 'open' : 'closed'}
        transition={doorTransition}
        className="absolute top-0 right-0 w-1/2 h-full bg-bg-primary border-l border-white/6 z-10"
      />
    </div>
  )
}
