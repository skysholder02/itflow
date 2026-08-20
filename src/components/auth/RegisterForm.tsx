import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Input, Select } from '@/components/ui'
import { userRepo } from '@/services/repositories'
import { fadeUp, fadeUpTransition } from '@/animations/variants'
import { setRegistrationInfo } from '@/components/auth/RegistrationStatusCard'
import type { User } from '@/types'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [role, setRole] = useState<'karyawan' | 'itsupport' | 'vendor'>('karyawan')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [picName, setPicName] = useState('')
  const [phone, setPhone] = useState('')
  const [workerCount, setWorkerCount] = useState('1')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        setError('Email and password are required')
        return
      }

      if (role !== 'vendor' && !name) {
        setError('All fields are required')
        return
      }

      const existing = await userRepo.getByEmail(email)
      if (existing) {
        setError('Email is already registered')
        return
      }

      const userData: Omit<User, 'id'> = {
        email,
        password,
        role,
        department: role === 'vendor' ? 'External Vendor' : department || 'General',
        name: role === 'vendor' ? picName : name,
        status: 'PendingApproval',
      }

      if (role === 'vendor') {
        if (!companyName || !picName || !phone) {
          setError('All vendor data is required')
          return
        }

        const parsedWorkerCount = parseInt(workerCount, 10)
        if (!parsedWorkerCount || parsedWorkerCount < 1) {
          setError('Worker count must be at least 1')
          return
        }

        userData.vendorStatus = 'PendingApproval'
        userData.vendorCompany = companyName
        userData.vendorPIC = picName
        userData.vendorPhone = phone
        userData.vendorWorkerCount = parsedWorkerCount
        userData.vendorWorkersList = []
        userData.vendorTimeline = [
          {
            id: `vtl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            activity: `Vendor account registration submitted (PendingApproval) by PIC: ${picName}.`,
          },
        ]
        userData.vendorExtensionRequests = []
      }

      await userRepo.create(userData)

      // Store registration info for status card on Login page
      setRegistrationInfo(email, role)

      // Notify parent to show the login view with registration status
      onSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during registration'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={fadeUpTransition}
      className="w-full max-w-md relative z-10"
    >
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-[-0.02em]">
          Create your account
        </h1>
        <p className="text-sm text-text-secondary mt-2 font-[450] tracking-[-0.01em]">
          Register to start using ITFlow
        </p>
      </div>

      <div
        className="rounded-3xl bg-white border border-black/[0.06] p-6 lg:p-8"
        style={{ boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.05)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          <Select
            label="Role"
            options={[
              { value: 'karyawan', label: 'Employee' },
              { value: 'itsupport', label: 'IT Support' },
              { value: 'vendor', label: 'Vendor' },
            ]}
            value={role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as typeof role)}
          />

          {role === 'vendor' ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-t border-black/[0.06] pt-6"
            >
              <h3 className="text-base font-semibold text-slate-800">Vendor Information</h3>

              <Input
                label="Company Name"
                placeholder="e.g. PT Solusi Utama"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <Input
                label="PIC Name"
                placeholder="PIC name"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="e.g. 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Worker Count"
                type="number"
                min="1"
                placeholder="Worker count"
                value={workerCount}
                onChange={(e) => setWorkerCount(e.target.value)}
                required
              />
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Department"
                  placeholder="e.g. Production, Warehouse, HR"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </>
          )}

          <Button type="submit" loading={loading} className="w-full !rounded-xl focus-visible:ring-2 focus-visible:ring-brand-primary/70 focus-visible:ring-offset-2">
            {role === 'vendor' ? 'Submit Vendor Registration' : 'Create account'}
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-brand-primary hover:underline font-medium cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  )
}