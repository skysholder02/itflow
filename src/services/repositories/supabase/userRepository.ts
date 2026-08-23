import type { User } from '@/types'
import type { IUserRepository } from '../types'
import { supabase, isSupabaseConfigured } from '@/services/supabase/client'
import { mapProfileRowToUser } from '@/services/supabase/profileMapper'

// Supported app field -> public.profiles column.
// Fields NOT listed here are intentionally rejected by update() (see below).
const FIELD_MAP: Record<string, string> = {
  name: 'name',
  role: 'role',
  department: 'department',
  status: 'status',
  rejectReason: 'reject_reason',
  rejectWhatsApp: 'whatsapp',
  vendorCompany: 'vendor_company',
  vendorPIC: 'vendor_pic',
  vendorPhone: 'vendor_phone',
  vendorWorkerCount: 'vendor_worker_count',
  vendorExpiryDate: 'vendor_expiry_date',
}

// Fields that exist on the app User model but must NOT be written to profiles.
// Rejected explicitly so unsupported data is never silently dropped.
const REJECTED_FIELDS: Record<string, string> = {
  id: 'the primary key cannot be updated',
  email: 'email changes must go through Supabase Auth (profiles.email mirrors auth.users.email)',
  password: 'passwords are never stored in public.profiles',
  avatar: 'avatar is not yet supported by public.profiles',
  vendorStatus: 'vendorStatus is a legacy alias of status; use status instead',
  vendorWorkersList: 'the vendor workers table is not created yet',
  vendorRejectReason: 'vendor rejection fields are not yet supported by public.profiles',
  vendorRejectWhatsApp: 'vendor rejection fields are not yet supported by public.profiles',
  vendorTimeline: 'the vendor timeline table is not created yet',
  vendorExtensionRequests: 'the vendor extension request table is not created yet',
}

function getClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
        '(or keep VITE_DATA_PROVIDER=local until the Supabase repositories are ready).',
    )
  }
  return supabase
}

class SupabaseUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    const client = getClient()
    // Deterministic ordering by the canonical display name so list-derived UI
    // (e.g. default select entries) is stable across loads.
    const { data, error } = await client.from('profiles').select('*').order('name', { ascending: true })
    if (error) throw new Error(`Failed to load profiles: ${error.message}`)
    return (data ?? []).map(mapProfileRowToUser)
  }

  async getById(id: string): Promise<User | null> {
    const client = getClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(`Failed to load profile: ${error.message}`)
    return data ? mapProfileRowToUser(data) : null
  }

  async getByEmail(email: string): Promise<User | null> {
    const client = getClient()
    // Case-insensitive lookup, matching the LocalStorage implementation.
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .maybeSingle()
    if (error) throw new Error(`Failed to load profile: ${error.message}`)
    return data ? mapProfileRowToUser(data) : null
  }

  async create(_data: Omit<User, 'id'>): Promise<User> {
    // SAFETY: public.profiles.id is a foreign key to auth.users(id). Inserting a
    // profile with an arbitrary UUID would either violate the FK or create an
    // orphaned profile with no matching auth user. User creation must go through
    // Supabase Auth (supabase.auth.signUp), whose AFTER INSERT trigger on
    // auth.users automatically creates the profile. That adapter is implemented
    // in a later step, so direct creation is deliberately not supported here.
    throw new Error(
      'Supabase userRepository.create is not supported. New users must be created ' +
        'through Supabase Auth (supabase.auth.signUp), which triggers the ' +
        'handle_new_user function to create the profile automatically. ' +
        'Directly inserting a profile would create an orphaned row.',
    )
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const client = getClient()

    // Reject unsupported fields explicitly instead of silently ignoring them.
    const unsupported = Object.keys(data).filter(
      (key) => key in REJECTED_FIELDS && data[key as keyof User] !== undefined,
    )
    if (unsupported.length > 0) {
      const details = unsupported
        .map((key) => `${key} (${REJECTED_FIELDS[key]})`)
        .join('; ')
      throw new Error(
        `Supabase userRepository.update rejected field(s): ${details}. ` +
          'Keep VITE_DATA_PROVIDER=local until these are supported.',
      )
    }

    const payload: Record<string, string | number> = {}
    for (const [appKey, dbKey] of Object.entries(FIELD_MAP)) {
      const value = data[appKey as keyof User]
      if (value !== undefined) {
        payload[dbKey] = value as string | number
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new Error('No updatable fields provided to Supabase userRepository.update')
    }

    const { data: updated, error } = await client
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    if (!updated) throw new Error(`User not found: ${id}`)
    return mapProfileRowToUser(updated)
  }
}

export const supabaseUserRepo = new SupabaseUserRepository()