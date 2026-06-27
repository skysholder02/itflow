import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import type { TicketCategory } from '@/types'

interface CategoryChartProps {
  data: Record<TicketCategory, number>
}

const categories: TicketCategory[] = [
  'Printer',
  'WiFi',
  'PC',
  'CCTV',
  'Speaker',
  'Other',
]

const colors = [
  'bg-brand-primary',
  'bg-brand-secondary',
  'bg-brand-accent',
  'bg-blue-500',
  'bg-purple-500',
  'bg-indigo-500',
]

export function CategoryChart({ data }: CategoryChartProps) {
  const max = Math.max(...Object.values(data), 1)

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Tickets by Category
      </h3>
      <div className="space-y-4">
        {categories.map((cat, i) => {
          const count = data[cat] ?? 0
          const width = (count / max) * 100
          return (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-secondary">{cat}</span>
                <span className="text-text-muted">{count}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`h-full rounded-full ${colors[i % colors.length]}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
