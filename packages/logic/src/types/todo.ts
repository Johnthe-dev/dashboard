export interface SubTask {
  id: number
  text: string
  done: boolean
}

export interface TodoItem {
  id?: number
  moduleId: string
  text: string
  done: boolean
  createdAt: number
  subtasks?: SubTask[]
}
