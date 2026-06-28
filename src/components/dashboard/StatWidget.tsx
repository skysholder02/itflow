import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { cardStaggerItem, cardStaggerItemTransition } from '@/animations/variants'

interface StatWidgetProps {
  label: string
  value: number | string
}

export function StatWidget({ label, value }: StatWidgetProps) {
  return (
    <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
      <Card hover padding="lg">
        <p className="text-sm text-text-muted font-medium">{label}</p>
        <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
      </Card>
    </motion.div>
  )
}