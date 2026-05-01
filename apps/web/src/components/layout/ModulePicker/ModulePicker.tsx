import { useEffect, useRef } from 'react'
import type { ModuleKind } from '@focal/logic'
import { MODULE_REGISTRY } from '@focal/logic'
import styles from './ModulePicker.module.scss'

interface ModulePickerProps {
  onSelect: (kind: ModuleKind) => void
  onClose: () => void
}

const MODULE_KINDS = Object.keys(MODULE_REGISTRY) as ModuleKind[]

export function ModulePicker({ onSelect, onClose }: ModulePickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div ref={ref} className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Add Module</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className={styles.grid}>
        {MODULE_KINDS.map((kind) => {
          const meta = MODULE_REGISTRY[kind]
          return (
            <button
              key={kind}
              className={styles.card}
              onClick={() => {
                onSelect(kind)
                onClose()
              }}
            >
              <span className={styles.cardLabel}>{meta.label}</span>
              <span className={styles.cardDesc}>{meta.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
