import { useState, useRef } from 'react'
import { useQuickLinks } from '@focal/logic'
import type { QuickLink } from '@focal/logic'
import styles from './QuickLinks.module.scss'

interface QuickLinksProps {
  moduleId: string
}

function ensureProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

interface EditState {
  id: number
  label: string
  url: string
}

export function QuickLinks({ moduleId }: QuickLinksProps) {
  const { links, addLink, removeLink, updateLink } = useQuickLinks(moduleId)
  const [draftLabel, setDraftLabel] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [edit, setEdit] = useState<EditState | null>(null)
  const labelRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const label = draftLabel.trim()
    const url = draftUrl.trim()
    if (!label || !url) return
    addLink(label, url)
    setDraftLabel('')
    setDraftUrl('')
    labelRef.current?.focus()
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const startEdit = (link: QuickLink) => {
    setEdit({ id: link.id, label: link.label, url: link.url })
  }

  const commitEdit = () => {
    if (!edit) return
    const label = edit.label.trim()
    const url = edit.url.trim()
    if (label && url) {
      updateLink(edit.id, label, ensureProtocol(url))
    }
    setEdit(null)
  }

  const cancelEdit = () => setEdit(null)

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list} aria-label="Quick links">
        {links.map((link) => (
          <li key={link.id} className={styles.item}>
            {edit?.id === link.id ? (
              <div className={styles.editForm} role="group" aria-label={`Edit ${link.label}`}>
                <input
                  className={styles.editInput}
                  value={edit.label}
                  onChange={(e) => setEdit({ ...edit!, label: e.target.value })}
                  onKeyDown={handleEditKeyDown}
                  aria-label="Link label"
                  autoFocus
                />
                <input
                  className={styles.editInput}
                  value={edit.url}
                  onChange={(e) => setEdit({ ...edit!, url: e.target.value })}
                  onKeyDown={handleEditKeyDown}
                  aria-label="Link URL"
                  type="url"
                />
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={commitEdit} aria-label="Save changes">
                    ✓
                  </button>
                  <button className={styles.cancelBtn} onClick={cancelEdit} aria-label="Cancel edit">
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.linkRow}>
                <a
                  className={styles.linkBtn}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.label} (opens in new tab)`}
                >
                  <span className={styles.linkIcon} aria-hidden="true">⎋</span>
                  <span className={styles.linkLabel}>{link.label}</span>
                  <span className={styles.linkHost} aria-hidden="true">
                    {(() => {
                      try { return new URL(link.url).hostname } catch { return '' }
                    })()}
                  </span>
                </a>
                <div className={styles.itemActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => startEdit(link)}
                    aria-label={`Edit ${link.label}`}
                  >
                    ✏
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeLink(link.id)}
                    aria-label={`Delete ${link.label}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add row */}
      <div className={styles.addSection}>
        <input
          ref={labelRef}
          className={styles.addInput}
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="Label"
          aria-label="New link label"
        />
        <input
          className={styles.addInput}
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="URL"
          aria-label="New link URL"
          type="url"
        />
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          aria-label="Add link"
          disabled={!draftLabel.trim() || !draftUrl.trim()}
        >
          +
        </button>
      </div>
    </div>
  )
}
