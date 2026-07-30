import { useAuth } from '@/contexts/AuthContext'
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard'
import { ITSupDashboard } from '@/components/dashboard/ITSupDashboard'
import { LeaderITDashboard } from '@/components/dashboard/LeaderITDashboard'
import { VendorDashboard } from '@/components/vendor/VendorDashboard'

export function DashboardPage() {
  const { role } = useAuth()

  if (role === 'vendor') {
    return <VendorDashboard />
  }

  if (role === 'karyawan') {
    return <EmployeeDashboard />
  }

  if (role === 'itsupport') {
    return <ITSupDashboard />
  }

  return <LeaderITDashboard />
}
