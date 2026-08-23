import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, Input, Textarea, Skeleton } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import { notificationService } from '@/services/notificationService'
import { supabase, isSupabaseConfigured } from '@/services/supabase/client'
import { vendorLifecycleService } from '@/services/supabase/vendorLifecycle'
import type { User, Role, VendorExtensionRequest } from '@/types'
import { formatDate } from '@/utils/formatters'

const roleLabels: Record<Role, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  leaderit: 'Leader IT',
  vendor: 'Vendor',
}

const roleColors: Record<Role, string> = {
  karyawan: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  itsupport: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  leaderit: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  vendor: 'bg-green-500/20 text-green-400 border-green-500/30',
}

type StatusFilter = 'pending' | 'active' | 'expired' | 'archived'
type RoleFilter = 'all' | Role

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState<StatusFilter>('pending')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  
  // Modal states
  const [approveModal, setApproveModal] = useState<User | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<User | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)
  
  // Extension action states (vendor only)
  const [approveExtModal, setApproveExtModal] = useState<{ user: User; reqId: string; requestedDays: number } | null>(null)
  const [rejectExtModal, setRejectExtModal] = useState<{ user: User; reqId: string } | null>(null)
  const [pendingExtRequests, setPendingExtRequests] = useState<VendorExtensionRequest[]>([])
  const [approveExtError, setApproveExtError] = useState<string | null>(null)
  const [rejectExtError, setRejectExtError] = useState<string | null>(null)

  const supabaseMode = isSupabaseConfigured()

  // Forms state
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 6)
    return d.toISOString().split('T')[0]
  })
  const [reason, setReason] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    loadUsers()
    loadPendingExtensionRequests()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const all = await userRepo.getAll()
      // Exclude Leader IT from management (they are managed separately)
      setUsers(all.filter((u) => u.role !== 'leaderit'))
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

  const openApproveExtModal = (user: User, reqId: string, requestedDays: number) => {
    setApproveExtError(null)
    setApproveExtModal({ user, reqId, requestedDays })
  }

  const openRejectExtModal = (user: User, reqId: string) => {
    setRejectExtError(null)
    setRejectExtModal({ user, reqId })
  }

  const getStatus = (user: User): StatusFilter => {
    if (user.status === 'PendingApproval' || user.vendorStatus === 'PendingApproval') return 'pending'
    if (user.status === 'Expired' || user.vendorStatus === 'Expired') return 'expired'
    if (user.status === 'Archived' || user.vendorStatus === 'Archived') return 'archived'
    return 'active'
  }

  const openApproveModal = (user: User) => {
    setApproveError(null)
    setApproveModal(user)
  }

  const openRejectModal = (user: User) => {
    setRejectError(null)
    setRejectModal(user)
  }

  const handleApproveRegister = async () => {
    if (!approveModal) return
    setApproveError(null)
    try {
      if (approveModal.role === 'vendor' && approveModal.status === 'PendingApproval') {
        // STEP 4D: only a vendor whose CURRENT status is exactly 'PendingApproval'
        // may use this RPC (PendingApproval -> Active). Extend/Reactivate flows
        // keep their existing behavior below.
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
      } else if (approveModal.role === 'vendor') {
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
          // STEP 5D.12: Archived -> Active restore via the STEP 5D.9 RPC,
          // mirroring VendorManagementPage. The RPC guards the transition and
          // writes status + expiry server-side; rejection history stays
          // preserved. No client-side writes here.
          await vendorLifecycleService.restoreArchivedVendorAccount(approveModal.id, expiryDate)
        } else {
          // Local provider legacy path. In Supabase mode this fallback is only
          // reachable for unrecognized states: lifecycle writes are rejected by
          // the Supabase user repo, keeping those cases fail-closed as before.
          const updateData: Partial<User> = {
            status: 'Active',
            vendorStatus: 'Active',
            vendorExpiryDate: expiryDate,
            vendorTimeline: [
              ...(approveModal.vendorTimeline || []),
              {
                id: `vtl-${Date.now()}`,
                timestamp: new Date().toISOString(),
                activity: `Registration approved. Account active until ${formatDate(expiryDate)}.`,
              },
            ],
          }
          await userRepo.update(approveModal.id, updateData)
        }
      } else {
        if (!isSupabaseConfigured() || !supabase) {
          throw new Error(
            'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
              '(or keep VITE_DATA_PROVIDER=local until the Supabase repositories are ready).',
          )
        }
        const { error } = await supabase.rpc('fiyro_approve_account', {
          target_user_id: approveModal.id,
        })
        if (error) throw error
      }

      await notificationService.create({
        userId: approveModal.id,
        title: 'Account Approved',
        message: 'Your account has been approved',
        type: 'approval',
        targetType: 'profile',
        targetId: approveModal.id,
      })
      
      setApproveModal(null)
      loadUsers()
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
      if (rejectModal.role === 'vendor' && rejectModal.status === 'PendingApproval') {
        // STEP 4D: only a vendor whose CURRENT status is exactly 'PendingApproval'
        // routes through the rejection RPC (PendingApproval -> Archived). Other
        // vendor states keep their existing behavior below.
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
      } else if (rejectModal.role === 'vendor') {
        await userRepo.update(rejectModal.id, {
          status: 'Archived',
          rejectReason: reason,
          rejectWhatsApp: whatsapp,
          vendorStatus: 'Archived',
          vendorRejectReason: reason,
          vendorRejectWhatsApp: whatsapp,
          vendorTimeline: [
            ...(rejectModal.vendorTimeline || []),
            {
              id: `vtl-${Date.now()}`,
              timestamp: new Date().toISOString(),
              activity: `Registration rejected. Reason: ${reason}`,
            },
          ],
        })
      } else {
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
      }

      await notificationService.create({
        userId: rejectModal.id,
        title: 'Account Rejected',
        message: `Your registration was rejected. Reason: ${reason}`,
        type: 'approval',
        targetType: 'profile',
        targetId: rejectModal.id,
      })

      setRejectModal(null)
      setReason('')
      setWhatsapp('')
      loadUsers()
    } catch (err) {
      console.error(err)
      setRejectError(err instanceof Error ? err.message : 'Failed to reject account. Please try again.')
    }
  }

  const handleApproveExtension = async () => {
    if (!approveExtModal) return
    const { user, reqId, requestedDays } = approveExtModal
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
        const requests = (user.vendorExtensionRequests || []).map((r) => {
          if (r.id === reqId) return { ...r, status: 'Approved' as const }
          return r
        })

        const baseDate = new Date(user.vendorExpiryDate && new Date(user.vendorExpiryDate) > new Date() ? user.vendorExpiryDate : new Date())
        baseDate.setDate(baseDate.getDate() + requestedDays)
        const newExpiry = baseDate.toISOString().split('T')[0]

        const vendorTimeline = [
          ...(user.vendorTimeline || []),
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Account extension approved for +${requestedDays} days. New expiry: ${formatDate(newExpiry)}.`,
          },
        ]

        await userRepo.update(user.id, {
          status: 'Active',
          vendorStatus: 'Active',
          vendorExpiryDate: newExpiry,
          vendorExtensionRequests: requests,
          vendorTimeline,
        })
      }

      await notificationService.create({
        userId: user.id,
        title: 'Extension Approved',
        message: `Your account extension request has been approved for +${requestedDays} days`,
        type: 'extension',
        targetType: 'profile',
        targetId: user.id,
      })

      setApproveExtModal(null)
      await Promise.all([loadUsers(), loadPendingExtensionRequests()])
    } catch (err) {
      console.error(err)
      setApproveExtError(err instanceof Error ? err.message : 'Failed to approve extension. Please try again.')
    }
  }

  const handleRejectExtension = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectExtModal || !reason.trim() || !whatsapp.trim()) return
    const { user, reqId } = rejectExtModal
    setRejectExtError(null)
    try {
      if (supabaseMode) {
        // Server-side only: marks the request Rejected; the vendor row stays Expired.
        if (!reqId) throw new Error('Extension request identifier is missing.')
        await vendorLifecycleService.rejectVendorExtension(reqId, reason.trim(), whatsapp.trim())
      } else {
        // LOCAL PROVIDER ONLY: legacy JSON mutation for the demo provider.
        const requests = (user.vendorExtensionRequests || []).map((r) => {
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
          ...(user.vendorTimeline || []),
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Account extension rejected. Reason: ${reason}`,
          },
        ]

        await userRepo.update(user.id, {
          vendorExtensionRequests: requests,
          vendorTimeline,
        })
      }

      await notificationService.create({
        userId: user.id,
        title: 'Extension Rejected',
        message: `Your extension request was rejected. Reason: ${reason}`,
        type: 'extension',
        targetType: 'profile',
        targetId: user.id,
      })

      setRejectExtModal(null)
      setReason('')
      setWhatsapp('')
      await Promise.all([loadUsers(), loadPendingExtensionRequests()])
    } catch (err) {
      console.error(err)
      setRejectExtError(err instanceof Error ? err.message : 'Failed to reject extension. Please try again.')
    }
  }

  // Filter users based on status and role
  const filtered = users.filter((u) => {
    const status = getStatus(u)
    if (status !== statusTab) return false
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    return true
  })

  const statusTabLabels: Record<StatusFilter, string> = {
    pending: 'Waiting Approval',
    active: 'Active',
    expired: 'Expired',
    archived: 'Archived',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
        <p className="text-text-muted text-sm mt-1">
          Review registration requests, manage accounts, and handle approvals for all roles.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
        {(['pending', 'active', 'expired', 'archived'] as const).map((t) => {
          const count = users.filter((u) => getStatus(u) === t).length
          const tabColors: Record<StatusFilter, string> = {
            pending: statusTab === t ? 'border-yellow-500 text-yellow-400' : '',
            active: statusTab === t ? 'border-green-500 text-green-400' : '',
            expired: statusTab === t ? 'border-red-500 text-red-400' : '',
            archived: statusTab === t ? 'border-gray-500 text-gray-400' : '',
          }

          return (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                statusTab === t
                  ? tabColors[t]
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {statusTabLabels[t]} ({count})
            </button>
          )
        })}
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-brand-primary text-white'
              : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          All Roles
        </button>
        {(['karyawan', 'itsupport', 'vendor'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              roleFilter === role
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {roleLabels[role]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-24px" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 text-text-muted">
          No accounts in this category.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((user) => {
            const pendingExtReq = supabaseMode
              ? pendingExtRequests.find((r) => r.vendorId === user.id)
              : user.vendorExtensionRequests?.find((r) => r.status === 'Pending')
            
            return (
              <Card key={user.id} className="border border-white/5 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{user.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                    </div>
                    <Badge 
                      variant="custom" 
                      className={`text-xs px-2 py-1 rounded-full border ${roleColors[user.role]}`}
                    >
                      {roleLabels[user.role]}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs border-t border-white/5 pt-3">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Department:</span>
                      <span className="text-text-primary font-medium">{user.department}</span>
                    </div>
                    {user.role === 'vendor' && user.vendorCompany && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Company:</span>
                          <span className="text-text-primary font-medium">{user.vendorCompany}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">PIC:</span>
                          <span className="text-text-primary font-medium">{user.vendorPIC}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Phone:</span>
                          <span className="text-text-primary font-medium">{user.vendorPhone}</span>
                        </div>
                        {user.vendorExpiryDate && (
                          <div className="flex justify-between">
                            <span className="text-text-muted">Expiry:</span>
                            <span className="text-text-primary font-medium">{formatDate(user.vendorExpiryDate)}</span>
                          </div>
                        )}
                      </>
                    )}
                    {user.rejectReason && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-xs font-medium">Rejected: {user.rejectReason}</p>
                        {user.rejectWhatsApp && (
                          <p className="text-red-300 text-xs mt-1">WhatsApp: {user.rejectWhatsApp}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pending Extension Request (Vendor only) */}
                  {pendingExtReq && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-3 rounded-2xl text-xs space-y-2">
                      <p className="font-semibold">⚠️ Extension Request (+{pendingExtReq.requestedDays} days)</p>
                      <p className="italic">"{pendingExtReq.reason}"</p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => openApproveExtModal(user, pendingExtReq.id, pendingExtReq.requestedDays)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openRejectExtModal(user, pendingExtReq.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-white/5 mt-4 pt-4 flex gap-2">
                  {statusTab === 'pending' && (
                    <>
                      <Button onClick={() => openApproveModal(user)} className="w-full">
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => openRejectModal(user)} className="w-full">
                        Reject
                      </Button>
                    </>
                  )}
                  {statusTab === 'active' && user.role === 'vendor' && !pendingExtReq && (
                    <Button variant="secondary" onClick={() => openApproveModal(user)} className="w-full">
                      Extend / Modify
                    </Button>
                  )}
                  {statusTab === 'expired' && user.role === 'vendor' && !pendingExtReq && (
                    <Button onClick={() => openApproveModal(user)} className="w-full">
                      Reactivate
                    </Button>
                  )}
                  {statusTab === 'archived' && user.role === 'vendor' && !pendingExtReq && (
                    <Button onClick={() => openApproveModal(user)} className="w-full">
                      Approve
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Approve Modal */}
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
              <h3 className="text-lg font-bold text-text-primary">
                {approveModal.role === 'vendor' ? 'Set Vendor Account Expiry' : 'Approve Account'}
              </h3>
              <p className="text-xs text-text-muted">
                Approve account for <strong>{approveModal.name}</strong> ({roleLabels[approveModal.role]})
              </p>
              {approveModal.role === 'vendor' && (
                <Input
                  label="Expiry Date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              )}
              {approveError && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-xs font-medium">{approveError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setApproveModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleApproveRegister}>Approve</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
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
              <h3 className="text-lg font-bold text-text-primary">Reject Registration</h3>
              <p className="text-xs text-text-muted">
                Reject account for <strong>{rejectModal.name}</strong> ({roleLabels[rejectModal.role]})
              </p>
              <form onSubmit={handleRejectRegister} className="space-y-4">
                <Textarea
                  label="Rejection Reason"
                  placeholder="Provide the reason for rejection..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp Number"
                  placeholder="08123456789"
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

      {/* Approve Extension Modal */}
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
              <h3 className="text-lg font-bold text-text-primary">Approve Extension</h3>
              <p className="text-xs text-text-muted">
                Approve +{approveExtModal.requestedDays} days extension for <strong>{approveExtModal.user.name}</strong>
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

      {/* Reject Extension Modal */}
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
              <h3 className="text-lg font-bold text-text-primary">Reject Extension</h3>
              <form onSubmit={handleRejectExtension} className="space-y-4">
                <Textarea
                  label="Rejection Reason"
                  placeholder="Provide the reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp Number"
                  placeholder="08123456789"
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
                    Reject
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