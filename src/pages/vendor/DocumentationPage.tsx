import { useEffect, useState } from 'react'
import { Card, EmptyState, Skeleton, DocumentationImage, ImageViewer } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { jobService } from '@/services/jobService'
import type { JobDocumentation } from '@/types'
import { formatDateTime } from '@/utils/formatters'
import { Link } from 'react-router-dom'

interface ConsolidatedDocumentation extends JobDocumentation {
  jobId: string
  jobTitle: string
}

export function DocumentationPage() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<ConsolidatedDocumentation[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerImage, setViewerImage] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    if (!user) return
    jobService.getJobs('vendor', user.id)
      .then((jobs) => {
        const list: ConsolidatedDocumentation[] = []
        jobs.forEach((job) => {
          job.documentation.forEach((doc) => {
            list.push({
              ...doc,
              jobId: job.id,
              jobTitle: job.title,
            })
          })
        })
        list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        setDocs(list)
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-24px" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Documentation Gallery</h2>
        <p className="text-text-muted text-sm mt-1">
          All Before, Progress, and After documentation photos uploaded
        </p>
      </div>

      {docs.length === 0 ? (
        <Card>
          <EmptyState
            title="No documentation"
            description="No job documentation photos uploaded yet."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="glass-card overflow-hidden group border border-white/5 flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-bg-tertiary">
                  <DocumentationImage
                    src={doc.photoUrl}
                    alt={`${doc.type} documentation photo`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onView={(url) => setViewerImage({ src: url, alt: `${doc.type} documentation photo` })}
                    showZoomIcon
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-brand-accent uppercase">
                    {doc.type}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <Link to={`/vendor/jobs/${doc.jobId}`} className="text-sm font-semibold text-text-primary hover:text-brand-primary block truncate">
                    {doc.jobTitle}
                  </Link>
                  <span className="text-[10px] font-mono text-text-muted block mt-0.5">{doc.jobId}</span>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-white/5 flex justify-between items-center text-xs text-text-muted mt-2">
                <span>By: {doc.uploadedBy}</span>
                <span>{formatDateTime(doc.uploadedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageViewer
        open={!!viewerImage}
        onClose={() => setViewerImage(null)}
        src={viewerImage?.src ?? ''}
        alt={viewerImage?.alt ?? ''}
      />
    </div>
  )
}
