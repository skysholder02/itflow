import type {
  User,
  Ticket,
  CreateTicketDTO,
  Asset,
  CreateAssetDTO,
  AssetHistory,
  CreateAssetHistoryDTO,
  Notification,
  TicketNote,
  Session,
} from '@/types'

export interface IUserRepository {
  getAll(): Promise<User[]>
  getById(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  update(id: string, data: Partial<User>): Promise<User>
}

export interface ITicketRepository {
  getAll(): Promise<Ticket[]>
  getById(id: string): Promise<Ticket | null>
  getByReporter(userId: string): Promise<Ticket[]>
  create(data: CreateTicketDTO): Promise<Ticket>
  update(id: string, data: Partial<Ticket>): Promise<Ticket>
  addNote(id: string, note: TicketNote): Promise<Ticket>
  delete(id: string): Promise<void>
}

export interface IAssetRepository {
  getAll(): Promise<Asset[]>
  getById(id: string): Promise<Asset | null>
  create(data: CreateAssetDTO): Promise<Asset>
  update(id: string, data: Partial<Asset>): Promise<Asset>
  delete(id: string): Promise<void>
}

export interface IAssetHistoryRepository {
  getAll(): Promise<AssetHistory[]>
  getByAssetId(assetId: string): Promise<AssetHistory[]>
  create(data: CreateAssetHistoryDTO): Promise<AssetHistory>
  delete(id: string): Promise<void>
}

export interface INotificationRepository {
  getByUserId(userId: string): Promise<Notification[]>
  markAsRead(id: string): Promise<void>
  markAllAsRead(userId: string): Promise<void>
}

export interface ISessionRepository {
  getSession(): Promise<Session | null>
  setSession(session: Session): Promise<void>
  clearSession(): Promise<void>
}

export interface IContactRepository {
  submit(data: { name: string; email: string; message: string }): Promise<void>
}
