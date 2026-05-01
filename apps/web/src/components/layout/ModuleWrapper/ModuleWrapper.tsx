import React from 'react'
import type { ThemeId } from '@focal/logic'
import { THEMES } from '@focal/logic'
import styles from './ModuleWrapper.module.scss'

interface ModuleWrapperProps {
  moduleId: string
  title: string
  themeId: ThemeId
  onThemeChange: (themeId: ThemeId) => void
  onRemove: () => void
  children: React.ReactNode
}

function splitSwatch(swatch: string, textColor: string) {
  return `linear-gradient(135deg, ${swatch} 50%, ${textColor} 50%)`
}

export function ModuleWrapper({
  title,
  themeId,
  onThemeChange,
  onRemove,
  children,
}: ModuleWrapperProps) {
  const [showThemes, setShowThemes] = React.useState(false)
  const activeTheme = THEMES.find((t) => t.id === themeId)

  return (
    <div className={`${styles.wrapper} theme-${themeId}`}>
      <div className={`${styles.header} dragHandle`}>
        <span className={styles.dragIndicator}>⠿</span>
        <span className={styles.title}>{title}</span>
        <div className={styles.headerActions}>
          <button
            className={styles.themeToggle}
            onClick={() => setShowThemes((v) => !v)}
            title="Change theme"
            aria-label="Change theme"
          >
            <span
              className={styles.activeSwatch}
              style={{ background: activeTheme ? splitSwatch(activeTheme.swatch, activeTheme.colors.text) : undefined }}
            />
          </button>
          <button
            className={styles.closeBtn}
            onClick={onRemove}
            title="Remove module"
            aria-label="Remove module"
          >
            ✕
          </button>
        </div>
      </div>

      {showThemes && (
        <div className={styles.themePicker}>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={`${styles.swatch} ${themeId === theme.id ? styles.swatchActive : ''}`}
              style={{ background: splitSwatch(theme.swatch, theme.colors.text) }}
              onClick={() => {
                onThemeChange(theme.id)
                setShowThemes(false)
              }}
              title={theme.label}
              aria-label={theme.label}
            />
          ))}
        </div>
      )}

      <div className={styles.body}>{children}</div>
    </div>
  )
}
