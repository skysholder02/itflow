import type { Session } from '@/types'
import type { ISessionRepository } from '../types'
import { supabaseAuthAdapter } from '@/services/supabase/authAdapter'

class SupabaseSessionRepository implements ISessionRepository {
  // Reads the current Supabase Auth session and resolves it through
  // public.profiles into the application Session structure.
  async getSession(): Promise<Session | null> {
    return supabaseAuthAdapter.getSession()
  }

  // SAFETY: a Supabase session can only be issued by Supabase Auth (sign-in /
  // OAuth / magic link). Arbitrary application Session data cannot create an
  // authenticated Supabase session, so this deliberately fails instead of
  // pretending authentication succeeded. This only affects the Supabase
  // provider; the active LocalStorage provider keeps its own setSession.
  async setSession(_session: Session): Promise<void> {
    throw new Error(
      'Supabase sessionRepository.setSession is not supported. Supabase sessions are ' +
        'issued only by Supabase Auth. Sign in through supabaseAuthAdapter ' +
        'signInWithPassword instead. Keep VITE_DATA_PROVIDER=local until the ' +
        'application authentication is migrated.',
    )
  }

  // Signs out through Supabase Auth. Does not touch LocalStorage session
  // handling (LocalStorage remains the active provider).
  async clearSession(): Promise<void> {
    await supabaseAuthAdapter.signOut()
  }
}

export const supabaseSessionRepo = new SupabaseSessionRepository()