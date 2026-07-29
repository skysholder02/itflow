import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui'

type Step = 'fadeIn' | 'workspaceInit' | 'softBlur' | 'fadeOut'

const checklistItems = [
  'Authenticating User',
  'Loading Profile',
  'Loading Permissions',
  'Loading Notifications',
  'Preparing Dashboard',
]

interface MobileTransitionProps {
  onFinish: () => void
  onWorkspaceReady: () => void
  shouldProceed: boolean
}

export function MobileTransition({ onFinish, onWorkspaceReady, shouldProceed }: MobileTransitionProps) {
  const [step, setStep] = useState<Step>('fadeIn')
  const [checkedCount, setCheckedCount] = useState(0)
  const [workspaceReady, setWorkspaceReady] = useState(false)

  // Timer-driven step progression.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    if (step === 'fadeIn') {
      timers.push(setTimeout(() => setStep('workspaceInit'), 600))
    } else if (step === 'workspaceInit') {
      timers.push(setTimeout(() => setCheckedCount(1), 200))
      timers.push(setTimeout(() => setCheckedCount(2), 400))
      timers.push(setTimeout(() => setCheckedCount(3), 600))
      timers.push(setTimeout(() => setCheckedCount(4), 800))
      timers.push(setTimeout(() => setCheckedCount(5), 1000))
      timers.push(setTimeout(() => setWorkspaceReady(true), 1200))
    } else if (step === 'softBlur') {
      timers.push(setTimeout(() => setStep('fadeOut'), 500))
    } else if (step === 'fadeOut') {
      timers.push(setTimeout(() => onFinish(), 600))
    }

    return () => timers.forEach(clearTimeout)
  }, [step, onFinish])

  // Notify parent when workspace preparation finishes.
  useEffect(() => {
    if (workspaceReady && step === 'workspaceInit') {
      onWorkspaceReady()
    }
  }, [workspaceReady, step, onWorkspaceReady])

  // Advance to softBlur when the parent signals (navigation done).
  useEffect(() => {
    if (shouldProceed && step === 'workspaceInit' && workspaceReady) {
      setStep('softBlur')
    }
  }, [shouldProceed, step, workspaceReady])

  const isExitingContent = step === 'softBlur' || step === 'fadeOut'

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center px-5"
      style={{ height: '100dvh' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: step === 'fadeOut' ? 0 : 1,
          scale: isExitingContent ? 1.05 : 1,
          filter: isExitingContent ? 'blur(6px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center w-full gap-6"
      >
        <Logo size="lg" />

        {step === 'workspaceInit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-start gap-3 w-full max-w-[200px]"
          >
            {checklistItems.map((label, index) => {
              const isChecked = checkedCount > index
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isChecked ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="text-green-400 text-sm leading-none"
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      isChecked ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {step === 'workspaceInit' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-2 w-full"
          >
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.0, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-xs text-text-muted">Preparing Workspace</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}