import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { contactService } from '@/services/notificationService'
import { fadeUp } from '@/animations/variants'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-text-muted">
            Have questions? We&apos;d love to hear from you.
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
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Message Sent!
                </h3>
                <p className="text-text-muted text-sm">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Name"
                  id="name"
                  placeholder="Your name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Textarea
                  label="Message"
                  id="message"
                  placeholder="How can we help?"
                  error={errors.message?.message}
                  {...register('message')}
                />
                <Button type="submit" loading={isSubmitting} className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
