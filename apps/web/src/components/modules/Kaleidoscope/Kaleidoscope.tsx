import { useRef, useEffect, useState, useCallback } from 'react'
import type { ThemeId } from '@focal/logic'
import styles from './Kaleidoscope.module.scss'

interface KaleidoscopeProps {
  themeId: ThemeId
}

const MIN_SCALE = 0.3
const MAX_SCALE = 3
const STEP = 0.12

function clampScale(v: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, v))
}

function drawSource(ctx: CanvasRenderingContext2D, t: number, size: number, scale: number) {
  const R = size * 0.48 * scale

  const N = 9
  for (let i = 0; i < N; i++) {
    const phase = (i / N) * Math.PI * 2
    const orbitR = R * (0.12 + 0.52 * (0.5 + 0.5 * Math.sin(t * 0.5 + phase)))
    const angle = phase + t * (0.14 + 0.07 * (i % 3))
    const dotR = size * (0.05 + 0.035 * Math.sin(t * 0.85 + phase * 1.7))
    const hue = (t * 38 + i * (360 / N)) % 360

    ctx.beginPath()
    ctx.arc(orbitR * Math.cos(angle), orbitR * Math.sin(angle), dotR, 0, Math.PI * 2)
    ctx.fillStyle = `hsl(${hue}, 90%, 62%)`
    ctx.globalAlpha = 0.78
    ctx.fill()
  }

  const M = 6
  for (let i = 0; i < M; i++) {
    const phase = (i / M) * Math.PI * 2 + 0.5
    const orbitR = R * (0.22 + 0.28 * Math.abs(Math.cos(t * 0.38 + phase)))
    const angle = phase - t * 0.22
    const hue = (t * 28 + 180 + i * (360 / M)) % 360

    ctx.beginPath()
    ctx.arc(orbitR * Math.cos(angle), orbitR * Math.sin(angle), size * 0.024, 0, Math.PI * 2)
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`
    ctx.globalAlpha = 0.9
    ctx.fill()
  }

  for (let i = 0; i < N; i++) {
    const phase1 = (i / N) * Math.PI * 2
    const r1 = R * (0.12 + 0.52 * (0.5 + 0.5 * Math.sin(t * 0.5 + phase1)))
    const a1 = phase1 + t * (0.14 + 0.07 * (i % 3))

    const j = (i + 3) % N
    const phase2 = (j / N) * Math.PI * 2
    const r2 = R * (0.12 + 0.52 * (0.5 + 0.5 * Math.sin(t * 0.5 + phase2)))
    const a2 = phase2 + t * (0.14 + 0.07 * (j % 3))

    ctx.beginPath()
    ctx.moveTo(r1 * Math.cos(a1), r1 * Math.sin(a1))
    ctx.lineTo(r2 * Math.cos(a2), r2 * Math.sin(a2))
    ctx.strokeStyle = `hsl(${(t * 32 + i * 40) % 360}, 85%, 68%)`
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.38
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

export function Kaleidoscope({ themeId }: KaleidoscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tRef = useRef(0)
  const [scale, setScale] = useState(1)
  const scaleRef = useRef(1)

  const updateScale = useCallback((next: number) => {
    const clamped = clampScale(next)
    scaleRef.current = clamped
    setScale(clamped)
  }, [])

  // Wheel zoom — must be non-passive to call preventDefault
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      updateScale(scaleRef.current - Math.sign(e.deltaY) * STEP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [updateScale])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startAnimation()
        else stopAnimation()
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

    const size = Math.min(container.clientWidth, container.clientHeight)
    canvas.width = size
    canvas.height = size

    const ctxOrNull = canvas.getContext('2d')
    if (!ctxOrNull) return
    const ctx: CanvasRenderingContext2D = ctxOrNull

    const bg = getComputedStyle(container).getPropertyValue('--module-bg').trim() || '#0f1724'

    const SEGMENTS = 12
    const sliceAngle = (Math.PI * 2) / SEGMENTS
    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.52

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function draw() {
      const t = tRef.current
      tRef.current += 0.006

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      for (let seg = 0; seg < SEGMENTS; seg++) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(seg * sliceAngle)

        if (seg % 2 === 1) {
          ctx.rotate(sliceAngle / 2)
          ctx.scale(1, -1)
          ctx.rotate(-sliceAngle / 2)
        }

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, 0, sliceAngle)
        ctx.closePath()
        ctx.clip()

        drawSource(ctx, t, size, scaleRef.current)

        ctx.restore()
      }

      if (!reducedMotion) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
  }

  const atMin = scale <= MIN_SCALE
  const atMax = scale >= MAX_SCALE

  return (
    <div ref={containerRef} className={styles.root}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Kaleidoscope animation"
      />
      <div className={styles.controls} role="group" aria-label="Zoom controls">
        <button
          className={styles.zoomBtn}
          onClick={() => updateScale(scaleRef.current - STEP)}
          disabled={atMin}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          className={styles.zoomBtn}
          onClick={() => updateScale(scaleRef.current + STEP)}
          disabled={atMax}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  )
}
