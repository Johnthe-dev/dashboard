import { useRef, useEffect, useState } from 'react'
import type { ThemeId } from '@focal/logic'
import { THEME_COLORS } from '@focal/logic'
import styles from './WaveBox.module.scss'

interface WaveBoxProps {
  themeId: ThemeId
}

type WaveMode = 'peaceful' | 'crashing'

interface WaveLayer {
  amplitude: number  // fraction of canvas height
  freq: number       // spatial frequency (rad / px)
  speed: number      // time speed (rad / frame)
  phaseOff: number   // initial phase (rad)
  opacity: number
  useAccent: boolean // true = accent color, false = border color
}

const PEACEFUL: WaveLayer[] = [
  { amplitude: 0.09, freq: 0.016, speed: 0.006, phaseOff: 0.0, opacity: 0.78, useAccent: true },
  { amplitude: 0.07, freq: 0.022, speed: 0.004, phaseOff: 2.3, opacity: 0.58, useAccent: false },
  { amplitude: 0.05, freq: 0.013, speed: 0.003, phaseOff: 4.7, opacity: 0.38, useAccent: true },
]

const CRASHING: WaveLayer[] = [
  { amplitude: 0.24, freq: 0.014, speed: 0.024, phaseOff: 0.0, opacity: 0.85, useAccent: true },
  { amplitude: 0.17, freq: 0.021, speed: 0.016, phaseOff: 1.9, opacity: 0.65, useAccent: false },
  { amplitude: 0.11, freq: 0.030, speed: 0.011, phaseOff: 3.8, opacity: 0.45, useAccent: true },
]

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.trim().replace('#', ''), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

// y offset from the water baseline for a given x and time
function waveOffset(x: number, t: number, layer: WaveLayer, h: number, crashing: boolean): number {
  const primary = Math.sin(x * layer.freq + t * layer.speed + layer.phaseOff) * (h * layer.amplitude)
  if (!crashing) return primary
  // Second harmonic sharpens the crests for a surf-like shape
  const harmonic = Math.sin(x * layer.freq * 2.1 + t * layer.speed * 1.4 + layer.phaseOff + 0.5)
    * (h * layer.amplitude * 0.35)
  return primary + harmonic
}

export function WaveBox({ themeId }: WaveBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const tRef = useRef(0)
  const modeRef = useRef<WaveMode>('peaceful')
  const [mode, setMode] = useState<WaveMode>('peaceful')

  const switchMode = (m: WaveMode) => {
    modeRef.current = m
    setMode(m)
  }

  function stopAnimation() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function startAnimation() {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = THEME_COLORS[themeId]
    const accentRgb = hexToRgb(colors.accent)
    const borderRgb = hexToRgb(colors.border)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width
      const h = canvas.height
      const t = tRef.current
      const crashing = modeRef.current === 'crashing'
      const layers = crashing ? CRASHING : PEACEFUL
      const waterY = h * 0.50

      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, w, h)

      // Draw waves back-to-front (first layer is deepest)
      layers.forEach((layer) => {
        const [r, g, b] = layer.useAccent ? accentRgb : borderRgb
        ctx.beginPath()
        ctx.moveTo(0, waterY + waveOffset(0, t, layer, h, crashing))
        for (let x = 1; x <= w; x++) {
          ctx.lineTo(x, waterY + waveOffset(x, t, layer, h, crashing))
        }
        ctx.lineTo(w, h)
        ctx.lineTo(0, h)
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},${layer.opacity})`
        ctx.fill()
      })

      // White foam flecks at wave crests in crashing mode
      if (crashing) {
        const fl = CRASHING[0]
        for (let x = 0; x <= w; x += 5) {
          const offset = waveOffset(x, t, fl, h, true)
          // Normalise to [-1, 1] against amplitude; crests are at -1
          const norm = offset / (h * fl.amplitude * 1.35)
          if (norm < -0.72) {
            const strength = (-norm - 0.72) / 0.28
            ctx.beginPath()
            ctx.arc(x, waterY + offset - 3, 1.5 + strength * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,255,${(strength * 0.72).toFixed(2)})`
            ctx.fill()
          }
        }
      }

      if (!reducedMotion) {
        tRef.current++
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
  }

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

  return (
    <div ref={containerRef} className={styles.root}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={mode === 'peaceful' ? 'Peaceful ripples animation' : 'Crashing waves animation'}
      />
      <div className={styles.controls} role="group" aria-label="Wave mode">
        <button
          className={`${styles.modeBtn}${mode === 'peaceful' ? ` ${styles.modeBtnActive}` : ''}`}
          onClick={() => switchMode('peaceful')}
          aria-pressed={mode === 'peaceful'}
        >
          Ripples
        </button>
        <button
          className={`${styles.modeBtn}${mode === 'crashing' ? ` ${styles.modeBtnActive}` : ''}`}
          onClick={() => switchMode('crashing')}
          aria-pressed={mode === 'crashing'}
        >
          Waves
        </button>
      </div>
    </div>
  )
}
