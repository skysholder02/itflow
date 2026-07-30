import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface UseCtaSequenceOptions {
  highlightDelay?: number
  modalDelay?: number
}

export function useCtaSequence(eventName: string, options?: UseCtaSequenceOptions) {
  const { highlightDelay = 600, modalDelay = 900 } = options || {}
  const [trigger, setTrigger] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [highlightTick, setHighlightTick] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef)
  const lockedRef = useRef(false)

  useEffect(() => {
    const handler = () => {
      if (!lockedRef.current) setTrigger(t => t + 1)
    }
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [eventName])

  useEffect(() => {
    if (isInView && trigger > 0) {
      lockedRef.current = true
      setHighlightTick(0)
      const hTimer = setTimeout(() => setHighlightTick(t => t + 1), highlightDelay)
      const mTimer = setTimeout(() => setShowModal(true), modalDelay)
      return () => { clearTimeout(hTimer); clearTimeout(mTimer) }
    }
  }, [isInView, trigger, highlightDelay, modalDelay])

  const handleModalClose = () => {
    setShowModal(false)
    setHighlightTick(0)
    lockedRef.current = false
  }

  return {
    sectionRef,
    isActive: isInView && trigger > 0,
    isInView,
    highlightActive: highlightTick > 0,
    showModal,
    onModalClose: handleModalClose,
    openModal: () => setShowModal(true),
    trigger,
  }
}
