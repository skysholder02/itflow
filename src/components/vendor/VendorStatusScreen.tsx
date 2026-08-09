import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Textarea, Card, GlowBackground, Logo } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import { useNavigate } from 'react-router-dom'
import { resolveVendorStatus } from '@/utils/vendorStatus'

export function VendorStatusScreen() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [reason, setReason] = useState('')
  const [days, setDays] = useState('30')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  if (!user) return null

  const vendorStatus = resolveVendorStatus(user)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleRequestExtension = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    setSubmitting(true)
    try {
      const newRequest = {
        id: `ext-${Date.now()}`,
        reason,
        requestedDays: parseInt(days, 10),
        status: 'Pending' as const,
        requestedAt: new Date().toISOString(),
      }

      const timelineItem = {
        id: `vtl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        activity: `Account extension request: +${days} days. Reason: ${reason}`,
      }

      const updatedRequests = [...(user.vendorExtensionRequests || []), newRequest]
      const updatedTimeline = [...(user.vendorTimeline || []), timelineItem]

      await userRepo.update(user.id, {
        vendorExtensionRequests: updatedRequests,
        vendorTimeline: updatedTimeline,
      })

      await refreshUser()
      setSuccess('Extension request submitted successfully!')
      setReason('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const isPendingExtension = user.vendorExtensionRequests?.some((r) => r.status === 'Pending')

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowBackground />
      <div className="w-full max-w-xl relative z-10 space-y-6">
        <div className="text-center">
          <Logo variant="vertical" size="lg" width={120} className="justify-center" forceDark />
          <h2 className="text-2xl font-bold text-text-primary mt-6">Vendor Account Status</h2>
          <p className="text-text-muted mt-2">{user.vendorCompany}</p>
        </div>

        <Card className="border border-white/10">
          {vendorStatus === 'PendingApproval' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                !
              </div>
              <h3 className="text-xl font-semibold text-text-primary">Waiting for Approval</h3>
              <p className="text-text-secondary text-sm">
                Your account is waiting for Leader IT approval.
              </p>
            </div>
          )}

          {vendorStatus === 'Archived' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✕
                </div>
                <h3 className="text-xl font-semibold text-red-400 mt-4">Registration Rejected</h3>
                <p className="text-text-muted text-sm mt-1">
                  Your vendor registration was not approved.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <p className="text-xs text-text-muted">Rejection Reason:</p>
                <p className="text-text-primary text-sm font-medium">
                  {user.vendorRejectReason || 'No reason provided.'}
                </p>
              </div>

              {user.vendorRejectWhatsApp && (
                <div className="text-center pt-2">
                  <a
                    href={`https://wa.me/${user.vendorRejectWhatsApp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline"
                  >
                    Contact Leader IT via WhatsApp ({user.vendorRejectWhatsApp})
                  </a>
                </div>
              )}
            </div>
          )}

          {vendorStatus === 'Expired' && (
            <div className="space-y-6">
              <div className="text-center py-4 border-b border-white/5">
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ⌛
                </div>
                <h3 className="text-xl font-semibold text-orange-400 mt-4">Your account has expired.</h3>
                <p className="text-text-muted text-sm mt-1">
                  Expired on{' '}
                  <span className="text-text-primary font-medium">
                    {user.vendorExpiryDate ? new Date(user.vendorExpiryDate).toLocaleDateString() : '-'}
                  </span>.
                </p>
              </div>

              {isPendingExtension ? (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-2xl text-center text-sm">
                  Your extension request has been submitted and is waiting for Leader IT approval.
                </div>
              ) : (
                <form onSubmit={handleRequestExtension} className="space-y-4">
                  <h4 className="font-semibold text-text-primary text-sm">Request Extension</h4>
                  {success && <p className="text-sm text-green-400">{success}</p>}
                  <Input
                    label="Requested Days"
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Reason"
                    placeholder="Explain why you need an account extension..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={submitting} className="w-full">
                    Submit Extension Request
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
            <Button variant="secondary" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
