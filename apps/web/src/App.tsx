import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useGrid, THEMES, useExportImport } from '@focal/logic'
import type { ModuleKind, ThemeId, PositionUpdate } from '@focal/logic'
import { Dashboard } from './components/layout/Dashboard/Dashboard'
import { ModulePicker } from './components/layout/ModulePicker/ModulePicker'
import { Walkthrough } from './components/layout/Walkthrough/Walkthrough'
import styles from './App.module.scss'

export default function App() {
  const { items, loaded, updateLayouts, addModule, removeModule, setModuleTheme, setAllThemes } = useGrid()
  const { exportJson, importJson } = useExportImport()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [largeText, setLargeText] = useState(() => localStorage.getItem('focal-large-text') === 'true')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('focal-dark-mode') === 'true')
  const themePanelRef = useRef<HTMLDivElement>(null)
  const themeBtnRef = useRef<HTMLButtonElement>(null)
  const settingsPanelRef = useRef<HTMLDivElement>(null)
  const settingsBtnRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (!themePickerOpen) return
    const handler = (e: MouseEvent) => {
      if (
        !themePanelRef.current?.contains(e.target as Node) &&
        !themeBtnRef.current?.contains(e.target as Node)
      ) {
        setThemePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [themePickerOpen])

  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e: MouseEvent) => {
      if (
        !settingsPanelRef.current?.contains(e.target as Node) &&
        !settingsBtnRef.current?.contains(e.target as Node)
      ) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      await importJson(file)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed')
    }
  }

  const toggleLargeText = () => {
    setLargeText((v) => {
      const next = !v
      localStorage.setItem('focal-large-text', String(next))
      return next
    })
  }

  const toggleDarkMode = () => {
    setDarkMode((v) => {
      const next = !v
      localStorage.setItem('focal-dark-mode', String(next))
      return next
    })
  }

  if (!loaded) return null

  return (
    <div className={`${styles.app}${largeText ? ' large-text' : ''}`}>
      <header className={styles.wordmark}>
        <span>Focal</span>
        <Link to="/utilities" className={styles.devToolsLink}>Dev Tools</Link>
      </header>

      <Dashboard
        items={items}
        onLayoutChange={(positions: PositionUpdate[]) => updateLayouts(positions)}
        onRemove={(id: string) => removeModule(id)}
        onThemeChange={(id: string, themeId: ThemeId) => setModuleTheme(id, themeId)}
      />

      {pickerOpen && (
        <ModulePicker
          onSelect={(kind: ModuleKind) => addModule(kind)}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <Walkthrough />

      {themePickerOpen && (
        <div
          ref={themePanelRef}
          className={styles.globalThemePanel}
          role="dialog"
          aria-label="Set theme for all modules"
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={styles.globalThemeDot}
              style={{ background: `linear-gradient(135deg, ${theme.swatch} 50%, ${theme.colors.text} 50%)` }}
              aria-label={theme.label}
              onClick={() => {
                setAllThemes(theme.id)
                setThemePickerOpen(false)
              }}
            />
          ))}
        </div>
      )}

      {settingsOpen && (
        <div
          ref={settingsPanelRef}
          className={styles.settingsPanel}
          role="dialog"
          aria-label="Export and import data"
        >
          <button
            className={styles.settingsBtn}
            onClick={async () => {
              setSettingsOpen(false)
              await exportJson()
            }}
            aria-label="Export all data as JSON"
          >
            ↓ Export
          </button>
          <button
            className={styles.settingsBtn}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import data from JSON file"
          >
            ↑ Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className={styles.fileInputHidden}
            onChange={handleImportFile}
            aria-label="Choose JSON backup file"
          />
        </div>
      )}

      <div className={styles.fabGroup}>
        <button
          ref={settingsBtnRef}
          className={`${styles.fabSecondary}${settingsOpen ? ` ${styles.fabSecondaryActive}` : ''}`}
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label={settingsOpen ? 'Close settings' : 'Open export / import settings'}
          aria-expanded={settingsOpen}
        >
          ⋯
        </button>
        <button
          ref={themeBtnRef}
          className={`${styles.fabSecondary}${themePickerOpen ? ` ${styles.fabSecondaryActive}` : ''}`}
          onClick={() => setThemePickerOpen((v) => !v)}
          aria-label={themePickerOpen ? 'Close theme picker' : 'Set theme for all modules'}
          aria-expanded={themePickerOpen}
        >
          <span className={styles.fabThemeSwatch} aria-hidden="true" />
        </button>
        <button
          className={`${styles.fabSecondary}${darkMode ? ` ${styles.fabSecondaryActive}` : ''}`}
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Disable dark mode' : 'Enable dark mode'}
          aria-pressed={darkMode}
        >
          ◑
        </button>
        <button
          className={`${styles.fabSecondary}${largeText ? ` ${styles.fabSecondaryActive}` : ''}`}
          onClick={toggleLargeText}
          aria-label={largeText ? 'Disable large text' : 'Enable large text'}
          aria-pressed={largeText}
        >
          Aa
        </button>
        <button
          className={styles.fab}
          onClick={() => setPickerOpen((v) => !v)}
          aria-label="Add module"
          aria-expanded={pickerOpen}
        >
          {pickerOpen ? '✕' : '+'}
        </button>
      </div>
    </div>
  )
}
