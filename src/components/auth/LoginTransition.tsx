import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTransition } from '@/contexts/TransitionContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { DesktopTransition } from './DesktopTransition'
import { MobileTransition } from './MobileTransition'

export function LoginTransition() {
  const { isActive, endTransition, transitionId } = useTransition()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [isFadingOut, setIsFadingOut] = useState(false)
  const [shouldProceed, setShouldProceed] = useState(false)

  // Capture isMobile once at transition start so mid-transition
  // resizes don't swap DesktopTransition ↔ MobileTransition.
  const [capturedIsMobile, setCapturedIsMobile] = useState(isMobile)
  const prevActiveRef = useRef(isActive)
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      setCapturedIsMobile(isMobile)
    }
    prevActiveRef.current = isActive
  }, [isActive, isMobile])

  // Guard: onFinish must only fire once per transition.
  // Reset guard when a new transition starts (transitionId changes).
  const finishGuardRef = useRef(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    finishGuardRef.current = false
    setShouldProceed(false)
  }, [transitionId])

  // Cleanup fade timer on unmount.
  useEffect(() => {
    return () => clearTimeout(fadeTimerRef.current)
  }, [])

  const onFinish = useCallback(() => {
    if (finishGuardRef.current) return
    finishGuardRef.current = true
    setIsFadingOut(true)
    fadeTimerRef.current = setTimeout(() => {
      endTransition()
      setIsFadingOut(false)
    }, 550)
  }, [endTransition])

  const handleWorkspaceReady = useCallback(() => {
    navigate('/dashboard')
    setShouldProceed(true)
  }, [navigate])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="login-transition-overlay"
          className={`fixed inset-0 z-[100] bg-bg-primary ${isFadingOut ? 'pointer-events-none' : ''}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: isFadingOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {capturedIsMobile ? (
            <MobileTransition
              key={`mobile-${transitionId}`}
              onFinish={onFinish}
              onWorkspaceReady={handleWorkspaceReady}
              shouldProceed={shouldProceed}
            />
          ) : (
            <DesktopTransition
              key={`desktop-${transitionId}`}
              onFinish={onFinish}
              onWorkspaceReady={handleWorkspaceReady}
              shouldProceed={shouldProceed}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}