import React, { useState, useRef } from 'react'
import { useTodo } from '@focal/logic'
import styles from './TodoList.module.scss'

interface TodoListProps {
  moduleId: string
}

export function TodoList({ moduleId }: TodoListProps) {
  const { todos, addTodo, toggleTodo, removeTodo, clearCompleted, addSubtask, toggleSubtask, removeSubtask } =
    useTodo(moduleId)
  const [draft, setDraft] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<number, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (draft.trim()) {
      addTodo(draft)
      setDraft('')
      inputRef.current?.focus()
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAddSubtask = (todoId: number) => {
    const text = subtaskDrafts[todoId] ?? ''
    if (!text.trim()) return
    addSubtask(todoId, text)
    setSubtaskDrafts((prev) => ({ ...prev, [todoId]: '' }))
  }

  const completedCount = todos.filter((t) => t.done).length

  return (
    <div className={styles.root}>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task…"
          aria-label="New task"
        />
        <button className={styles.addBtn} onClick={handleAdd} aria-label="Add task">
          +
        </button>
      </div>

      <ul className={styles.list}>
        {todos.map((todo) => {
          const id = todo.id as number
          const expanded = expandedIds.has(id)
          const subtasks = todo.subtasks ?? []
          const subtaskDraft = subtaskDrafts[id] ?? ''
          const doneSubtasks = subtasks.filter((s) => s.done).length

          return (
            <li key={id} className={styles.itemGroup}>
              {/* Parent row */}
              <div className={`${styles.item} ${todo.done ? styles.itemDone : ''}`}>
                <button
                  className={styles.checkbox}
                  onClick={() => toggleTodo(id)}
                  aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.done && <span className={styles.checkmark}>✓</span>}
                </button>
                <span className={styles.text}>{todo.text}</span>
                <button
                  className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ''}`}
                  onClick={() => toggleExpand(id)}
                  aria-expanded={expanded}
                  aria-label={expanded ? 'Hide subtasks' : 'Show subtasks'}
                >
                  {subtasks.length > 0
                    ? `${doneSubtasks}/${subtasks.length}`
                    : '⊕'}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeTodo(id)}
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </div>

              {/* Subtask panel */}
              {expanded && (
                <ul className={styles.subtaskList} aria-label={`Subtasks for ${todo.text}`}>
                  {subtasks.map((sub) => (
                    <li
                      key={sub.id}
                      className={`${styles.subtaskItem} ${sub.done ? styles.subtaskDone : ''}`}
                    >
                      <button
                        className={styles.subtaskCheckbox}
                        onClick={() => toggleSubtask(id, sub.id)}
                        aria-label={sub.done ? 'Mark subtask incomplete' : 'Mark subtask complete'}
                      >
                        {sub.done && <span className={styles.checkmark}>✓</span>}
                      </button>
                      <span className={styles.subtaskText}>{sub.text}</span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeSubtask(id, sub.id)}
                        aria-label="Delete subtask"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                  <li className={styles.subtaskInputRow}>
                    <input
                      className={styles.subtaskInput}
                      value={subtaskDraft}
                      onChange={(e) =>
                        setSubtaskDrafts((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(id)}
                      placeholder="Add subtask…"
                      aria-label={`Add subtask to ${todo.text}`}
                    />
                    <button
                      className={styles.subtaskAddBtn}
                      onClick={() => handleAddSubtask(id)}
                      aria-label="Add subtask"
                    >
                      +
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {completedCount > 0 && (
        <div className={styles.footer}>
          <button className={styles.clearBtn} onClick={clearCompleted}>
            Clear {completedCount} completed
          </button>
        </div>
      )}
    </div>
  )
}
