import { motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { cardStaggerContainer, cardStaggerItem } from '@/animations/variants'
import { fadeUp, fadeUpTransition } from '@/animations/variants';

const features = [
  {
    title: 'Ticketing Cerdas',
    description: 'Buat, pantau, dan selesaikan Tiket IT dengan alur kerja berbasis prioritas dan update status real-time.',
  },
  {
    title: 'Manajemen Aset',
    description: 'Pantau setiap perangkat, printer, dan access point di seluruh infrastruktur operasional.',
  },
  {
    title: 'Pelacakan Aset QR Code',
    description: 'Buat QR Code untuk melihat aset, riwayat perbaikan, dan status perangkat langsung di lokasi.',
  },
  {
    title: 'Monitoring Infrastruktur',
    description: 'Pantau kondisi jaringan, status perangkat, dan performa sistem dari satu Dashboard.',
  },
  {
    title: 'Analitik & Laporan',
    description: 'Dapatkan insight dari ringkasan kategori, metrik penyelesaian, dan analisis tren untuk tim IT.',
  },
  {
    title: 'Notifikasi Cerdas',
    description: 'Tetap terinformasi dengan alert real-time untuk Tiket kritis, maintenance aset, dan event sistem.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={fadeUpTransition}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Semua yang Anda Butuhkan
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Platform manajemen layanan IT yang lengkap untuk lingkungan operasional modern.
          </p>
        </motion.div>

        <motion.div
          variants={cardStaggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardStaggerItem}>
              <Card hover className="h-full">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
