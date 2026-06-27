export type Role = 'employee' | 'it_support' | 'leader_it'

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

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: string
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
