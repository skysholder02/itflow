import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { BusinessContactModal } from './BusinessContactModal'
import { useCtaSequence } from '@/hooks/useCtaSequence'

export function Contact() {
  const {
    sectionRef,
    isActive,
    isInView,
    highlightActive,
    showModal,
    onModalClose,
    openModal,
    trigger,
  } = useCtaSequence('scroll-to-contact')

  return (
    <section ref={sectionRef} id="contact" className="relative py-32">
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 flex items-start justify-center pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          <div
            className="w-[1400px] h-[1000px] -mt-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, rgba(96,165,250,0.04) 35%, transparent 65%)',
              filter: 'blur(120px)',
            }}
          />
        </motion.div>
      )}

      <div className="absolute inset-0 flex items-start justify-center pointer-events-none overflow-visible" aria-hidden="true">
        <div
          className="w-[1400px] h-[1000px] -mt-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, rgba(168,85,247,0.03) 35%, transparent 65%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          key={isActive ? trigger : undefined}
          initial={
            isActive
              ? { opacity: 0, y: 20, scale: 0.98 }
              : { opacity: 0, y: 24 }
          }
          animate={
            isInView
              ? { opacity: 1, y: 0, scale: isActive ? 1 : undefined }
              : {}
          }
          transition={
            isActive
              ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
          }
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
            Ready to Transform
            <br />
            Your IT Operations?
          </h2>
          <p className="mt-6 text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Join forward-thinking teams streamlining their IT management with ITFlow.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="relative inline-flex">
              <motion.div
                animate={highlightActive ? {
                  opacity: [0, 0.25, 0.2, 0],
                  scale: [1, 1.08, 1.15, 1.22],
                } : {}}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-6 rounded-[32px] pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.30) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
              <Button size="lg" onClick={openModal}>
                Contact Sales
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <BusinessContactModal isOpen={showModal} onClose={onModalClose} />
    </section>
  )
}
