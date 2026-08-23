import type { Session, User } from '@/types'
import { supabase, isSupabaseConfigured } from '@/services/supabase/client'
import { mapProfileRowToUser } from '@/services/supabase/profileMapper'

// Development-friendly error when Supabase env vars are missing.
const NOT_CONFIGURED_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
  '(or keep VITE_DATA_PROVIDER=local until the Supabase repositories are ready).'

function getClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(NOT_CONFIGURED_ERROR)
  }
  return supabase
}

// Resolve an authenticated Supabase Auth user id into the corresponding
// application User via public.profiles (profiles.id = auth.users.id).
// Fails loudly if the Auth user has no profile row — never silently
// authenticates into the application without a profile.
async function resolveProfileByAuthUserId(authUserId: string): Promise<User> {
  const client = getClient()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle()

  if (error) throw new Error(`Failed to load profile: ${error.message}`)
  if (!data) {
    throw new Error(
      `Supabase Auth user ${authUserId} has no corresponding application profile ` +
        '(public.profiles). The profile is normally created automatically by the ' +
        'handle_new_user trigger. This user cannot authenticate into FIYRO.',
    )
  }
  return mapProfileRowToUser(data)
}

// Map an authenticated profile into the application Session structure.
function toSession(user: User): Session {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export interface SignUpInput {
  email: string
  password: string
  // Passed as Supabase Auth user metadata (raw_user_meta_data). The
  // handle_new_user trigger on auth.users reads these keys to create the
  // public.profiles row automatically — no direct profile insert happens here.
  metadata: SignUpMetadata
}

// Keys consumed by handle_new_user() in the database. Keep in sync with that
// function — it validates role against ('karyawan'|'itsupport'|'leaderit'|
// 'vendor') and safely casts the vendor numeric/date fields.
export interface SignUpMetadata {
  name?: string
  role?: 'karyawan' | 'itsupport' | 'leaderit' | 'vendor'
  department?: string
  whatsapp?: string
  vendor_company?: string
  vendor_pic?: string
  vendor_phone?: string
  vendor_worker_count?: number
  vendor_expiry_date?: string
}

export interface SignUpResult {
  // True when the project requires email confirmation: Supabase issued no
  // session yet and the user must confirm their email before signing in.
  needsEmailConfirmation: boolean
}

// Clean abstraction over Supabase Auth. Does not expose raw Supabase objects.
// Never reads, compares, or stores passwords — Supabase Auth handles credential
// verification internally.
export const supabaseAuthAdapter = {
  // Creates the Auth user only. The profile row is created by the existing
  // handle_new_user() database trigger (status defaults to PendingApproval).
  // This function intentionally does not insert into public.profiles.
  async signUp(input: SignUpInput): Promise<SignUpResult> {
    const client = getClient()

    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: input.metadata },
    })

    if (error) throw new Error(error.message)

    return { needsEmailConfirmation: !data.session }
  },

  async signInWithPassword(email: string, password: string): Promise<Session> {
    const client = getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const authUserId = data.user.id
    const user = await resolveProfileByAuthUserId(authUserId)
    return toSession(user)
  },

  async signOut(): Promise<void> {
    const client = getClient()
    const { error } = await client.auth.signOut()
    if (error) throw new Error(error.message)
  },

  // Reads the current Supabase Auth session. Returns the application Session
  // resolved through public.profiles, or null when not authenticated.
  async getSession(): Promise<Session | null> {
    const client = getClient()
    const {
      data: { session },
      error,
    } = await client.auth.getSession()
    if (error) throw new Error(error.message)
    if (!session?.user) return null
    const user = await resolveProfileByAuthUserId(session.user.id)
    return toSession(user)
  },

  // Returns the current authenticated application User, or null when signed out.
  // Throws if an Auth user exists but has no profile.
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession()
    if (!session) return null
    return resolveProfileByAuthUserId(session.userId)
  },
}

export { resolveProfileByAuthUserId }