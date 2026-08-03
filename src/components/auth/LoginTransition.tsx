import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTransition } from '@/contexts/TransitionContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { DesktopTransition } from './DesktopTransition'
import { MobileTransition } from './MobileTransition'

export function LoginTransition() {
  // ✅ Tambahin finishManualLogin di sini
  const {
    isActive,
    endTransition,
    transitionId,
    dashboardReady,
    finishManualLogin,
  } = useTransition()
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
  useEffect(() => {
    finishGuardRef.current = false
    setShouldProceed(false)
  }, [transitionId])

  // Wait for dashboard to mount and entrance animation to finish before proceeding.
  useEffect(() => {
    if (dashboardReady && isActive && !shouldProceed) {
      setShouldProceed(true)
    }
  }, [dashboardReady, isActive, shouldProceed])

  // ✅ Tambahin finishManualLogin() di awal
  const onFinish = useCallback(() => {
    if (finishGuardRef.current) return
    finishGuardRef.current = true

    // selesai login manual
    finishManualLogin()

    if (capturedIsMobile) {
      setIsFadingOut(true)
    } else {
      endTransition()
    }
  }, [capturedIsMobile, endTransition, finishManualLogin]) // ✅ tambahin finishManualLogin ke deps

  // ✅ Tambahin finishManualLogin() sebelum endTransition()
  const onOverlayAnimationComplete = useCallback(() => {
    if (!isFadingOut) return

    finishManualLogin()
    endTransition()
    setIsFadingOut(false)
  }, [isFadingOut, endTransition, finishManualLogin]) // ✅ tambahin finishManualLogin ke deps

  const handleWorkspaceReady = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="login-transition-overlay"
          className={`fixed inset-0 z-[100] ${capturedIsMobile ? 'bg-bg-primary' : ''} ${isFadingOut ? 'pointer-events-none' : ''}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: capturedIsMobile && isFadingOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={capturedIsMobile ? { duration: 0.5 } : { duration: 0 }}
          onAnimationComplete={onOverlayAnimationComplete}
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
              onDoorsClosed={handleWorkspaceReady}
              shouldProceed={shouldProceed}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}