import type { VendorExtensionRequest, VendorExtensionStatus } from '@/types'
import { supabase, isSupabaseConfigured } from '@/services/supabase/client'

const NOT_CONFIGURED_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
  '(or keep VITE_DATA_PROVIDER=local until the Supabase repositories are ready).'

function getClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(NOT_CONFIGURED_ERROR)
  }
  return supabase
}

// Raw row shape of public.vendor_extension_requests (snake_case database fields).
interface VendorExtensionRequestRow {
  id: string
  vendor_id: string
  reason: string
  requested_days: number
  status: string
  reject_reason: string | null
  reject_whatsapp: string | null
  requested_at: string
  decided_at: string | null
  decided_by: string | null
}

function mapVendorExtensionRowToRequest(
  row: VendorExtensionRequestRow,
): VendorExtensionRequest {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    reason: row.reason,
    requestedDays: row.requested_days,
    status: row.status as VendorExtensionStatus,
    rejectReason: row.reject_reason ?? undefined,
    rejectWhatsapp: row.reject_whatsapp ?? undefined,
    requestedAt: row.requested_at,
    decidedAt: row.decided_at ?? undefined,
    decidedBy: row.decided_by ?? undefined,
  }
}

// Result of fiyro_change_vendor_expiry / fiyro_reactivate_vendor_account /
// fiyro_restore_archived_vendor_account (out_id, out_status, out_expiry).
export interface VendorExpiryResult {
  targetUserId: string
  status: string
  newExpiryDate: string | null
}

// Result of fiyro_request_vendor_extension.
export interface VendorExtensionRequestResult {
  requestId: string
  status: string
  requestedDays: number
  requestedAt: string
}

// Result of fiyro_approve_vendor_extension. newExpiryDate is computed by the
// database (greatest(existing expiry, today) + requested_days); never client-side.
export interface VendorExtensionApprovalResult {
  vendorId: string
  requestStatus: string
  newExpiryDate: string | null
}

// Result of fiyro_reject_vendor_extension.
export interface VendorExtensionRejectionResult {
  requestId: string
  requestStatus: string
}

interface ExpiryRpcRow {
  out_id: string
  out_status: string
  out_expiry: string | null
}

function mapExpiryRow(row: ExpiryRpcRow): VendorExpiryResult {
  return {
    targetUserId: row.out_id,
    status: row.out_status,
    newExpiryDate: row.out_expiry,
  }
}

