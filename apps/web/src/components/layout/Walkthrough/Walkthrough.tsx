import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import styles from './Walkthrough.module.scss'

interface Step {
  id: string
  title: string
  body: string
  target: string | null
  position: 'top' | 'bottom' | 'left' | 'right'
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Focal',
    body: 'A quick tour of the dashboard. Use Next to continue, or press Escape to skip at any time.',
    target: null,
    position: 'bottom',
  },
  {
    id: 'add-module',
    title: 'Add modules',
    body: 'Tap + to open the module picker. Choose from timers, to-do lists, notes, a kaleidoscope, and more.',
    target: '[aria-label="Add module"]',
    position: 'left',
  },
  {
    id: 'dark-mode',
    title: 'Dark mode',
    body: 'Toggle between a light parchment canvas and a dark background. Your preference is saved between sessions.',
    target: '[aria-label="Enable dark mode"],[aria-label="Disable dark mode"]',
    position: 'left',
  },
  {
    id: 'large-text',
    title: 'Large text',
    body: 'Increase text size across all modules — great for 4K monitors or when you need easier reading.',
    target: '[aria-label="Enable large text"],[aria-label="Disable large text"]',
    position: 'left',
  },
  {
    id: 'drag',
    title: 'Move & resize',
    body: 'Drag any module by its header to rearrange the layout. Grab the bottom-right corner to resize.',
    target: '.dragHandle',
    position: 'bottom',
  },
  {
    id: 'theme',
    title: 'Color themes',
    body: 'Each module has six color themes. Click the colored dot in the header to switch between them.',
    target: '[aria-label="Change theme"]',
    position: 'bottom',
  },
  {
    id: 'done',
    title: "You're all set!",
    body: 'Explore freely. Reopen this tour anytime with the ? button in the bottom-left corner.',
    target: null,
    position: 'bottom',
  },
]

const STORAGE_KEY = 'focal-tour-done'
const SPOTLIGHT_PAD = 8
const TOOLTIP_W = 280
const TOOLTIP_GAP = 16
const VIEWPORT_MARGIN = 12

interface SpotRect {
  top: number
  left: number
  width: number
  height: number
}

function computeSpotRect(el: Element): SpotRect {
  const r = el.getBoundingClientRect()
  return {
    top: r.top - SPOTLIGHT_PAD,
    left: r.left - SPOTLIGHT_PAD,
    width: r.width + SPOTLIGHT_PAD * 2,
    height: r.height + SPOTLIGHT_PAD * 2,
  }
}

function getTooltipStyle(spot: SpotRect | null, position: Step['position']): CSSProperties {
  if (!spot) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  const { top, left, width, height } = spot
  const cx = left + width / 2
  const M = VIEWPORT_MARGIN
  const vw = window.innerWidth

  switch (position) {
    case 'left': {
      const l = Math.max(M, left - TOOLTIP_GAP - TOOLTIP_W)
      return { top: top + height / 2, left: l, transform: 'translateY(-50%)' }
    }
    case 'right': {
      const l = Math.min(left + width + TOOLTIP_GAP, vw - TOOLTIP_W - M)
      return { top: top + height / 2, left: l, transform: 'translateY(-50%)' }
    }
    case 'top': {
      const l = Math.max(M, Math.min(cx - TOOLTIP_W / 2, vw - TOOLTIP_W - M))
      return { top: top - TOOLTIP_GAP, left: l, transform: 'translateY(-100%)' }
    }
    case 'bottom':
    default: {
      const l = Math.max(M, Math.min(cx - TOOLTIP_W / 2, vw - TOOLTIP_W - M))
      return { top: top + height + TOOLTIP_GAP, left: l }
    }
  }
}

export function Walkthrough() {
  const [active, setActive] = useState(() => localStorage.getItem(STORAGE_KEY) !== 'true')
  const [stepIndex, setStepIndex] = useState(0)
  const [spotRect, setSpotRect] = useState<SpotRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({})
  const primaryBtnRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  // Tracks which step has already been viewport-clamped to prevent effect loops
  const clampedStepRef = useRef(-1)

  const step = STEPS[stepIndex]

  const updateLayout = useCallback(() => {
    if (!active || !step) return
    if (step.target) {
      const el = document.querySelector(step.target)
      if (!el) {
        // target not in DOM — skip this step
        setStepIndex((i) => i + 1)
        return
      }
      const sr = computeSpotRect(el)
      setSpotRect(sr)
      setTooltipStyle(getTooltipStyle(sr, step.position))
    } else {
      setSpotRect(null)
      setTooltipStyle(getTooltipStyle(null, step.position))
    }
  }, [active, step])

  useEffect(() => {
    if (!active) return
    clampedStepRef.current = -1  // reset so the layout effect re-clamps for the new step
    updateLayout()
    const t = setTimeout(() => primaryBtnRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [active, stepIndex, updateLayout])

  useEffect(() => {
    if (!active) return
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [active, updateLayout])

  // After every render, check whether the card is clipped by the viewport and shift it into view.
  // clampedStepRef prevents re-running once we've already adjusted for the current step.
  useLayoutEffect(() => {
    if (!active || !cardRef.current || clampedStepRef.current === stepIndex) return
    const rect = cardRef.current.getBoundingClientRect()
    const M = VIEWPORT_MARGIN
    const vh = window.innerHeight
    if (rect.bottom > vh - M) {
      clampedStepRef.current = stepIndex
      const overflow = rect.bottom - (vh - M)
      setTooltipStyle((prev) => ({ ...prev, top: (prev.top as number) - overflow }))
    } else if (rect.top < M) {
      clampedStepRef.current = stepIndex
      const overflow = M - rect.top
      setTooltipStyle((prev) => ({ ...prev, top: (prev.top as number) + overflow }))
    }
  })

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setActive(false)
  }

  const next = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      finish()
    }
  }

  const prev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  if (!active) {
    return createPortal(
      <button
        className={styles.helpBtn}
        onClick={() => {
          setStepIndex(0)
          setActive(true)
        }}
        aria-label="Start tour"
      >
        ?
      </button>,
      document.body,
    )
  }

  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  return createPortal(
    <>
      <div className={styles.overlay} aria-hidden="true" />

      {spotRect && (
        <div
          className={styles.spotlight}
          style={{ top: spotRect.top, left: spotRect.left, width: spotRect.width, height: spotRect.height }}
          aria-hidden="true"
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className={styles.card}
        style={tooltipStyle}
      >
        <div className={styles.stepCount} aria-hidden="true">
          {stepIndex + 1} / {STEPS.length}
        </div>
        <h2 id="tour-title" className={styles.cardTitle}>
          {step.title}
        </h2>
        <p className={styles.cardBody}>{step.body}</p>
        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={finish}>
            Skip tour
          </button>
          <div className={styles.navBtns}>
            {!isFirst && (
              <button className={styles.prevBtn} onClick={prev}>
                Back
              </button>
            )}
            <button ref={primaryBtnRef} className={styles.nextBtn} onClick={next}>
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
