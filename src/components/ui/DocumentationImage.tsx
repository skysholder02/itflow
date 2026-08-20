import { useEffect, useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { getJobDocumentationUrl } from '@/services/supabase/storage'

interface DocumentationImageProps {
  src: string
  alt: string
  className?: string
  onView?: (url: string) => void
  showZoomIcon?: boolean
}

// Renders a job documentation image. `src` may be a stored storage reference
// (private bucket) or a legacy absolute URL; storage references are resolved to
// short-lived signed URLs before display.
export function DocumentationImage({
  src,
  alt,
  className,
  onView,
  showZoomIcon = false,
}: DocumentationImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setResolvedUrl(null)
    setFailed(false)

    getJobDocumentationUrl(src)
      .then((url) => {
        if (cancelled) return
        if (url) {
          setResolvedUrl(url)
        } else {
          setFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [src])

  if (failed) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-bg-tertiary text-text-muted text-xs p-2 text-center">
        Image unavailable
      </div>
    )
  }

  if (!resolvedUrl) {
    return <div className="h-full w-full bg-bg-tertiary animate-pulse" />
  }

  const handleClick = () => {
    onView?.(resolvedUrl)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!onView}
      aria-label={`View larger image: ${alt}`}
      className="group relative block h-full w-full cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default"
    >
      <img src={resolvedUrl} alt={alt} className={className} />
      {showZoomIcon && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
          <ZoomIn
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white drop-shadow"
            size={22}
          />
        </span>
      )}
    </button>
  )
}