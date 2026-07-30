import { useEffect, useState } from 'react'
import { Card, EmptyState, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { jobService } from '@/services/jobService'
import type { JobMaterialNote } from '@/types'
import { formatDate } from '@/utils/formatters'
import { Link } from 'react-router-dom'

interface ConsolidatedMaterial extends JobMaterialNote {
  jobId: string
  jobTitle: string
}

export function MaterialNotesPage() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<ConsolidatedMaterial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    jobService.getJobs('vendor', user.id)
      .then((jobs) => {
        const list: ConsolidatedMaterial[] = []
        jobs.forEach((job) => {
          job.materials.forEach((mat) => {
            list.push({
              ...mat,
              jobId: job.id,
              jobTitle: job.title,
            })
          })
        })
        // Sort by date created desc
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setMaterials(list)
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-24px" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Material Notes</h2>
        <p className="text-text-muted text-sm mt-1">
          List of all materials used across all jobs
        </p>
      </div>

      <Card>
        {materials.length === 0 ? (
          <EmptyState
            title="No materials"
            description="No materials registered or used yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-text-muted text-xs uppercase">
                  <th className="py-3 px-4">Job</th>
                  <th className="py-3 px-4">Material Name</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Added By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/vendor/jobs/${mat.jobId}`} className="text-brand-accent hover:underline font-medium">
                        {mat.jobTitle}
                      </Link>
                      <span className="text-[10px] text-text-muted block font-mono">{mat.jobId}</span>
                    </td>
                    <td className="py-3 px-4 text-text-primary font-medium">{mat.materialName}</td>
                    <td className="py-3 px-4 text-text-secondary">
                      {mat.quantity} {mat.unit}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">{mat.addedBy}</td>
                    <td className="py-3 px-4 text-text-muted text-xs">{formatDate(mat.createdAt)}</td>
                    <td className="py-3 px-4 text-text-muted text-xs">{mat.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
