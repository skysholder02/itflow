import {
  supabase,
  isSupabaseConfigured,
} from '@/services/supabase/client'

// Private bucket used for job documentation photos. This bucket is expected to
// be created manually (see supabase/job-documentation-storage.sql) and must NOT
// be created through frontend code.
export const JOB_DOCUMENTATION_BUCKET = 'job-documentation'

function getClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }

  return supabase
}

// A storage reference is any value that is not an absolute URL. Legacy entries
// may still contain a full photo URL (e.g. seeded demo data), so those are kept
// as-is.
export function isStorageObjectPath(value: string): boolean {
  return !/^https?:\/\//i.test(value)
}

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
  'bmp',
  'heic',
])

function safeFileExtension(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName)
  if (!match) return ''
  const ext = match[1].toLowerCase()
  return ALLOWED_IMAGE_EXTENSIONS.has(ext) ? `.${ext}` : ''
}

function sanitizeSegment(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '')
  return cleaned || 'job'
}

function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

// Builds a predictable object path: job-documentation/{jobId}/{unique-name}.ext
// The returned value (including the bucket prefix) is what gets stored as
// photoUrl on the documentation entry.
export function buildJobDocumentationPath(jobId: string, file: File): string {
  const jobSegment = sanitizeSegment(jobId)
  const uniqueName = `${Date.now()}-${generateUniqueId()}${safeFileExtension(file.name)}`
  return `${JOB_DOCUMENTATION_BUCKET}/${jobSegment}/${uniqueName}`
}

function resolveObjectPath(
  pathOrUrl: string,
): { bucket: string; objectPath: string } {
  const segments = pathOrUrl.split('/').filter(Boolean)
  if (segments[0] === JOB_DOCUMENTATION_BUCKET && segments.length > 1) {
    return {
      bucket: JOB_DOCUMENTATION_BUCKET,
      objectPath: segments.slice(1).join('/'),
    }
  }
  return { bucket: JOB_DOCUMENTATION_BUCKET, objectPath: pathOrUrl }
}

// Uploads an image to the private bucket and returns the full storage reference
// (job-documentation/{jobId}/{unique-name}.ext) to persist on the job.
export async function uploadJobDocumentation(
  jobId: string,
  file: File,
): Promise<string> {
  const client = getClient()

  const fullPath = buildJobDocumentationPath(jobId, file)
  const { bucket, objectPath } = resolveObjectPath(fullPath)

  const { error } = await client.storage
    .from(bucket)
    .upload(objectPath, file, {
      contentType: file.type || 'application/octet-stream',
    })

  if (error) {
    throw new Error(
      `Failed to upload documentation photo: ${error.message}`,
    )
  }

  return fullPath
}

// Removes an uploaded documentation object. Used to clean up orphaned files
// when the storage upload succeeds but the database update fails.
export async function removeJobDocumentation(pathOrUrl: string): Promise<void> {
  if (!isStorageObjectPath(pathOrUrl)) return

  const client = getClient()
  const { bucket, objectPath } = resolveObjectPath(pathOrUrl)

  const { error } = await client.storage
    .from(bucket)
    .remove([objectPath])

  if (error) {
    console.error(
      `Failed to remove documentation photo "${pathOrUrl}": ${error.message}`,
    )
  }
}

// Resolves a stored documentation reference to an accessible image URL.
// Absolute URLs (legacy data) are returned unchanged; storage references are
// resolved to short-lived signed URLs because the bucket is private.
export async function getJobDocumentationUrl(
  pathOrUrl: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  if (!isStorageObjectPath(pathOrUrl)) return pathOrUrl

  const client = getClient()
  const { bucket, objectPath } = resolveObjectPath(pathOrUrl)

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresInSeconds)

  if (error) {
    console.error(
      `Failed to create signed URL for "${pathOrUrl}": ${error.message}`,
    )
    return null
  }

  return data.signedUrl
}
