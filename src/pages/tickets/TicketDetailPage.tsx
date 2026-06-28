import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Badge, Card, Select, Textarea, Skeleton } from '@/components/ui'
import { ticketService } from '@/services/ticketService'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateTime, formatTicketCategory, formatTicketStatus } from '@/utils/formatters'
import type { Ticket, TicketStatus } from '@/types'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadTicket = async () => {
    if (!id) return
    const data = await ticketService.getTicket(id)
    setTicket(data)
    setLoading(false)
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  if (loading) return <Skeleton className="h-64 w-full" />
  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Tiket tidak ditemukan</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/tickets')}>
          Kembali ke Tiket
        </Button>
      </div>
    )
  }

  const handleStatusChange = async (status: TicketStatus) => {
    const updated = await ticketService.updateTicket(ticket.id, { status })
    setTicket(updated)
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !user) return
    setSubmitting(true)
    const updated = await ticketService.addNote(ticket.id, {
      text: noteText,
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString(),
    })
    setTicket(updated)
    setNoteText('')
    setSubmitting(false)
  }

  if (role === 'karyawan' && ticket.reporterId !== user?.id) {
    navigate('/tickets')
    return null
  }

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/tickets')}>
        ← Kembali ke Tiket
      </Button>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-mono text-text-muted">{ticket.id}</span>
          <Badge variant="status" value={ticket.status} />
          <Badge variant="priority" value={ticket.priority} />
          <Badge value={formatTicketCategory(ticket.category)} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">{ticket.title}</h2>
        <p className="text-text-secondary leading-relaxed mb-4">{ticket.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Pelapor</span>
            <p className="text-text-primary">{ticket.reporterName}</p>
          </div>
          <div>
            <span className="text-text-muted">Lokasi</span>
            <p className="text-text-primary">{ticket.location}</p>
          </div>
          <div>
            <span className="text-text-muted">Dibuat</span>
            <p className="text-text-primary">{formatDateTime(ticket.createdAt)}</p>
          </div>
          <div>
            <span className="text-text-muted">Diperbarui</span>
            <p className="text-text-primary">{formatDateTime(ticket.updatedAt)}</p>
          </div>
        </div>

        {ticket.assetId && (
          <div className="mt-6 rounded-2xl bg-white/5 p-4 border border-white/6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-text-muted text-sm">Aset Terkait</span>
                <p className="text-text-primary font-medium mt-1">
                  {ticket.assetName ?? ticket.assetId}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  {ticket.assetId}
                  {ticket.assetLocation ? ` - ${ticket.assetLocation}` : ''}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/assets/manage/${ticket.assetId}`)}
              >
                Lihat Aset
              </Button>
            </div>
          </div>
        )}

        {ticket.photo && (
          <img
            src={ticket.photo}
            alt="Lampiran tiket"
            className="mt-4 rounded-xl max-h-60 object-cover"
          />
        )}

        {role && ticketService.canUpdateStatus(role) && (
          <div className="mt-6 pt-4 border-t border-white/6">
            <Select
              label="Perbarui Status"
              id="status"
              options={(['Open', 'In Progress', 'Completed'] as TicketStatus[]).map((s) => ({
                value: s,
                label: formatTicketStatus(s),
              }))}
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            />
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Catatan</h3>
        {ticket.notes.length === 0 ? (
          <p className="text-text-muted text-sm mb-4">Belum ada catatan.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {ticket.notes.map((note) => (
              <div key={note.id} className="border-l-2 border-brand-primary/50 pl-4">
                <p className="text-text-secondary text-sm">{note.text}</p>
                <p className="text-text-muted text-xs mt-1">
                  {note.authorName} · {formatDateTime(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        {role && ticketService.canAddNotes(role) && (
          <div className="space-y-3">
            <Textarea
              id="note"
              placeholder="Tambah catatan..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button onClick={handleAddNote} loading={submitting} disabled={!noteText.trim()}>
              Tambah Catatan
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
