import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, Input, Textarea, Select, Skeleton, EmptyState } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import { jobService } from '@/services/jobService'
import type { User, Job } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/formatters'

export function JobManagementPage() {
  const navigate = useNavigate()
  const { user: currentUser, role } = useAuth()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [activeVendors, setActiveVendors] = useState<User[]>([])
  const [itSupports, setItSupports] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Create Job Modal
  const [createModal, setCreateModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    deadline: '',
    vendorId: '',
    itSupportId: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      if (!role || !currentUser) return
      const [allJobs, allUsers] = await Promise.all([
        jobService.getJobs(role, currentUser.id),
        userRepo.getAll(),
      ])
      
      setJobs(allJobs)
      setActiveVendors(allUsers.filter((u) => u.role === 'vendor' && u.vendorStatus === 'Active'))
      setItSupports(allUsers.filter((u) => u.role === 'itsupport'))
      
      // Select default options for the form if available
      const vendorsList = allUsers.filter((u) => u.role === 'vendor' && u.vendorStatus === 'Active')
      const supportsList = allUsers.filter((u) => u.role === 'itsupport')
      setForm((prev) => ({
        ...prev,
        vendorId: vendorsList[0]?.id || '',
        itSupportId: supportsList[0]?.id || '',
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.location.trim() || !form.deadline || !form.vendorId || !form.itSupportId) return
    
    setSubmitting(true)
    try {
      const selectedVendor = activeVendors.find((v) => v.id === form.vendorId)
      const selectedITSupport = itSupports.find((s) => s.id === form.itSupportId)
      
      if (!selectedVendor || !selectedITSupport || !currentUser) return

      // Map the workers list from the vendor to prepopulate workers checklist in job details
      const workersList = (selectedVendor.vendorWorkersList || []).map((w) => ({
        name: w.name,
        position: w.position,
        phone: w.phone,
        present: false, // Default is not present until checked
      }))

      await jobService.createJob({
        title: form.title,
        description: form.description,
        location: form.location,
        deadline: form.deadline,
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.vendorCompany || selectedVendor.name,
        vendorPIC: selectedVendor.vendorPIC || '',
        vendorPhone: selectedVendor.vendorPhone || '',
        itSupportId: selectedITSupport.id,
        itSupportName: selectedITSupport.name,
        leaderId: currentUser.id,
        leaderName: currentUser.name,
        workers: workersList,
      })

      setCreateModal(false)
      setForm({
        title: '',
        description: '',
        location: '',
        deadline: '',
        vendorId: activeVendors[0]?.id || '',
        itSupportId: itSupports[0]?.id || '',
      })
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-24px" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Kelola Pekerjaan Vendor</h2>
          <p className="text-text-muted text-sm mt-1">Daftar semua pekerjaan, penugasan, dan status evaluasi vendor.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'Pending', label: 'Menunggu' },
                { value: 'Approved', label: 'Disetujui' },
                { value: 'In Progress', label: 'Dalam Proses' },
                { value: 'Need Extension', label: 'Butuh Perpanjangan' },
                { value: 'Completed', label: 'Selesai' },
                { value: 'Cancelled', label: 'Dibatalkan' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <Button onClick={() => setCreateModal(true)}>
            Buat Pekerjaan Baru
          </Button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          title="Tidak ada pekerjaan"
          description="Belum ada pekerjaan vendor yang terdaftar."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              hover
              onClick={() => navigate(`/vendor/jobs/${job.id}`)}
              className="cursor-pointer border border-white/5 flex flex-col justify-between h-full hover:border-brand-primary/40 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-accent">{job.id}</span>
                  <Badge variant="jobStatus" value={job.status} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {job.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 block">📍 {job.location}</p>
                </div>
              </div>

              <div className="border-t border-white/5 mt-6 pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Vendor Mitra:</span>
                  <span className="text-brand-primary font-medium">{job.vendorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">IT Support Pendamping:</span>
                  <span className="text-text-primary font-medium">{job.itSupportName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-text-muted">Deadline:</span>
                  <span className="text-red-400 font-semibold">{formatDate(job.deadline)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* --- CREATE JOB MODAL --- */}
      <AnimatePresence>
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-lg w-full relative z-10 border border-white/10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-text-primary">Buat Pekerjaan Vendor Baru</h3>
              
              {activeVendors.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-yellow-400">
                    Tidak ada vendor dengan status **Active** di dalam sistem. 
                    Anda harus menyetujui registrasi vendor terlebih dahulu sebelum membuat pekerjaan.
                  </p>
                  <Button variant="secondary" onClick={() => { setCreateModal(false); navigate('/leader/vendors') }}>
                    Ke Manajemen Vendor
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <Input
                    label="Judul Pekerjaan"
                    placeholder="Contoh: Install CCTV Warehouse"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                  <Textarea
                    label="Deskripsi Pekerjaan"
                    placeholder="Tulis deskripsi detail pekerjaan yang harus dilakukan..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  <Input
                    label="Lokasi Pekerjaan"
                    placeholder="Contoh: Gedung A - Gudang Warehouse"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      required
                    />
                    <Select
                      label="Vendor Mitra"
                      options={activeVendors.map((v) => ({
                        value: v.id,
                        label: `${v.vendorCompany} (PIC: ${v.vendorPIC})`,
                      }))}
                      value={form.vendorId}
                      onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                      required
                    />
                  </div>
                  <Select
                    label="IT Support Pendamping"
                    options={itSupports.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    value={form.itSupportId}
                    onChange={(e) => setForm({ ...form, itSupportId: e.target.value })}
                    required
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={() => setCreateModal(false)}>
                      Batal
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Buat & Delegasikan
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
