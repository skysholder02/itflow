import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Logo, GlowBackground, Button } from '@/components/ui'
import { fadeUp, fadeUpTransition } from '@/animations/variants'
import { userRepo } from '@/services/repositories'
import { useEffect, useState } from 'react'
import type { User } from '@/types'

const roleLabels: Record<string, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  vendor: 'Vendor',
  leaderit: 'Leader IT',
}

export function WaitingApprovalPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (!email) {
        setLoading(false)
        return
      }
      try {
        const foundUser = await userRepo.getByEmail(email)
        if (foundUser) {
          setUser(foundUser)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [email])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  // If we have user data and they were rejected
  const isRejected = user?.status === 'Archived' || user?.vendorStatus === 'Archived'
  const rejectReason = user?.rejectReason || user?.vendorRejectReason
  const rejectWhatsApp = user?.rejectWhatsApp || user?.vendorRejectWhatsApp

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <GlowBackground />

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={fadeUpTransition}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <Logo variant="vertical" size="lg" width={120} className="justify-center" forceDark />
        </div>

        <Card className="border border-white/10 text-center space-y-5 py-8 px-6">
          {isRejected ? (
            <>
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✗
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-text-primary">Registration Rejected</h1>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Your {user?.role ? roleLabels[user.role] : ''} account registration was not approved.
                </p>
              </div>

              {rejectReason && (
                <div className="bg-red-500/10 border border-red-500/20 text-left p-4 rounded-2xl space-y-2">
                  <p className="text-red-400 text-sm font-medium">Reason:</p>
                  <p className="text-text-secondary text-sm">{rejectReason}</p>
                  {rejectWhatsApp && (
                    <>
                      <p className="text-red-400 text-sm font-medium mt-3">Contact for more info:</p>
                      <p className="text-text-secondary text-sm">WhatsApp: {rejectWhatsApp}</p>
                    </>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Link to="/login" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full">
                    Register Again
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                ⏳
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-text-primary">Registration Submitted</h1>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Your account has been created and is currently waiting for Leader IT approval.
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                  You will be able to login after your account is approved.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="secondary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
