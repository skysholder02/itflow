import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { cardStaggerItem } from '@/animations/variants'

interface StatWidgetProps {
  label: string
  value: number | string
  icon: string
  color: string
}

export function StatWidget({ label, value, icon, color }: StatWidgetProps) {
  return (
    <motion.div variants={cardStaggerItem}>
      <Card hover>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-muted">{label}</p>
            <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${color}`}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
