import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTransition } from '@/contexts/TransitionContext'
import { Logo } from '@/components/ui'
import { springConfig } from '@/animations/variants'

export function LoginTransition() {
  const { phase, setPhase, completeTransition } = useTransition()

  useEffect(() => {
    if (phase === 'idle') return

    const timers: ReturnType<typeof setTimeout>[] = []

    if (phase === 'zoomBlur') {
      timers.push(setTimeout(() => setPhase('doorsClose'), 600))
    } else if (phase === 'doorsClose') {
      timers.push(setTimeout(() => setPhase('doorsOpen'), 400))
    } else if (phase === 'doorsOpen') {
      timers.push(setTimeout(() => setPhase('reveal'), 800))
    } else if (phase === 'reveal') {
      timers.push(setTimeout(() => setPhase('complete'), 1000))
    } else if (phase === 'complete') {
      completeTransition()
    }

    return () => timers.forEach(clearTimeout)
  }, [phase, setPhase, completeTransition])

  if (phase === 'idle') return null

  const showDoors = ['doorsClose', 'doorsOpen', 'reveal', 'complete'].includes(phase)
  const doorsOpen = ['doorsOpen', 'reveal', 'complete'].includes(phase)
  const showDashboard = ['reveal', 'complete'].includes(phase)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Zoom blur overlay on landing */}
        {phase === 'zoomBlur' && (
          <motion.div
            className="absolute inset-0 bg-bg-primary"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 backdrop-blur-md bg-bg-primary/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}

        {/* Dashboard preview behind doors */}
        {showDashboard && (
          <motion.div
            className="absolute inset-0 bg-bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-full">
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-64 bg-bg-secondary/80 border-r border-white/6 p-6 flex flex-col"
              >
                <Logo size="sm" layoutId="itflow-logo" />
                <div className="mt-8 space-y-2">
                  {['Dashboard', 'Tickets', 'Assets', 'QR Assets', 'Profile'].map(
                    (item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="px-3 py-2 rounded-xl text-sm text-text-muted"
                      >
                        {item}
                      </motion.div>
                    ),
                  )}
                </div>
              </motion.aside>
              <div className="flex-1 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                  {['Total Tickets', 'Open Tickets', 'Completed', 'Total Assets'].map(
                    (label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.08, ...springConfig }}
                        className="glass-card p-4"
                      >
                        <p className="text-xs text-text-muted">{label}</p>
                        <p className="text-2xl font-bold text-text-primary mt-1">—</p>
                      </motion.div>
                    ),
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sliding doors */}
        {showDoors && (
          <>
            <motion.div
              className="absolute top-0 left-0 w-1/2 h-full bg-bg-primary border-r border-white/6 z-10 flex items-center justify-end pr-8"
              initial={{ x: '0%' }}
              animate={{ x: doorsOpen ? '-100%' : '0%' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {!doorsOpen && (
                <motion.div layoutId="itflow-logo">
                  <Logo size="lg" />
                </motion.div>
              )}
            </motion.div>
            <motion.div
              className="absolute top-0 right-0 w-1/2 h-full bg-bg-primary border-l border-white/6 z-10"
              initial={{ x: '0%' }}
              animate={{ x: doorsOpen ? '100%' : '0%' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
