export interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskCreateInput {
  title: string
  description?: string | null
}

export interface TaskUpdateInput {
  title?: string
  description?: string | null
  completed?: boolean
}
