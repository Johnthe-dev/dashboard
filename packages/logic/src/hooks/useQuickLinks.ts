import { useState, useEffect, useCallback } from 'react'
import type { QuickLink, QuickLinkRecord } from '../types/quicklink'
import { usePersistence } from '../context/PersistenceContext'

const makeDefault = (moduleId: string): QuickLinkRecord => ({
  moduleId,
  links: [],
})

export function useQuickLinks(moduleId: string) {
  const { quickLinks: repo } = usePersistence()
  const [record, setRecord] = useState<QuickLinkRecord>(makeDefault(moduleId))

  useEffect(() => {
    repo.getLinks(moduleId).then((r) => {
      if (r) setRecord(r)
    })
  }, [moduleId, repo])

  const persist = useCallback(
    (next: QuickLinkRecord) => {
      setRecord(next)
      repo.putLinks(next)
    },
    [repo],
  )

  const addLink = useCallback(
    (label: string, url: string) => {
      const id = Date.now()
      const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
      const next: QuickLinkRecord = {
        ...record,
        links: [...record.links, { id, label, url: safeUrl }],
      }
      persist(next)
    },
    [record, persist],
  )

  const removeLink = useCallback(
    (id: number) => {
      persist({ ...record, links: record.links.filter((l) => l.id !== id) })
    },
    [record, persist],
  )

  const updateLink = useCallback(
    (id: number, label: string, url: string) => {
      const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
      const links: QuickLink[] = record.links.map((l) =>
        l.id === id ? { ...l, label, url: safeUrl } : l,
      )
      persist({ ...record, links })
    },
    [record, persist],
  )

  return {
    links: record.links,
    addLink,
    removeLink,
    updateLink,
  }
}