export const vendorLifecycleService = {
  // Extension requests visible to the current authenticated user under RLS:
  // vendors see their own rows; Leader IT sees all rows (ver_select_own /
  // ver_select_leaderit). SELECT only — writes go through the RPCs below.
  async getMyExtensionRequests(): Promise<VendorExtensionRequest[]> {
    const client = getClient()
    const { data, error } = await client
      .from('vendor_extension_requests')
      .select('*')
      .order('requested_at', { ascending: false })
    if (error) throw new Error(`Failed to load extension requests: ${error.message}`)
    return (data ?? []).map(mapVendorExtensionRowToRequest)
  },

  async getVendorExtensionRequests(vendorId: string): Promise<VendorExtensionRequest[]> {
    const client = getClient()
    const { data, error } = await client
      .from('vendor_extension_requests')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('requested_at', { ascending: false })
    if (error) throw new Error(`Failed to load extension requests: ${error.message}`)
    return (data ?? []).map(mapVendorExtensionRowToRequest)
  },

  async getPendingExtensionRequests(): Promise<VendorExtensionRequest[]> {
    const client = getClient()
    const { data, error } = await client
      .from('vendor_extension_requests')
      .select('*')
      .eq('status', 'Pending')
      .order('requested_at', { ascending: false })
    if (error) throw new Error(`Failed to load pending extension requests: ${error.message}`)
    return (data ?? []).map(mapVendorExtensionRowToRequest)
  },

  // Active -> Active (vendor_expiry_date only). Target must be an Active vendor.
  async changeVendorExpiry(
    targetUserId: string,
    newExpiryDate: string,
  ): Promise<VendorExpiryResult> {
    const client = getClient()
    const { data, error } = await client.rpc('fiyro_change_vendor_expiry', {
      target_user_id: targetUserId,
      p_new_expiry_date: newExpiryDate,
    })
    if (error) throw new Error(error.message)
    return mapExpiryRow((data ?? [])[0] as ExpiryRpcRow)
  },

  // Expired -> Active (status + vendor_expiry_date). Target must be an Expired vendor.
  async reactivateVendorAccount(
    targetUserId: string,
    newExpiryDate: string,
  ): Promise<VendorExpiryResult> {
    const client = getClient()
    const { data, error } = await client.rpc('fiyro_reactivate_vendor_account', {
      target_user_id: targetUserId,
      p_new_expiry_date: newExpiryDate,
    })
    if (error) throw new Error(error.message)
    return mapExpiryRow((data ?? [])[0] as ExpiryRpcRow)
  },

  // Archived -> Active restore (status + vendor_expiry_date). Target must be an
  // Archived vendor. The server guards the transition; rejection history is
  // preserved on the profile row. Introduced by STEP 5D.9 / wired in STEP 5D.10.
  async restoreArchivedVendorAccount(
    targetUserId: string,
    newExpiryDate: string,
  ): Promise<VendorExpiryResult> {
    const client = getClient()
    const { data, error } = await client.rpc('fiyro_restore_archived_vendor_account', {
      target_user_id: targetUserId,
      p_new_expiry_date: newExpiryDate,
    })
    if (error) throw new Error(error.message)
    return mapExpiryRow((data ?? [])[0] as ExpiryRpcRow)
  },

  // Vendor self-service request. Identity comes exclusively from auth.uid();
  // the account must be expired and no Pending request may already exist.
  async requestVendorExtension(
    reason: string,
    requestedDays: number,
  ): Promise<VendorExtensionRequestResult> {
    const client = getClient()
    const { data, error } = await client.rpc('fiyro_request_vendor_extension', {
      p_reason: reason,
      p_requested_days: requestedDays,
    })
    if (error) throw new Error(error.message)
    const row = (data ?? [])[0] as {
      out_request_id: string
      out_status: string
      out_requested_days: number
      out_requested_at: string
    }
    return {
      requestId: row.out_request_id,
      status: row.out_status,
      requestedDays: row.out_requested_days,
      requestedAt: row.out_requested_at,
    }
  },

  // Pending -> Approved AND Expired -> Active atomically. The server owns the
  // expiry calculation; no client-supplied date exists on this RPC.
  async approveVendorExtension(requestId: string): Promise<VendorExtensionApprovalResult> {
    const client = getClient()
    const { data, error } = await client.rpc('fiyro_approve_vendor_extension', {
      p_request_id: requestId,
    })
    if (error) throw new Error(error.message)
    const row = (data ?? [])[0] as {
      out_vendor_id: string
      out_request_status: string
      out_new_expiry: string | null
    }
    return {
      vendorId: row.out_vendor_id,
      requestStatus: row.out_request_status,
      newExpiryDate: row.out_new_expiry,
    }
  },

  // Pending -> Rejected. The vendor profile row is untouched (stays Expired).
  async rejectVendorExtension(
    requestId: string,
    rejectReason: string,
    rejectWhatsapp: string,
  ): Promise<VendorExtensionRejectionResult> {
    const client = getClient()
    const { data, error } = await client.rpc('fiyro_reject_vendor_extension', {
      p_request_id: requestId,
      p_reject_reason: rejectReason,
      p_reject_whatsapp: rejectWhatsapp,
    })
    if (error) throw new Error(error.message)
    const row = (data ?? [])[0] as {
      out_request_id: string
      out_request_status: string
    }
    return {
      requestId: row.out_request_id,
      requestStatus: row.out_request_status,
    }
  },
}
