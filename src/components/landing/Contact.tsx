import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { contactService } from '@/services/notificationService'
import { fadeUp, fadeUpTransition } from '@/animations/variants';

const schema = z.object({
  name: z.string().min(2, 'Nama harus terdiri dari minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  message: z.string().min(10, 'Pesan harus terdiri dari minimal 10 karakter'),
})

type FormData = z.infer<typeof schema>

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await contactService.submit(data)
    setSubmitted(true)
    reset()
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section id="contact" className="py-24 relative">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={fadeUpTransition}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Hubungi Kami
          </h2>
          <p className="text-text-muted">
            Ada pertanyaan? Kami ingin mendengar dari Anda.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card>
            {submitted ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Pesan Terkirim!
                </h3>
                <p className="text-text-muted text-sm">
                  Terima kasih telah menghubungi kami. Kami akan segera merespon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nama"
                  id="name"
                  placeholder="Nama Anda"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="email@perusahaan.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Textarea
                  label="Pesan"
                  id="message"
                  placeholder="Bagaimana kami bisa membantu?"
                  error={errors.message?.message}
                  {...register('message')}
                />
                <Button type="submit" loading={isSubmitting} className="w-full">
                  Kirim Pesan
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
