import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui'
import { doorLeft, doorRight, doorTransition, springConfig } from '@/animations/variants'

type Step = 'doorClose' | 'workspaceInit' | 'doorOpen' | 'dashboardReveal'

const initSteps = [
  { label: 'Authentication Verified' },
  { label: 'User Profile Loaded' },
  { label: 'Permission Checked' },
  { label: 'Workspace Prepared' },
]

interface DesktopTransitionProps {
  onFinish: () => void
  onDoorsClosed: () => void
  shouldProceed: boolean
}

export function DesktopTransition({ onFinish, onDoorsClosed, shouldProceed }: DesktopTransitionProps) {
  const [step, setStep] = useState<Step>('doorClose')
  const [workspaceReady, setWorkspaceReady] = useState(false)

  // Count completed door panels to know when both have finished.
  const doorCloseCountRef = useRef(0)
  const doorOpenCountRef = useRef(0)

  const onDoorCloseComplete = useCallback(() => {
    doorCloseCountRef.current += 1
    if (doorCloseCountRef.current >= 2) {
      doorCloseCountRef.current = 0
      setStep('workspaceInit')
      onDoorsClosed()
    }
  }, [onDoorsClosed])

  const onDoorOpenComplete = useCallback(() => {
    doorOpenCountRef.current += 1
    if (doorOpenCountRef.current >= 2) {
      doorOpenCountRef.current = 0
      setStep('dashboardReveal')
    }
  }, [])

  // Advance to doorOpen when the parent signals (navigation done).
  useEffect(() => {
    if (shouldProceed && step === 'workspaceInit' && workspaceReady) {
      setStep('doorOpen')
    }
  }, [shouldProceed, step, workspaceReady])

  const doorsOpen = step === 'doorOpen' || step === 'dashboardReveal'
  const showLogo = step === 'doorClose'

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

      {/* ── Desktop Cinematic Initialization Sequence ── */}
      {step === 'workspaceInit' && (
        <>
          {/* Minimal particle overlay */}
          <div className="absolute inset-0 z-[11] pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-px bg-white/20 rounded-full"
                style={{ left: `${12 + i * 19}%`, top: `${55 + (i % 3) * 10}%` }}
                animate={{ y: [0, -100], opacity: [0, 0.3, 0] }}
                transition={{ duration: 3.5 + i * 0.5, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Logo ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center z-[15] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute -inset-16 bg-brand-primary/[0.06] blur-3xl rounded-full"
            />
          </div>

          {/* Header subtitle + steps + progress bar */}
          <div className="absolute inset-0 flex flex-col items-center pt-[15%] z-20 pointer-events-none">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-8"
            >
              <Logo size="lg" />
            </motion.div>

            {/* "Secure Workspace" → crossfades to "Workspace Ready" */}
            <div className="relative h-5 mb-8 overflow-hidden">
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }}
                transition={{ duration: 2.4, times: [0, 0.17, 0.5, 0.67], ease: 'easeInOut' }}
                className="absolute inset-0 text-xs text-text-muted tracking-[0.2em] uppercase"
              >
                Secure Workspace
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.3, ease: 'easeOut' }}
                className="absolute inset-0 text-xs text-text-muted tracking-[0.2em] uppercase"
              >
                Workspace Ready
              </motion.span>
            </div>

            {/* "Initializing..." */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.0, times: [0, 0.1, 0.55], delay: 0.5, ease: 'easeInOut' }}
              className="text-xs text-text-muted mb-5"
            >
              Initializing...
            </motion.span>

            {/* Loading steps */}
            <div className="flex flex-col items-start gap-2.5 mb-6">
              {initSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.35, ease: 'easeOut' }}
                  className="flex items-center gap-2.5"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 300, damping: 15 }}
                    className="text-green-400 text-xs leading-none"
                  >
                    ✓
                  </motion.span>
                  <span className="text-sm text-text-primary">{step.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-48 h-px bg-white/10 rounded-full overflow-hidden shadow-lg shadow-brand-primary/[0.08]">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary/80 to-brand-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                onAnimationComplete={() => setWorkspaceReady(true)}
              />
            </div>
          </div>
        </>
      )}

      {step === 'doorOpen' && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[5] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.12, 0.15, 0.06, 0], scale: [0.9, 1, 1.04, 1.06, 1.08] }}
          transition={{ duration: 0.8, ease: 'easeInOut', times: [0, 0.15, 0.3, 0.55, 1] }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-[80%] h-[80%] rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 30%, transparent 60%)',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Blur overlay — fades out during dashboardReveal for smooth un-blur */}
      {step === 'dashboardReveal' && (
        <motion.div
          className="absolute inset-0 z-[2] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        />
      )}

      {/* Dashboard reveal overlay — covers dashboard while doors open, then fades out with scale */}
      {(step === 'doorOpen' || step === 'dashboardReveal') && (
        <motion.div
          key={step === 'dashboardReveal' ? 'reveal' : 'cover'}
          className="absolute inset-0 bg-bg-primary z-[3] pointer-events-none"
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: step === 'dashboardReveal' ? 0 : 1,
            scale: step === 'dashboardReveal' ? 1.04 : 1,
          }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (step === 'dashboardReveal') onFinish()
          }}
        />
      )}

      <motion.div
        variants={doorLeft}
        initial="open"
        animate={doorsOpen ? 'open' : 'closed'}
        transition={doorTransition}
        onAnimationComplete={doorsOpen ? onDoorOpenComplete : onDoorCloseComplete}
        className="absolute top-0 left-0 w-1/2 h-full z-10 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(16,16,28,0.98) 50%, rgba(10,10,20,0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '4px 0 30px -8px rgba(0,0,0,0.5)',
        }}
      >
        {/* Gloss reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent pointer-events-none" />
        {/* Inner edge glow */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/[0.06] via-white/[0.02] to-transparent pointer-events-none" />
        {/* Glow line */}
        <div className="absolute inset-y-0 right-0 w-px bg-white/[0.06] pointer-events-none" />
      </motion.div>
      <motion.div
        variants={doorRight}
        initial="open"
        animate={doorsOpen ? 'open' : 'closed'}
        transition={doorTransition}
        onAnimationComplete={doorsOpen ? onDoorOpenComplete : onDoorCloseComplete}
        className="absolute top-0 right-0 w-1/2 h-full z-10 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(16,16,28,0.98) 50%, rgba(10,10,20,0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '-4px 0 30px -8px rgba(0,0,0,0.5)',
        }}
      >
        {/* Gloss reflection */}
        <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.03] via-white/[0.01] to-transparent pointer-events-none" />
        {/* Inner edge glow */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-transparent pointer-events-none" />
        {/* Glow line */}
        <div className="absolute inset-y-0 left-0 w-px bg-white/[0.06] pointer-events-none" />
      </motion.div>
    </div>
  )
}
