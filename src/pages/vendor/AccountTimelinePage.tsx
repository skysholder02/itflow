import { Card, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateTime } from '@/utils/formatters'

export function AccountTimelinePage() {
  const { user } = useAuth()

  if (!user) return null
  const timeline = user.vendorTimeline || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Account Timeline</h2>
        <p className="text-text-muted text-sm mt-1">History of your vendor account status and registration activity</p>
      </div>

      <Card className="max-w-2xl">
        {timeline.length === 0 ? (
          <EmptyState
            title="No history"
            description="No account activity history recorded yet."
          />
        ) : (
          <div className="flow-root py-4">
            <ul className="-mb-8">
              {timeline.slice().reverse().map((item, idx) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {idx !== timeline.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/5" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-xs text-brand-primary">
                          ●
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-text-primary">
                            {item.activity}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {formatDateTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}
