import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set())
  const [workspaceReady, setWorkspaceReady] = useState(false)

  const stepRef = useRef(step)
  stepRef.current = step

  // Advance step when content animation finishes.
  const onContentAnimationComplete = useCallback(() => {
    const s = stepRef.current
    if (s === 'fadeIn') {
      setStep('workspaceInit')
    } else if (s === 'softBlur') {
      setStep('fadeOut')
    } else if (s === 'fadeOut') {
      onFinish()
    }
  }, [onFinish])

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
        onAnimationComplete={onContentAnimationComplete}
        className="flex flex-col items-center w-full gap-6"
      >
        <Logo variant="vertical" size="lg" width={120} forceDark />

        {step === 'workspaceInit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-start gap-3 w-full max-w-[200px]"
          >
            {checklistItems.map((label, index) => {
              const isChecked = checkedIndices.has(index)
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onAnimationComplete={() => setCheckedIndices(prev => new Set(prev).add(index))}
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
                onAnimationComplete={() => setWorkspaceReady(true)}
              />
            </div>
            <span className="text-xs text-text-muted">Preparing Workspace</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}