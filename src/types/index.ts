export type Role = 'karyawan' | 'itsupport' | 'leaderit' | 'vendor'

export type AccountStatus = 'PendingApproval' | 'Active' | 'Expired' | 'Archived'

// Legacy type alias for backwards compatibility
export type VendorStatus = AccountStatus

export type TicketCategory = 'Printer' | 'WiFi' | 'PC' | 'CCTV' | 'Speaker' | 'Other'
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low'
export type TicketStatus = 'Open' | 'In Progress' | 'Completed'

export type AssetCategory = 'Printer' | 'PC' | 'CCTV' | 'Speaker' | 'Access Point'
export type AssetStatus = 'Active' | 'Maintenance' | 'Retired'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: Role
  department: string
  avatar?: string
  
  // Account status (applies to all roles)
  status?: AccountStatus
  
  // Rejection info (for pending accounts)
  rejectReason?: string
  rejectWhatsApp?: string
  
  // Vendor-specific fields
  vendorStatus?: VendorStatus
  vendorExpiryDate?: string
  vendorCompany?: string
  vendorPIC?: string
  vendorPhone?: string
  vendorWorkerCount?: number
  vendorWorkersList?: { name: string; position: string; phone: string }[]
  vendorRejectReason?: string
  vendorRejectWhatsApp?: string
  vendorTimeline?: { id: string; timestamp: string; activity: string }[]
  vendorExtensionRequests?: {
    id: string
    reason: string
    requestedDays: number
    status: 'Pending' | 'Approved' | 'Rejected'
    requestedAt: string
    rejectReason?: string
    rejectWhatsApp?: string
  }[]
}

export interface TicketNote {
  id: string
  text: string
  authorId: string
  authorName: string
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  location: string
  assetId?: string
  assetName?: string
  assetLocation?: string
  photo?: string
  reporterId: string
  reporterName: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
  notes: TicketNote[]
}

export interface CreateTicketDTO {
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  location: string
  assetId?: string
  assetName?: string
  assetLocation?: string
  photo?: string
  reporterId: string
  reporterName: string
}

export interface Asset {
  id: string
  name: string
  brand: string
  serialNumber: string
  location: string
  status: AssetStatus
  category: AssetCategory
  createdAt: string
  updatedAt: string
}

export interface CreateAssetDTO {
  name: string
  brand: string
  serialNumber: string
  location: string
  status: AssetStatus
  category: AssetCategory
}

export interface AssetHistory {
  id: string
  assetId: string
  date: string
  problem: string
  action: string
  technician: string
}

export interface CreateAssetHistoryDTO {
  assetId: string
  date: string
  problem: string
  action: string
  technician: string
}

export type NotificationType =
  | 'ticket'
  | 'asset'
  | 'vendor'
  | 'approval'
  | 'extension'
  | 'system'

export type NotificationTargetType =
  | 'ticket'
  | 'asset'
  | 'vendor-job'
  | 'vendor'
  | 'user'
  | 'dashboard'
  | 'profile'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  type?: NotificationType
  targetType?: NotificationTargetType
  targetId?: string
}

export interface Announcement {
  id: string
  title: string
  description: string
  date: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

export interface DashboardStats {
  totalTickets: number
  openTickets: number
  completedTickets: number
  totalAssets: number
  ticketsByCategory: Record<TicketCategory, number>
}

export interface Session {
  userId: string
  email: string
  name: string
  role: Role
}

export type JobStatus = 'Pending' | 'Approved' | 'In Progress' | 'Need Extension' | 'Completed' | 'Cancelled'

export interface JobWorker {
  name: string
  position: string
  phone: string
  present?: boolean
}

export interface JobTimelineItem {
  id: string
  time: string
  activity: string
}

export interface JobDocumentation {
  id: string
  type: 'Before' | 'Progress' | 'After'
  photoUrl: string
  uploadedBy: string
  uploadedAt: string
}

export interface JobMaterialNote {
  id: string
  materialName: string
  quantity: number
  unit: string
  notes: string
  addedBy: string
  createdAt: string
}

export interface JobExtensionRequest {
  id: string
  reason: string
  additionalDays: number
  status: 'Pending' | 'Approved' | 'Rejected'
  rejectReason?: string
  rejectWhatsApp?: string
  requestedAt: string
}

export interface JobRating {
  rating: number
  comment: string
  date: string
  byRole: 'vendor' | 'itsupport'
  isPublic?: boolean
}

export interface Job {
  id: string
  title: string
  description: string
  location: string
  deadline: string
  status: JobStatus
  vendorId: string
  vendorName: string
  vendorPIC: string
  vendorPhone: string
  itSupportId: string
  itSupportName: string
  leaderId: string
  leaderName: string
  workers: JobWorker[]
  timeline: JobTimelineItem[]
  documentation: JobDocumentation[]
  materials: JobMaterialNote[]
  extensionRequests: JobExtensionRequest[]
  ratings: JobRating[]
}

