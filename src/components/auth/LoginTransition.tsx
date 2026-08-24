import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTransition } from '@/contexts/TransitionContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { DesktopTransition } from './DesktopTransition'
import { MobileTransition } from './MobileTransition'

// TEMPORARY DIAGNOSTICS: per-module-evaluation and per-instance generation
// identifiers. A mismatch between consumer.gen.provider and the value logged
// by [FIYRO-TRANSITION] proves dual provider generations (HMR hypothesis H1).
const CONSUMER_MODULE_GEN = Math.random().toString(36).slice(2, 8)
let consumerInstanceCounter = 0

const WATCHDOG_DEADLINE_MS = 15000

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.info('[FIYRO-LOGIN]', ...args)
}

export function LoginTransition() {
  const {
    isActive,
    endTransition,
    transitionId,
    dashboardReady,
    finishManualLogin,
    providerId,
  } = useTransition()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  const [isFadingOut, setIsFadingOut] = useState(false)
  const [shouldProceed, setShouldProceed] = useState(false)

  const consumerIdRef = useRef<string | null>(null)
  if (consumerIdRef.current === null) {
    consumerInstanceCounter += 1
    consumerIdRef.current = `${CONSUMER_MODULE_GEN}#${consumerInstanceCounter}`
  }

  // Diagnostic snapshot mirrored every render so interval callbacks read
  // fresh values instead of stale closure state.
  const activatedAtRef = useRef<number | null>(null)
  const watchdogDeadlineRef = useRef<number | null>(null)
  const diagRef = useRef<Record<string, unknown>>({})
  diagRef.current = {
    isActive,
    dashboardReady,
    shouldProceed,
    isFadingOut,
    pathname: location.pathname,
    elapsedMs:
      activatedAtRef.current !== null ? Date.now() - activatedAtRef.current : null,
    watchdogRemainingMs:
      watchdogDeadlineRef.current !== null
        ? Math.max(0, watchdogDeadlineRef.current - Date.now())
        : null,
    gen: { consumer: consumerIdRef.current, provider: providerId },
  }

  // Capture isMobile once at transition start so mid-transition
  // resizes don't swap DesktopTransition ↔ MobileTransition.
  const [capturedIsMobile, setCapturedIsMobile] = useState(isMobile)
  const prevActiveRef = useRef(isActive)
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      setCapturedIsMobile(isMobile)
      activatedAtRef.current = Date.now()
    }
    if (!isActive) {
      activatedAtRef.current = null
    }
    prevActiveRef.current = isActive
  }, [isActive, isMobile])

  // Guard: onFinish must only fire once per transition.
  // Reset guard when a new transition starts (transitionId changes).
  // The watchdog deadline is wall-clock based on the logical transition start:
  // it is deliberately NOT reset by isActive flicker, so repeated start/end
  // cycling can never starve the safety net of its deadline.
  const finishGuardRef = useRef(false)
  const didNavigateRef = useRef(false)
  useEffect(() => {
    finishGuardRef.current = false
    didNavigateRef.current = false
    setShouldProceed(false)
    watchdogDeadlineRef.current = Date.now() + WATCHDOG_DEADLINE_MS
    devLog('watchdog ARMED', {
      transitionId,
      deadlineMs: WATCHDOG_DEADLINE_MS,
      snapshot: diagRef.current,
    })
  }, [transitionId])

  // Wait for dashboard to mount and entrance animation to finish before proceeding.
  useEffect(() => {
    if (dashboardReady && isActive && !shouldProceed) {
      setShouldProceed(true)
    }
  }, [dashboardReady, isActive, shouldProceed])

  // Last-resort safety net (temporary hardened form): a wall-clock deadline
  // polled by an interval instead of a single cancellable timeout. The overlay
  // is force-released no later than WATCHDOG_DEADLINE_MS after the transition
  // started, no matter what stalled upstream. This only removes the overlay;
  // it never grants access. Heartbeats (dev-only) prove the interval kept
  // running and dump the exact stalled state.
  useEffect(() => {
    if (!isActive) return
    const interval = window.setInterval(() => {
      const deadline = watchdogDeadlineRef.current
      if (deadline === null) return
      if (Date.now() < deadline) {
        devLog('watchdog heartbeat', { snapshot: diagRef.current })
        return
      }
      if (finishGuardRef.current) return
      finishGuardRef.current = true
      watchdogDeadlineRef.current = null
      devLog('release path INVOKED reason="watchdog"', { snapshot: diagRef.current })
      finishManualLogin()
      endTransition()
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isActive, finishManualLogin, endTransition])

  const onFinish = useCallback(() => {
    if (finishGuardRef.current) return
    finishGuardRef.current = true

    devLog(
      'release path INVOKED reason="onFinish"',
      { mobile: capturedIsMobile, snapshot: diagRef.current },
    )
    finishManualLogin()

    if (capturedIsMobile) {
      setIsFadingOut(true)
    } else {
      endTransition()
    }
  }, [capturedIsMobile, endTransition, finishManualLogin])

  const onOverlayAnimationComplete = useCallback(() => {
    if (!isFadingOut) return

    devLog('release path INVOKED reason="overlay-fade-complete"', {
      snapshot: diagRef.current,
    })
    finishManualLogin()
    endTransition()
    setIsFadingOut(false)
  }, [isFadingOut, endTransition, finishManualLogin])

  // Mobile path relies on the overlay fade callback above; guarantee it.
  useEffect(() => {
    if (!isFadingOut) return
    const timer = window.setTimeout(() => {
      devLog('release path INVOKED reason="fadeout-backup-timer"', {
        snapshot: diagRef.current,
      })
      finishManualLogin()
      endTransition()
      setIsFadingOut(false)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [isFadingOut, finishManualLogin, endTransition])

  const handleWorkspaceReady = useCallback(() => {
    if (didNavigateRef.current) return
    didNavigateRef.current = true
    devLog('navigate("/dashboard") requested', { snapshot: diagRef.current })
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
