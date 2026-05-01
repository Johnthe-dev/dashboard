import { useRef, useEffect } from 'react'
import type { ThemeId } from '@focal/logic'
import styles from './LavaLamp.module.scss'

interface LavaLampProps {
  themeId: ThemeId
}

interface Blob {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

function createBlobs(w: number, h: number, count: number): Blob[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: 40 + Math.random() * 60,
  }))
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').padStart(6, '0')
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export function LavaLamp({ themeId }: LavaLampProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blobsRef = useRef<Blob[]>([])
  const rafRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
        } else {
          stopAnimation()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(container)

    return () => {
      observer.disconnect()
      stopAnimation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId])

  function stopAnimation() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function startAnimation() {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const w = container.clientWidth
    const h = container.clientHeight
    canvas.width = w
    canvas.height = h

    if (blobsRef.current.length === 0) {
      blobsRef.current = createBlobs(w, h, 7)
    }

    const ctxOrNull = canvas.getContext('2d')
    if (!ctxOrNull) return
    const ctx: CanvasRenderingContext2D = ctxOrNull

    const computedStyle = getComputedStyle(container)
    const bgColor = computedStyle.getPropertyValue('--module-bg').trim() || '#fff9c4'
    const accentColor = computedStyle.getPropertyValue('--module-accent').trim() || '#f57f17'

    const [br, bg, bb] = hexToRgb(bgColor)
    const [ar, ag, ab] = hexToRgb(accentColor)

    const imageData = ctx.createImageData(w, h)
    const data = imageData.data

    function draw() {
      const blobs = blobsRef.current

      blobs.forEach((blob) => {
        blob.x += blob.vx
        blob.y += blob.vy
        if (blob.x < 0 || blob.x > w) blob.vx *= -1
        if (blob.y < 0 || blob.y > h) blob.vy *= -1
      })

      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          let field = 0
          for (const blob of blobs) {
            const dx = px - blob.x
            const dy = py - blob.y
            field += (blob.r * blob.r) / (dx * dx + dy * dy + 1)
          }
          const t = Math.min(1, Math.max(0, (field - 0.8) / 0.4))
          const idx = (py * w + px) * 4
          data[idx] = br + (ar - br) * t
          data[idx + 1] = bg + (ag - bg) * t
          data[idx + 2] = bb + (ab - bb) * t
          data[idx + 3] = 255
        }
      }

      ctx.putImageData(imageData, 0, 0)
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  return (
    <div ref={containerRef} className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
