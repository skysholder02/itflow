import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Input, Card, Logo, GlowBackground, Textarea } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import { fadeUp, fadeUpTransition } from '@/animations/variants'
import type { User } from '@/types'

export function ExtensionRequestPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [vendor, setVendor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const [requestedDays, setRequestedDays] = useState('30')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadVendor = async () => {
      if (!email) {
        setLoading(false)
        return
      }
      try {
        const user = await userRepo.getByEmail(email)
        if (user && user.role === 'vendor') {
          setVendor(user)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadVendor()
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendor) return
    
    setError('')
    setSubmitting(true)

    try {
      if (!reason.trim()) {
        setError('Reason is required')
        setSubmitting(false)
        return
      }

      const days = parseInt(requestedDays, 10)
      if (!days || days < 1) {
        setError('Requested days must be at least 1')
        setSubmitting(false)
        return
      }

      const extensionRequest = {
        id: `ext-${Date.now()}`,
        reason: reason.trim(),
        requestedDays: days,
        status: 'Pending' as const,
        requestedAt: new Date().toISOString(),
      }

      const updatedRequests = [...(vendor.vendorExtensionRequests || []), extensionRequest]

      const updatedTimeline = [
        ...(vendor.vendorTimeline || []),
        {
          id: `vtl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          activity: `Account extension request: +${days} days. Reason: ${reason.trim()}`,
        },
      ]

      await userRepo.update(vendor.id, {
        vendorExtensionRequests: updatedRequests,
        vendorTimeline: updatedTimeline,
      })

      setSuccess(true)
    } catch (err) {
      setError('Failed to submit request. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-6">
        <GlowBackground />
        <Card className="text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-text-primary">Invalid Request</h1>
          <p className="text-text-muted text-sm">
            No vendor account found. Please contact your administrator.
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Back to Login
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (success) {
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
            <Logo size="lg" className="justify-center" />
          </div>

          <Card className="border border-white/10 text-center space-y-5 py-8 px-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-text-primary">Extension Request Submitted</h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Your extension request for <strong>{requestedDays} days</strong> has been submitted successfully.
              </p>
              <p className="text-text-muted text-sm leading-relaxed">
                Leader IT will review your request. You will be notified once approved.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

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
          <Logo size="lg" className="justify-center" />
          <p className="text-text-muted mt-4">Request Account Extension</p>
        </div>

        <Card className="border border-white/10 space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-2xl text-sm">
            <p className="font-semibold mb-1">⚠️ Your account has expired</p>
            <p className="text-yellow-300/80">
              Submit a request to extend your account access.
            </p>
          </div>

          <div className="space-y-2 text-sm border-t border-white/5 pt-4">
            <div className="flex justify-between">
              <span className="text-text-muted">Company:</span>
              <span className="text-text-primary font-medium">{vendor.vendorCompany}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Email:</span>
              <span className="text-text-primary font-medium">{vendor.email}</span>
            </div>
            {vendor.vendorExpiryDate && (
              <div className="flex justify-between">
                <span className="text-text-muted">Expired on:</span>
                <span className="text-red-400 font-medium">{new Date(vendor.vendorExpiryDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/5 pt-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-2xl text-center">
                {error}
              </div>
            )}

            <Textarea
              label="Reason for Extension"
              placeholder="Explain why you need to extend your account access..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            <Input
              label="Requested Days"
              type="number"
              min="1"
              max="365"
              placeholder="Number of days"
              value={requestedDays}
              onChange={(e) => setRequestedDays(e.target.value)}
              required
            />

            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={submitting} className="flex-1">
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}