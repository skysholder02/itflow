import { useCallback, useRef } from 'react'

// ISO/IEC 18004 recommends a 4-module quiet zone around the QR symbol.
const QUIET_ZONE_MODULES = 4
const MODULE_PX = 20
const DEFAULT_MODULES = 33

export function useQRCodeDownload() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
  }, [])

  const download = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    const svg = container.querySelector('svg')
    if (!svg) return

    // react-qr-code draws modules edge-to-edge inside its viewBox
    // (1 unit = 1 module) and has no quiet-zone option of its own.
    const baseVal = svg.viewBox.baseVal
    const modules =
      Number.isFinite(baseVal.width) && baseVal.width > 0 ? baseVal.width : DEFAULT_MODULES

    const quietZone = QUIET_ZONE_MODULES * MODULE_PX
    const qrSize = Math.round(modules * MODULE_PX)
    const dimension = qrSize + quietZone * 2

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = dimension
      canvas.height = dimension
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }
      // White quiet zone baked into the exported PNG itself, on all four sides.
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, dimension, dimension)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, quietZone, quietZone, qrSize, qrSize)
      URL.revokeObjectURL(url)

      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      link.download = `qr-code-${timestamp}.png`
      link.href = pngUrl
      link.click()
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [])

  return { setContainerRef, download }
}
