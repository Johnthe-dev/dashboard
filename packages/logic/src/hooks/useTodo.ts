import { useState, useEffect, useCallback } from 'react'
import type { TodoItem, SubTask } from '../types/todo'
import { usePersistence } from '../context/PersistenceContext'

export function useTodo(moduleId: string) {
  const { todo: repo } = usePersistence()
  const [todos, setTodos] = useState<TodoItem[]>([])

  useEffect(() => {
    repo.getTodosByModule(moduleId).then((items) =>
      setTodos(items.sort((a, b) => a.createdAt - b.createdAt)),
    )
  }, [moduleId, repo])

  const addTodo = useCallback(
    async (text: string) => {
      const item: TodoItem = { moduleId, text: text.trim(), done: false, createdAt: Date.now() }
      const id = await repo.putTodo(item)
      setTodos((prev) => [...prev, { ...item, id }])
    },
    [moduleId, repo],
  )

  const toggleTodo = useCallback(
    async (id: number) => {
      setTodos((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        const updated = next.find((t) => t.id === id)
        if (updated) repo.putTodo(updated)
        return next
      })
    },
    [repo],
  )

  const removeTodo = useCallback(
    async (id: number) => {
      await repo.deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    },
    [repo],
  )

  const clearCompleted = useCallback(async () => {
    const completed = todos.filter((t) => t.done)
    await Promise.all(completed.map((t) => repo.deleteTodo(t.id as number)))
    setTodos((prev) => prev.filter((t) => !t.done))
  }, [todos, repo])

  const addSubtask = useCallback(
    (todoId: number, text: string) => {
      const subtask: SubTask = { id: Date.now(), text: text.trim(), done: false }
      setTodos((prev) => {
        const next = prev.map((t) => {
          if (t.id !== todoId) return t
          const updated = { ...t, subtasks: [...(t.subtasks ?? []), subtask] }
          repo.putTodo(updated)
          return updated
        })
        return next
      })
    },
    [repo],
  )

  const toggleSubtask = useCallback(
    (todoId: number, subtaskId: number) => {
      setTodos((prev) => {
        const next = prev.map((t) => {
          if (t.id !== todoId) return t
          const updated = {
            ...t,
            subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
          }
          repo.putTodo(updated)
          return updated
        })
        return next
      })
    },
    [repo],
  )

  const removeSubtask = useCallback(
    (todoId: number, subtaskId: number) => {
      setTodos((prev) => {
        const next = prev.map((t) => {
          if (t.id !== todoId) return t
          const updated = { ...t, subtasks: t.subtasks?.filter((s) => s.id !== subtaskId) }
          repo.putTodo(updated)
          return updated
        })
        return next
      })
    },
    [repo],
  )

  return { todos, addTodo, toggleTodo, removeTodo, clearCompleted, addSubtask, toggleSubtask, removeSubtask }
}
