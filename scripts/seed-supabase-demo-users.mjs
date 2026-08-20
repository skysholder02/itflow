#!/usr/bin/env node
// =============================================================================
// FIYRO - Seed / backfill the four demo accounts in Supabase.
//
// SERVER-SIDE / LOCAL-SCRIPT ONLY.
// Uses SUPABASE_SERVICE_ROLE_KEY, which must NEVER be exposed to the browser.
// This file is NOT imported by any React/Vite code. It runs standalone with:
//
//   npm run seed:supabase
//
// Required environment (non-VITE, server-side only):
//   SUPABASE_URL=
//   SUPABASE_SERVICE_ROLE_KEY=
//
// Reads them from the process environment, falling back to `.env.local` then
// `.env` in the project root (both are git-ignored).
//
// Behavior (idempotent - safe to run repeatedly):
//   1. For each demo account: create the auth.users row if missing (no dupes).
//   2. auth.users INSERT fires handle_new_user -> creates a PendingApproval
//      profile automatically.
//   3. The profile is then UPSERTed (onConflict: id) to Active with the demo
//      profile data, and any missing profile is backfilled using the auth user
//      UUID + auth.users.email as source of truth.
// =============================================================================

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile(file) {
  const filePath = resolve(projectRoot, file)
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const eq = trimmed.indexOf('=')
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Set them in .env.local / .env (git-ignored) or the process environment.',
  )
  process.exit(1)
}

// -----------------------------------------------------------------------------
// Source of truth: mirrors src/data/demoAccounts.ts + src/data/mockData.ts
// (seedUsers for the four @fiyro.demo accounts). Passwords/roles/emails must
// match the existing FIYRO demo configuration exactly.
// -----------------------------------------------------------------------------
const DEMO_USERS = [
  {
    email: 'employee@fiyro.demo',
    password: 'demo123',
    name: 'Karyawan 1',
    role: 'karyawan',
    department: 'Produksi',
  },
  {
    email: 'support@fiyro.demo',
    password: 'demo123',
    name: 'ITSupport',
    role: 'itsupport',
    department: 'Departemen IT',
  },
  {
    email: 'leader@fiyro.demo',
    password: 'demo123',
    name: 'LeaderIT',
    role: 'leaderit',
    department: 'Kepemimpinan IT',
  },
  {
    email: 'vendor@fiyro.demo',
    password: 'demo123',
    name: 'Vendor Utama',
    role: 'vendor',
    department: 'Vendor Eksternal',
    vendorCompany: 'PT Solusi Teknologi Nusantara',
    vendorPIC: 'Rian Wijaya',
    vendorPhone: '081234567890',
    vendorWorkerCount: 3,
    vendorExpiryDate: '2027-01-01',
  },
]

function buildProfile(demo, authUserId) {
  return {
    id: authUserId,
    email: demo.email,
    name: demo.name,
    role: demo.role,
    department: demo.department,
    status: 'Active',
    reject_reason: null,
    whatsapp: null,
    vendor_company: demo.vendorCompany ?? null,
    vendor_pic: demo.vendorPIC ?? null,
    vendor_phone: demo.vendorPhone ?? null,
    vendor_worker_count: demo.vendorWorkerCount ?? null,
    vendor_expiry_date: demo.vendorExpiryDate ?? null,
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Load existing Auth users once for idempotent lookups by email.
  const existingByEmail = new Map()
  {
    let page = 1
    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) throw new Error(`listUsers failed: ${error.message}`)
      for (const u of data.users) {
        if (u.email) existingByEmail.set(u.email.toLowerCase(), u)
      }
      if (data.users.length < 1000) break
      page += 1
    }
  }

  const results = []

  for (const demo of DEMO_USERS) {
    const emailKey = demo.email.toLowerCase()
    const existing = existingByEmail.get(emailKey)
    let authUserId = existing?.id ?? null

    if (authUserId) {
      results.push({ email: demo.email, action: 'exists' })
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: {
          name: demo.name,
          role: demo.role,
          department: demo.department,
          ...(demo.vendorCompany
            ? {
                vendor_company: demo.vendorCompany,
                vendor_pic: demo.vendorPIC,
                vendor_phone: demo.vendorPhone,
                vendor_worker_count: demo.vendorWorkerCount,
                vendor_expiry_date: demo.vendorExpiryDate,
              }
            : {}),
        },
      })
      if (error) throw new Error(`createUser failed for ${demo.email}: ${error.message}`)
      authUserId = data.user.id
      existingByEmail.set(emailKey, data.user)
      results.push({ email: demo.email, action: 'created' })
    }

    // Ensure the profile exists (trigger may have created a PendingApproval
    // profile; upsert flips it to Active and backfills any missing row).
    const profile = buildProfile(demo, authUserId)
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
    if (upsertError) {
      throw new Error(`profile upsert failed for ${demo.email}: ${upsertError.message}`)
    }

    const { data: prof, error: profError } = await supabase
      .from('profiles')
      .select('id,email,name,role,status')
      .eq('id', authUserId)
      .maybeSingle()
    if (profError) throw new Error(`profile verify failed for ${demo.email}: ${profError.message}`)

    results[results.length - 1].id = authUserId
    results[results.length - 1].profile = prof ? `${prof.role}/${prof.status}` : 'MISSING'
  }

  console.log('Supabase demo accounts ready:')
  for (const r of results) {
    console.log(`  - ${r.email} [${r.action}] id=${r.id} profile=${r.profile}`)
  }
  console.log('Idempotent - safe to re-run.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})