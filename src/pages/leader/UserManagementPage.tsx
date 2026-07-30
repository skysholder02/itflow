import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, Input, Textarea, Skeleton } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import type { User, Role } from '@/types'
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
  const [rejectModal, setRejectModal] = useState<User | null>(null)
  
  // Extension action states (vendor only)
  const [approveExtModal, setApproveExtModal] = useState<{ user: User; reqId: string; requestedDays: number } | null>(null)
  const [rejectExtModal, setRejectExtModal] = useState<{ user: User; reqId: string } | null>(null)

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

  const getStatus = (user: User): StatusFilter => {
    if (user.status === 'PendingApproval' || user.vendorStatus === 'PendingApproval') return 'pending'
    if (user.status === 'Expired' || user.vendorStatus === 'Expired') return 'expired'
    if (user.status === 'Archived' || user.vendorStatus === 'Archived') return 'archived'
    return 'active'
  }

  const handleApproveRegister = async () => {
    if (!approveModal) return
    try {
      const updateData: Partial<User> = {
        status: 'Active',
      }
      
      // For vendors, also update vendor-specific fields
      if (approveModal.role === 'vendor') {
        updateData.vendorStatus = 'Active'
        updateData.vendorExpiryDate = expiryDate
        updateData.vendorTimeline = [
          ...(approveModal.vendorTimeline || []),
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Registration approved. Account active until ${formatDate(expiryDate)}.`,
          },
        ]
      }
      
      await userRepo.update(approveModal.id, updateData)
      
      setApproveModal(null)
      loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModal || !reason.trim() || !whatsapp.trim()) return
    try {
      const updateData: Partial<User> = {
        status: 'Archived',
        rejectReason: reason,
        rejectWhatsApp: whatsapp,
      }
      
      // For vendors, also update vendor-specific fields
      if (rejectModal.role === 'vendor') {
        updateData.vendorStatus = 'Archived'
        updateData.vendorRejectReason = reason
        updateData.vendorRejectWhatsApp = whatsapp
        updateData.vendorTimeline = [
          ...(rejectModal.vendorTimeline || []),
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Registration rejected. Reason: ${reason}`,
          },
        ]
      }
      
      await userRepo.update(rejectModal.id, updateData)
      
      setRejectModal(null)
      setReason('')
      setWhatsapp('')
      loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveExtension = async () => {
    if (!approveExtModal) return
    const { user, reqId, requestedDays } = approveExtModal
    try {
      const requests = (user.vendorExtensionRequests || []).map((r) => {
        if (r.id === reqId) return { ...r, status: 'Approved' as const }
        return r
      })

      const baseDate = new Date(user.vendorExpiryDate && new Date(user.vendorExpiryDate) > new Date() ? user.vendorExpiryDate : new Date())
      baseDate.setDate(baseDate.getDate() + requestedDays)
      const newExpiry = baseDate.toISOString().split('T')[0]

      await userRepo.update(user.id, {
        status: 'Active',
        vendorStatus: 'Active',
        vendorExpiryDate: newExpiry,
        vendorExtensionRequests: requests,
        vendorTimeline: [
          ...(user.vendorTimeline || []),
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Account extension approved for +${requestedDays} days. New expiry: ${formatDate(newExpiry)}.`,
          },
        ],
      })

      setApproveExtModal(null)
      loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectExtension = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectExtModal || !reason.trim() || !whatsapp.trim()) return
    const { user, reqId } = rejectExtModal
    try {
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

      await userRepo.update(user.id, {
        vendorExtensionRequests: requests,
        vendorTimeline: [
          ...(user.vendorTimeline || []),
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Account extension rejected. Reason: ${reason}`,
          },
        ],
      })

      setRejectExtModal(null)
      setReason('')
      setWhatsapp('')
      loadUsers()
    } catch (err) {
      console.error(err)
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
            const pendingExtReq = user.vendorExtensionRequests?.find((r) => r.status === 'Pending')
            
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
                          onClick={() => setApproveExtModal({ user, reqId: pendingExtReq.id, requestedDays: pendingExtReq.requestedDays })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRejectExtModal({ user, reqId: pendingExtReq.id })}
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
                      <Button onClick={() => setApproveModal(user)} className="w-full">
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => setRejectModal(user)} className="w-full">
                        Reject
                      </Button>
                    </>
                  )}
                  {statusTab === 'active' && user.role === 'vendor' && !pendingExtReq && (
                    <Button variant="secondary" onClick={() => setApproveModal(user)} className="w-full">
                      Extend / Modify
                    </Button>
                  )}
                  {statusTab === 'expired' && user.role === 'vendor' && !pendingExtReq && (
                    <Button onClick={() => setApproveModal(user)} className="w-full">
                      Reactivate
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