import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProjectRecord } from '../types/project'
import { usePersistence } from '../context/PersistenceContext'

export function useProjectTracker(moduleId: string) {
  const { project: repo } = usePersistence()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [tick, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    repo.getProjectsByModule(moduleId).then(setProjects)
  }, [moduleId, repo])

  useEffect(() => {
    const anyRunning = projects.some((p) => p.runningFrom !== null)
    if (anyRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000)
    } else if (!anyRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [projects])

  const getElapsed = useCallback(
    (project: ProjectRecord): number => {
      void tick
      if (project.runningFrom === null) return project.elapsedMs
      return project.elapsedMs + (Date.now() - project.runningFrom)
    },
    [tick],
  )

  const addProject = useCallback(
    async (name: string) => {
      const record: ProjectRecord = { moduleId, name, elapsedMs: 0, runningFrom: null }
      const id = await repo.putProject(record)
      setProjects((prev) => [...prev, { ...record, id }])
    },
    [moduleId, repo],
  )

  const toggleProject = useCallback(
    async (id: number) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const updated =
            p.runningFrom === null
              ? { ...p, runningFrom: Date.now() }
              : { ...p, elapsedMs: p.elapsedMs + (Date.now() - p.runningFrom), runningFrom: null }
          repo.putProject(updated)
          return updated
        }),
      )
    },
    [repo],
  )

  const renameProject = useCallback(
    async (id: number, name: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const updated = { ...p, name }
          repo.putProject(updated)
          return updated
        }),
      )
    },
    [repo],
  )

  const removeProject = useCallback(
    async (id: number) => {
      await repo.deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    },
    [repo],
  )

  const totalElapsed = projects.reduce((sum, p) => sum + getElapsed(p), 0)

  return { projects, getElapsed, addProject, toggleProject, renameProject, removeProject, totalElapsed }
}
