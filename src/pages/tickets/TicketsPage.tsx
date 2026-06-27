import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Badge, SkeletonList, EmptyState, Select } from '@/components/ui'
import { ticketService } from '@/services/ticketService'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateTime } from '@/utils/formatters'
import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from '@/types'

export function TicketsPage() {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    if (!role || !user) return
    ticketService.getTickets(role, user.id).then(setTickets).finally(() => setLoading(false))
  }, [role, user])

  const filtered = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  if (loading) return <SkeletonList count={5} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Tickets</h2>
          <p className="text-text-muted text-sm mt-1">
            {role === 'employee' ? 'Your submitted tickets' : 'All IT tickets'}
          </p>
        </div>
        {role && ticketService.canCreateTicket(role) && (
          <Button onClick={() => navigate('/tickets/create')}>Create Ticket</Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            ...(['Open', 'In Progress', 'Completed'] as TicketStatus[]).map((s) => ({
              value: s,
              label: s,
            })),
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Select
          options={[
            { value: 'all', label: 'All Categories' },
            ...(['Printer', 'WiFi', 'PC', 'CCTV', 'Speaker', 'Other'] as TicketCategory[]).map(
              (c) => ({ value: c, label: c }),
            ),
          ]}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <Select
          options={[
            { value: 'all', label: 'All Priorities' },
            ...(['Critical', 'High', 'Medium', 'Low'] as TicketPriority[]).map((p) => ({
              value: p,
              label: p,
            })),
          ]}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="No tickets found"
          description={
            role && ticketService.canCreateTicket(role)
              ? 'Create your first ticket to get started.'
              : 'No tickets match your filters.'
          }
          actionLabel={role && ticketService.canCreateTicket(role) ? 'Create Ticket' : undefined}
          onAction={
            role && ticketService.canCreateTicket(role)
              ? () => navigate('/tickets/create')
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/tickets/${ticket.id}`}
                className="block glass-card p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-muted font-mono">{ticket.id}</span>
                      <Badge variant="status" value={ticket.status} />
                      <Badge variant="priority" value={ticket.priority} />
                    </div>
                    <h3 className="text-text-primary font-medium truncate">{ticket.title}</h3>
                    <p className="text-text-muted text-sm mt-1">
                      {ticket.category} · {ticket.location} · {ticket.reporterName}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDateTime(ticket.createdAt)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
