import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, Input, Textarea, Skeleton } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import type { User } from '@/types'
import { formatDate } from '@/utils/formatters'

export function VendorManagementPage() {
  const [vendors, setVendors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'active' | 'expired' | 'archived'>('pending')
  
  // Modal states
  const [approveModal, setApproveModal] = useState<User | null>(null)
  const [rejectModal, setRejectModal] = useState<User | null>(null)
  
  // Extension action states
  const [approveExtModal, setApproveExtModal] = useState<{ vendor: User; reqId: string; requestedDays: number } | null>(null)
  const [rejectExtModal, setRejectExtModal] = useState<{ vendor: User; reqId: string } | null>(null)

  // Forms state
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 6) // Default 6 months
    return d.toISOString().split('T')[0]
  })
  const [reason, setReason] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    setLoading(true)
    try {
      const all = await userRepo.getAll()
      setVendors(all.filter((u) => u.role === 'vendor'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRegister = async () => {
    if (!approveModal) return
    try {
      const vendorTimeline = [
        ...(approveModal.vendorTimeline || []),
        {
          id: `vtl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          activity: `Registration approved. Account active until ${formatDate(expiryDate)}.`,
        },
      ]
      
      await userRepo.update(approveModal.id, {
        vendorStatus: 'Active',
        vendorExpiryDate: expiryDate,
        vendorTimeline,
      })
      
      setApproveModal(null)
      loadVendors()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModal || !reason.trim() || !whatsapp.trim()) return
    try {
      const vendorTimeline = [
        ...(rejectModal.vendorTimeline || []),
        {
          id: `vtl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          activity: `Registration rejected. Reason: ${reason}`,
        },
      ]
      
      await userRepo.update(rejectModal.id, {
        vendorStatus: 'Archived',
        vendorRejectReason: reason,
        vendorRejectWhatsApp: whatsapp,
        vendorTimeline,
      })
      
      setRejectModal(null)
      setReason('')
      setWhatsapp('')
      loadVendors()
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveExtension = async () => {
    if (!approveExtModal) return
    const { vendor, reqId, requestedDays } = approveExtModal
    try {
      // Update extension request status
      const requests = (vendor.vendorExtensionRequests || []).map((r) => {
        if (r.id === reqId) return { ...r, status: 'Approved' as const }
        return r
      })

      // If expired, extend from today. If not, extend from current expiry.
      const baseDate = new Date(vendor.vendorExpiryDate && new Date(vendor.vendorExpiryDate) > new Date() ? vendor.vendorExpiryDate : new Date())
      baseDate.setDate(baseDate.getDate() + requestedDays)
      const newExpiry = baseDate.toISOString().split('T')[0]

      const vendorTimeline = [
        ...(vendor.vendorTimeline || []),
        {
          id: `vtl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          activity: `Account extension approved for +${requestedDays} days. New expiry: ${formatDate(newExpiry)}.`,
        },
      ]

      await userRepo.update(vendor.id, {
        vendorStatus: 'Active',
        vendorExpiryDate: newExpiry,
        vendorExtensionRequests: requests,
        vendorTimeline,
      })

      setApproveExtModal(null)
      loadVendors()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectExtension = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectExtModal || !reason.trim() || !whatsapp.trim()) return
    const { vendor, reqId } = rejectExtModal
    try {
      // Update extension request status
      const requests = (vendor.vendorExtensionRequests || []).map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'Rejected' as const,
            rejectReason: reason,
            rejectWhatsApp: whatsapp,
          }
        }
        return r
      })

      const vendorTimeline = [
        ...(vendor.vendorTimeline || []),
        {
          id: `vtl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          activity: `Account extension rejected. Reason: ${reason}`,
        },
      ]

      await userRepo.update(vendor.id, {
        vendorExtensionRequests: requests,
        vendorTimeline,
      })

      setRejectExtModal(null)
      setReason('')
      setWhatsapp('')
      loadVendors()
    } catch (err) {
      console.error(err)
    }
  }

  // Filter vendors based on active tab
  const filtered = vendors.filter((v) => {
    if (tab === 'pending') return v.vendorStatus === 'PendingApproval' || !v.vendorStatus
    if (tab === 'active') return v.vendorStatus === 'Active'
    if (tab === 'expired') return v.vendorStatus === 'Expired'
    if (tab === 'archived') return v.vendorStatus === 'Archived'
    return false
  })

  const tabLabels: Record<typeof tab, string> = {
    pending: 'Pending Accounts',
    active: 'Active',
    expired: 'Expired',
    archived: 'Archived',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
        <p className="text-text-muted text-sm mt-1">
          Review vendor registration requests, manage active accounts, and handle extension approvals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
        {(['pending', 'active', 'expired', 'archived'] as const).map((t) => {
          const count = vendors.filter((v) => {
            if (t === 'pending') return v.vendorStatus === 'PendingApproval' || !v.vendorStatus
            if (t === 'active') return v.vendorStatus === 'Active'
            if (t === 'expired') return v.vendorStatus === 'Expired'
            if (t === 'archived') return v.vendorStatus === 'Archived'
            return false
          }).length

          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                tab === t
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tabLabels[t]} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-24px" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 text-text-muted">
          No vendors in this category.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((vendor) => {
            const pendingExtReq = vendor.vendorExtensionRequests?.find((r) => r.status === 'Pending')
            
            return (
              <Card key={vendor.id} className="border border-white/5 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{vendor.vendorCompany}</h3>
                      <p className="text-xs text-text-muted mt-0.5">PIC: {vendor.vendorPIC} ({vendor.email})</p>
                    </div>
                    <Badge variant="role" value="vendor" />
                  </div>

                  <div className="space-y-2 text-xs border-t border-white/5 pt-3">
                    <div className="flex justify-between">
                      <span className="text-text-muted">PIC Phone:</span>
                      <span className="text-text-primary font-medium">{vendor.vendorPhone}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-text-muted">Worker Count:</span>
                    <span className="text-text-primary font-medium">{vendor.vendorWorkerCount} Workers</span>
                    </div>
                    {vendor.vendorExpiryDate && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Expiry:</span>
                        <span className="text-text-primary font-medium">{formatDate(vendor.vendorExpiryDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Pending Extension Request Box */}
                  {pendingExtReq && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-3 rounded-2xl text-xs space-y-2">
                      <p className="font-semibold">⚠️ Account Extension Request (+{pendingExtReq.requestedDays} days)</p>
                      <p className="italic">"{pendingExtReq.reason}"</p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => setApproveExtModal({ vendor, reqId: pendingExtReq.id, requestedDays: pendingExtReq.requestedDays })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRejectExtModal({ vendor, reqId: pendingExtReq.id })}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions at bottom */}
                <div className="border-t border-white/5 mt-6 pt-4 flex gap-2">
                  {tab === 'pending' && (
                    <>
                      <Button onClick={() => setApproveModal(vendor)} className="w-full">
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => setRejectModal(vendor)} className="w-full">
                        Reject
                      </Button>
                    </>
                  )}
                  {tab === 'active' && !pendingExtReq && (
                    <Button variant="secondary" onClick={() => setApproveModal(vendor)} className="w-full">
                      Extend / Change Expiry
                    </Button>
                  )}
                  {tab === 'expired' && !pendingExtReq && (
                    <Button onClick={() => setApproveModal(vendor)} className="w-full">
                      Reactivate
                    </Button>
                  )}
                  {tab === 'archived' && (
                    <Button onClick={() => setApproveModal(vendor)} className="w-full">
                      Approve
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Approve Register / Modify Expiry Date Modal */}
      <AnimatePresence>
        {approveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApproveModal(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Set Vendor Account Expiry</h3>
              <p className="text-xs text-text-muted">
                Set the expiry date for vendor <strong>{approveModal.vendorCompany}</strong> to access the portal.
              </p>
              <div className="space-y-4 pt-2">
                <Input
                  label="Account Expiry Date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setApproveModal(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApproveRegister}>Approve & Activate</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Reject Register Modal */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Reject Vendor Request</h3>
              <form onSubmit={handleRejectRegister} className="space-y-4">
                <Textarea
                  label="Rejection Reason"
                  placeholder="Provide the reason for rejecting this vendor registration..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp Number"
                  placeholder="E.g.: 08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setRejectModal(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger">
                    Reject
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Approve Extension Modal */}
      <AnimatePresence>
        {approveExtModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApproveExtModal(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Approve Account Extension</h3>
              <p className="text-sm text-text-secondary">
                Do you approve extending the account for vendor <strong>{approveExtModal.vendor.vendorCompany}</strong> by{' '}
                <strong>+{approveExtModal.requestedDays} days</strong>?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setApproveExtModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleApproveExtension}>Approve</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Reject Extension Modal */}
      <AnimatePresence>
        {rejectExtModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectExtModal(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Reject Account Extension</h3>
              <form onSubmit={handleRejectExtension} className="space-y-4">
                <Textarea
                  label="Rejection Reason"
                  placeholder="Write the reason for rejecting the extension..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <Input
                  label="Leader IT WhatsApp Number"
                  placeholder="E.g.: 08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setRejectExtModal(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger">
                    Reject Extension
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
