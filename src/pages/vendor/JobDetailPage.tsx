import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, Input, Textarea, Select, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types'
import { formatDate, formatDateTime } from '@/utils/formatters'

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [materialModal, setMaterialModal] = useState(false)
  const [docModal, setDocModal] = useState(false)
  const [extensionModal, setExtensionModal] = useState(false)
  
  // Forms state
  const [materialForm, setMaterialForm] = useState({ name: '', qty: 1, unit: 'pcs', notes: '' })
  const [docForm, setDocForm] = useState({ type: 'Progress' as 'Before' | 'Progress' | 'After', url: '' })
  const [extensionForm, setExtensionForm] = useState({ reason: '', days: 3 })
  
  // Rating state
  const [ratingVal, setRatingVal] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  
  // Rejection state for Leader IT
  const [rejectExtModal, setRejectExtModal] = useState<string | null>(null) // contains requestId
  const [rejectReason, setRejectReason] = useState('')
  const [rejectWhatsapp, setRejectWhatsapp] = useState('')

  useEffect(() => {
    if (!id) return
    loadJob()
  }, [id])

  const loadJob = async () => {
    if (!id) return
    try {
      const data = await jobService.getJob(id)
      setJob(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-24px" />
          <Skeleton className="h-96 rounded-24px" />
        </div>
      </div>
    )
  }

  if (!job || !user || !role) {
    return (
      <Card className="text-center py-12">
        <p className="text-text-muted">Job not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Back</Button>
      </Card>
    )
  }

  // Permissions checks
  const isVendor = role === 'vendor'
  const isITSupport = role === 'itsupport'
  const isLeader = role === 'leaderit'
  const isAssignedVendor = isVendor && job.vendorId === user.id
  const isAssignedITSupport = isITSupport && job.itSupportId === user.id
  
  // Allow action only if vendor/support is assigned, or leader
  const canModify = isLeader || isAssignedVendor || isAssignedITSupport

  // Status Handlers
  const handleStartJob = async () => {
    try {
      const updated = await jobService.updateJobStatus(job.id, 'In Progress')
      setJob(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCompleteJob = async () => {
    try {
      const updated = await jobService.updateJobStatus(job.id, 'Completed')
      setJob(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleWorkerAttendance = async (index: number, present: boolean) => {
    if (!canModify || isLeader) return // Vendors & IT Support can mark attendance
    const updatedWorkers = [...job.workers]
    updatedWorkers[index] = { ...updatedWorkers[index], present }
    try {
      const updated = await jobService.updateWorkersAttendance(job.id, updatedWorkers)
      setJob(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialForm.name.trim()) return
    try {
      const updated = await jobService.addMaterialNote(job.id, {
        materialName: materialForm.name,
        quantity: materialForm.qty,
        unit: materialForm.unit,
        notes: materialForm.notes,
        addedBy: user.name,
      })
      setJob(updated)
      setMaterialModal(false)
      setMaterialForm({ name: '', qty: 1, unit: 'pcs', notes: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    // Use selected default mockup photo if none provided to make testing easier
    const photoUrl = docForm.url.trim() || 'https://images.unsplash.com/photo-1581092334272-87c6131f6874?auto=format&fit=crop&w=400&q=80'
    try {
      const updated = await jobService.uploadDocumentation(job.id, {
        type: docForm.type,
        photoUrl,
        uploadedBy: user.name,
      })
      setJob(updated)
      setDocModal(false)
      setDocForm({ type: 'Progress', url: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleRequestExtension = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extensionForm.reason.trim()) return
    try {
      const updated = await jobService.requestExtension(job.id, extensionForm.reason, extensionForm.days)
      setJob(updated)
      setExtensionModal(false)
      setExtensionForm({ reason: '', days: 3 })
    } catch (err) {
      console.error(err)
    }
  }

  // Leader IT Extension Approvals
  const handleApproveExtension = async (reqId: string) => {
    try {
      const updated = await jobService.approveExtension(job.id, reqId)
      setJob(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectExtensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectExtModal || !rejectReason.trim() || !rejectWhatsapp.trim()) return
    try {
      const updated = await jobService.rejectExtension(job.id, rejectExtModal, rejectReason, rejectWhatsapp)
      setJob(updated)
      setRejectExtModal(null)
      setRejectReason('')
      setRejectWhatsapp('')
    } catch (err) {
      console.error(err)
    }
  }

  // Ratings
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const byRole = isVendor ? 'vendor' : 'itsupport'
    try {
      const updated = await jobService.submitRating(job.id, ratingVal, ratingComment, byRole)
      setJob(updated)
      setRatingComment('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleRatingVisibility = async (idx: number, isPublic: boolean) => {
    try {
      const updated = await jobService.updateRatingVisibility(job.id, idx, isPublic)
      setJob(updated)
    } catch (err) {
      console.error(err)
    }
  }

  // Check if current user has rated
  const userRoleRatingType = isVendor ? 'vendor' : 'itsupport'
  const hasUserRated = job.ratings.some((r) => r.byRole === userRoleRatingType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-brand-accent">{job.id}</span>
            <Badge variant="jobStatus" value={job.status} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mt-1">{job.title}</h2>
          <p className="text-text-muted text-sm">📍 {job.location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>

          {/* Action buttons based on status & role */}
          {isVendor && isAssignedVendor && (job.status === 'Pending' || job.status === 'Approved') && (
            <Button onClick={handleStartJob}>Start Job</Button>
          )}

          {isVendor && isAssignedVendor && (job.status === 'In Progress' || job.status === 'Need Extension') && (
            <>
              <Button variant="secondary" onClick={() => setExtensionModal(true)}>
                Need Extension
              </Button>
              <Button variant="secondary" onClick={() => setDocModal(true)}>
                Upload Doc
              </Button>
              <Button onClick={handleCompleteJob}>Complete Job</Button>
            </>
          )}
          
          {/* IT Support can also upload documentation and materials */}
          {isITSupport && isAssignedITSupport && (job.status === 'In Progress' || job.status === 'Need Extension') && (
            <>
              <Button variant="secondary" onClick={() => setDocModal(true)}>
                Upload Doc
              </Button>
              <Button variant="secondary" onClick={() => setMaterialModal(true)}>
                Add Material
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details, Workers, Materials, Documentation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description & Metadata */}
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Job Description</h3>
            <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {job.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 text-xs">
              <div>
                <span className="text-text-muted block">Leader IT:</span>
                <span className="text-text-primary font-medium text-sm">{job.leaderName}</span>
              </div>
              <div>
                <span className="text-text-muted block">IT Support:</span>
                <span className="text-text-primary font-medium text-sm">{job.itSupportName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Vendor PIC:</span>
                <span className="text-text-primary font-medium text-sm">
                  {job.vendorPIC} ({job.vendorPhone})
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Deadline:</span>
                <span className="text-red-400 font-semibold text-sm">{formatDate(job.deadline)}</span>
              </div>
            </div>
          </Card>

          {/* Workers checklist */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Worker Attendance</h3>
              <span className="text-xs text-text-muted">
                {job.workers.filter(w => w.present).length} of {job.workers.length} present
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.workers.map((worker, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    worker.present
                      ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                      : 'bg-white/5 border-white/5 text-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!worker.present}
                      disabled={!canModify || isLeader} // Read only for leader
                      onChange={(e) => handleWorkerAttendance(index, e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 text-brand-primary focus:ring-brand-primary bg-bg-tertiary cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{worker.name}</p>
                      <p className="text-xs text-text-muted">{worker.position}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono">{worker.phone}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Materials Section */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Material Notes</h3>
              {(isVendor && isAssignedVendor || isITSupport && isAssignedITSupport) && (
                <Button size="sm" onClick={() => setMaterialModal(true)}>
                  Add Material
                </Button>
              )}
            </div>

            {job.materials.length === 0 ? (
              <p className="text-sm text-text-muted py-2">No materials added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted text-xs uppercase">
                      <th className="py-2">Material</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Added By</th>
                      <th className="py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.materials.map((mat) => (
                      <tr key={mat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-text-primary font-medium">{mat.materialName}</td>
                        <td className="py-3 text-text-secondary">
                          {mat.quantity} {mat.unit}
                        </td>
                        <td className="py-3 text-text-muted text-xs">{mat.addedBy}</td>
                        <td className="py-3 text-text-muted text-xs">{mat.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Documentation gallery */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Documentation (Gallery)</h3>
              {canModify && !isLeader && (
                <Button size="sm" variant="secondary" onClick={() => setDocModal(true)}>
                  Upload Photo
                </Button>
              )}
            </div>

            {job.documentation.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center bg-white/5 rounded-2xl border border-white/5">
                No photo documentation uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {job.documentation.map((doc) => (
                  <div key={doc.id} className="glass-card overflow-hidden group border border-white/5">
                    <div className="relative aspect-video w-full overflow-hidden bg-bg-tertiary">
                      <img
                        src={doc.photoUrl}
                        alt={`${doc.type} doc`}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-brand-accent uppercase">
                        {doc.type}
                      </span>
                    </div>
                    <div className="p-3 text-xs space-y-1">
                      <p className="text-text-primary font-medium truncate">By: {doc.uploadedBy}</p>
                      <p className="text-text-muted">{formatDateTime(doc.uploadedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Extension requests list (Leader Approvals / View only) */}
          {job.extensionRequests.length > 0 && (
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Extension Request History</h3>
              <div className="space-y-3">
                {job.extensionRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">
                          Extra +{req.additionalDays} Days
                        </span>
                        <span className="text-xs text-text-muted">({formatDate(req.requestedAt)})</span>
                      </div>
                      <p className="text-text-secondary text-xs">Reason: {req.reason}</p>
                      {req.status === 'Rejected' && (
                        <div className="text-xs text-red-400 mt-2 bg-red-500/10 p-2.5 rounded-xl border border-red-500/10">
                          <p><strong>Rejected:</strong> {req.rejectReason}</p>
                          <p className="mt-1">WhatsApp Leader: {req.rejectWhatsApp}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      {req.status === 'Pending' ? (
                        isLeader ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveExtension(req.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setRejectExtModal(req.id)}>
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge value="Pending" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" />
                        )
                      ) : req.status === 'Approved' ? (
                        <Badge value="Approved" className="bg-green-500/20 text-green-400 border-green-500/30" />
                      ) : (
                        <Badge value="Rejected" className="bg-red-500/20 text-red-400 border-red-500/30" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Ratings & Reviews */}
          {job.status === 'Completed' && (
            <Card className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Rating & Review Evaluation</h3>

              {/* Display existing reviews */}
              {job.ratings.length > 0 && (
                <div className="space-y-4">
                  {job.ratings
                    .filter((r) => r.isPublic || isLeader || (isVendor && r.byRole === 'itsupport') || (isITSupport && r.byRole === 'vendor'))
                    .map((r, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">
                              {r.byRole === 'vendor' ? 'Main Vendor' : 'IT Support'}
                            </span>
                            <span className="text-xs text-text-muted">({formatDate(r.date)})</span>
                          </div>
                          <span className="text-yellow-400 font-bold">★ {r.rating} / 5</span>
                        </div>
                        <p className="text-sm text-text-secondary italic">"{r.comment}"</p>
                        
                        {isLeader && (
                          <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs">
                            <span className="text-text-muted">Leader IT Visibility:</span>
                            <button
                              onClick={() => handleToggleRatingVisibility(idx, !r.isPublic)}
                              className={`px-3 py-1 rounded-full border transition-all ${
                                r.isPublic
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-white/10 text-text-muted border-white/10'
                              }`}
                            >
                              {r.isPublic ? 'Public' : 'Internal'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Submit rating form */}
              {(isVendor && isAssignedVendor || isITSupport && isAssignedITSupport) && !hasUserRated && (
                <form onSubmit={handleRatingSubmit} className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h4 className="font-semibold text-text-primary text-sm">
                      Provide Your Rating for {isVendor ? 'IT Support Partner' : 'Vendor'}
                  </h4>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Star Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingVal(star)}
                          className="text-2xl text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          {ratingVal >= star ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Comment / Review"
                    placeholder="Write a job review..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    required
                  />

                  <Button type="submit">Submit Review</Button>
                </form>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Timeline (Read only) */}
        <div>
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Job Timeline</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {job.timeline.map((item, idx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {idx !== job.timeline.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/5" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-text-secondary font-medium">
                            {item.time}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-text-secondary">
                              {item.activity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Add Material Modal */}
      <AnimatePresence>
        {materialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMaterialModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Add Material Note</h3>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <Input
                  label="Material Name"
                  placeholder="E.g.: LAN Cable Cat6, RJ45, CCTV Bracket"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={materialForm.qty}
                    onChange={(e) => setMaterialForm({ ...materialForm, qty: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <Input
                    label="Unit"
                    placeholder="E.g.: Meter, pcs, roll"
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    required
                  />
                </div>
                <Textarea
                  label="Additional Notes"
                  placeholder="Optional notes..."
                  value={materialForm.notes}
                  onChange={(e) => setMaterialForm({ ...materialForm, notes: e.target.value })}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setMaterialModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Upload Documentation Modal */}
      <AnimatePresence>
        {docModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDocModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Upload Documentation Photo</h3>
              <form onSubmit={handleUploadDoc} className="space-y-4">
                <Select
                  label="Documentation Stage"
                  options={[
                    { value: 'Before', label: 'Before' },
                    { value: 'Progress', label: 'Progress' },
                    { value: 'After', label: 'After' },
                  ]}
                  value={docForm.type}
                  onChange={(e) => setDocForm({ ...docForm, type: e.target.value as any })}
                />
                <Input
                  label="Photo URL Link"
                  placeholder="Enter documentation photo URL link (optional)"
                  value={docForm.url}
                  onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                />
                <p className="text-[10px] text-text-muted">
                  *Leave empty to use a default demo image.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setDocModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Upload</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Request Extension Modal */}
      <AnimatePresence>
        {extensionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExtensionModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full relative z-10 border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-bold text-text-primary">Request Time Extension</h3>
              <form onSubmit={handleRequestExtension} className="space-y-4">
                <Input
                  label="Additional Days"
                  type="number"
                  min="1"
                  value={extensionForm.days}
                  onChange={(e) => setExtensionForm({ ...extensionForm, days: parseInt(e.target.value) || 1 })}
                  required
                />
                <Textarea
                  label="Reason for Extension"
                  placeholder="Why do you need extra time to complete this task?"
                  value={extensionForm.reason}
                  onChange={(e) => setExtensionForm({ ...extensionForm, reason: e.target.value })}
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setExtensionModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Leader Reject Extension Modal */}
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
              <h3 className="text-lg font-bold text-text-primary">Reject Time Extension</h3>
              <form onSubmit={handleRejectExtensionSubmit} className="space-y-4">
                <Textarea
                  label="Rejection Reason"
                  placeholder="Write the reason for rejecting the extension request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
                <Input
                  label="IT Support WhatsApp Number"
                  placeholder="E.g.: 081234567890"
                  value={rejectWhatsapp}
                  onChange={(e) => setRejectWhatsapp(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" type="button" onClick={() => setRejectExtModal(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger">
                    Reject Request
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
