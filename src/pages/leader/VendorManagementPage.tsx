import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, Input, Textarea, Skeleton } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import { notificationService } from '@/services/notificationService'
import { supabase, isSupabaseConfigured } from '@/services/supabase/client'
import { vendorLifecycleService } from '@/services/supabase/vendorLifecycle'
import type { User, VendorExtensionRequest } from '@/types'
import { formatDate } from '@/utils/formatters'

export function VendorManagementPage() {
  const [vendors, setVendors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'active' | 'expired' | 'archived'>('pending')
  
  // Modal states
  const [approveModal, setApproveModal] = useState<User | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<User | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)
  
  // Extension action states
  const [approveExtModal, setApproveExtModal] = useState<{ vendor: User; reqId: string; requestedDays: number } | null>(null)
  const [rejectExtModal, setRejectExtModal] = useState<{ vendor: User; reqId: string } | null>(null)
  const [pendingExtRequests, setPendingExtRequests] = useState<VendorExtensionRequest[]>([])
  const [approveExtError, setApproveExtError] = useState<string | null>(null)
  const [rejectExtError, setRejectExtError] = useState<string | null>(null)

  const supabaseMode = isSupabaseConfigured()

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
    loadPendingExtensionRequests()
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

  // Pending extension requests come from public.vendor_extension_requests in
  // Supabase mode (RLS: Leader IT sees all Pending rows). SELECT only.
  const loadPendingExtensionRequests = async () => {
    if (!supabaseMode) return
    try {
      const requests = await vendorLifecycleService.getPendingExtensionRequests()
      setPendingExtRequests(requests)
    } catch (err) {
      console.error(err)
    }
  }

  const openApproveExtModal = (vendor: User, reqId: string, requestedDays: number) => {
    setApproveExtError(null)
    setApproveExtModal({ vendor, reqId, requestedDays })
  }

  const openRejectExtModal = (vendor: User, reqId: string) => {
    setRejectExtError(null)
    setRejectExtModal({ vendor, reqId })
  }

  const openApproveModal = (vendor: User) => {
    setApproveError(null)
    setApproveModal(vendor)
  }

  const openRejectModal = (vendor: User) => {
    setRejectError(null)
    setRejectModal(vendor)
  }

  const handleApproveRegister = async () => {
    if (!approveModal) return
    setApproveError(null)
    try {
      if (approveModal.status === 'PendingApproval') {
        // STEP 4D: only a vendor whose CURRENT status is exactly 'PendingApproval'
        // may use this RPC (PendingApproval -> Active). Extend / Reactivate /
        // Archived flows keep their existing behavior below.
        if (!isSupabaseConfigured() || !supabase) {
          throw new Error(
            'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
              '(or keep VITE_DATA_PROVIDER=local until the Supabase repositories are ready).',
          )
        }
        const { error } = await supabase.rpc('fiyro_approve_vendor_account', {
          target_user_id: approveModal.id,
          p_expiry_date: expiryDate,
        })
        if (error) throw error
      } else {
        if (supabaseMode && approveModal.vendorStatus === 'Active') {
          // STEP 5D.7: Active -> Active expiry change via the STEP 5C RPC. The
          // RPC guards the transition and writes vendor_expiry_date server-side;
          // no client-side lifecycle profile writes here.
          await vendorLifecycleService.changeVendorExpiry(approveModal.id, expiryDate)
        } else if (supabaseMode && approveModal.vendorStatus === 'Expired') {
          // STEP 5D.7: Expired -> Active reactivation via the STEP 5C RPC. The
          // RPC sets status + expiry server-side; no client-side writes here.
          await vendorLifecycleService.reactivateVendorAccount(approveModal.id, expiryDate)
        } else if (supabaseMode && approveModal.vendorStatus === 'Archived') {
          // STEP 5D.10: Archived -> Active restore via the STEP 5D.9 RPC. The
          // RPC guards the transition and writes status + expiry server-side;
          // rejection history stays preserved. No client-side writes here.
          await vendorLifecycleService.restoreArchivedVendorAccount(approveModal.id, expiryDate)
        } else {
          // Local provider legacy path. In Supabase mode this fallback is only
          // reachable for unrecognized states: lifecycle writes are rejected by
          // the Supabase user repo, keeping those cases fail-closed as before.
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
        }
      }

      await notificationService.create({
        userId: approveModal.id,
        title: 'Account Approved',
        message: 'Your vendor account has been approved',
        type: 'approval',
        targetType: 'profile',
        targetId: approveModal.id,
      })

      setApproveModal(null)
      loadVendors()
    } catch (err) {
      console.error(err)
      setApproveError(err instanceof Error ? err.message : 'Failed to approve account. Please try again.')
    }
  }

  const handleRejectRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModal || !reason.trim() || !whatsapp.trim()) return
    setRejectError(null)
    try {
      if (rejectModal.status === 'PendingApproval') {
        // STEP 4D: only a vendor whose CURRENT status is exactly 'PendingApproval'
        // routes through the rejection RPC (PendingApproval -> Archived).
        if (!isSupabaseConfigured() || !supabase) {
          throw new Error(
            'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
              '(or keep VITE_DATA_PROVIDER=local until the Supabase repositories are ready).',
          )
        }
        const { error } = await supabase.rpc('fiyro_reject_account', {
          target_user_id: rejectModal.id,
          p_reject_reason: reason,
          p_reject_whatsapp: whatsapp,
        })
        if (error) throw error
      } else {
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
      }

      await notificationService.create({
        userId: rejectModal.id,
        title: 'Account Rejected',
        message: `Your vendor registration was rejected. Reason: ${reason}`,
        type: 'approval',
        targetType: 'profile',
        targetId: rejectModal.id,
      })

      setRejectModal(null)
      setReason('')
      setWhatsapp('')
      loadVendors()
    } catch (err) {
      console.error(err)
      setRejectError(err instanceof Error ? err.message : 'Failed to reject account. Please try again.')
    }
  }

  const handleApproveExtension = async () => {
    if (!approveExtModal) return
    const { vendor, reqId, requestedDays } = approveExtModal
    setApproveExtError(null)
    try {
      if (supabaseMode) {
        // Server is the source of truth: real request UUID in, vendor status +
        // expiry computed by the RPC. No client-side expiry math, no profile writes.
        if (!reqId) throw new Error('Extension request identifier is missing.')
        await vendorLifecycleService.approveVendorExtension(reqId)
      } else {
        // LOCAL PROVIDER ONLY: demo data lives in localStorage, which has no
        // RPC equivalent. Client-side expiry math and JSON mutation are legacy-only.
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
      }

      await notificationService.create({
        userId: vendor.id,
        title: 'Extension Approved',
        message: `Your account extension request has been approved for +${requestedDays} days`,
        type: 'extension',
        targetType: 'profile',
        targetId: vendor.id,
      })

      setApproveExtModal(null)
      await Promise.all([loadVendors(), loadPendingExtensionRequests()])
    } catch (err) {
      console.error(err)
      setApproveExtError(err instanceof Error ? err.message : 'Failed to approve extension. Please try again.')
    }
  }

  const handleRejectExtension = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectExtModal || !reason.trim() || !whatsapp.trim()) return
    const { vendor, reqId } = rejectExtModal
    setRejectExtError(null)
    try {
      if (supabaseMode) {
        // Server-side only: marks the request Rejected; the vendor row stays Expired.
        if (!reqId) throw new Error('Extension request identifier is missing.')
        await vendorLifecycleService.rejectVendorExtension(reqId, reason.trim(), whatsapp.trim())
      } else {
        // LOCAL PROVIDER ONLY: legacy JSON mutation for the demo provider.
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
      }

      await notificationService.create({
        userId: vendor.id,
        title: 'Extension Rejected',
        message: `Your extension request was rejected. Reason: ${reason}`,
        type: 'extension',
        targetType: 'profile',
        targetId: vendor.id,
      })

      setRejectExtModal(null)
      setReason('')
      setWhatsapp('')
      await Promise.all([loadVendors(), loadPendingExtensionRequests()])
    } catch (err) {
      console.error(err)
      setRejectExtError(err instanceof Error ? err.message : 'Failed to reject extension. Please try again.')
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
            const pendingExtReq = supabaseMode
              ? pendingExtRequests.find((r) => r.vendorId === vendor.id)
              : vendor.vendorExtensionRequests?.find((r) => r.status === 'Pending')
            
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
                          onClick={() => openApproveExtModal(vendor, pendingExtReq.id, pendingExtReq.requestedDays)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openRejectExtModal(vendor, pendingExtReq.id)}
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
                      <Button onClick={() => openApproveModal(vendor)} className="w-full">
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => openRejectModal(vendor)} className="w-full">
                        Reject
                      </Button>
                    </>
                  )}
                  {tab === 'active' && !pendingExtReq && (
                    <Button variant="secondary" onClick={() => openApproveModal(vendor)} className="w-full">
                      Extend / Change Expiry
                    </Button>
                  )}
                  {tab === 'expired' && !pendingExtReq && (
                    <Button onClick={() => openApproveModal(vendor)} className="w-full">
                      Reactivate
                    </Button>
                  )}
                  {tab === 'archived' && (
                    <Button onClick={() => openApproveModal(vendor)} className="w-full">
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
                {approveError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-xs font-medium">{approveError}</p>
                  </div>
                )}
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
                {rejectError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-xs font-medium">{rejectError}</p>
                  </div>
                )}
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
              {approveExtError && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-xs font-medium">{approveExtError}</p>
                </div>
              )}
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
                {rejectExtError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-xs font-medium">{rejectExtError}</p>
                  </div>
                )}
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
