import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '')

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const tasksApi = {
  list: () => request<Task[]>('/api/tasks'),
  get: (id: number) => request<Task>(`/api/tasks/${id}`),
  create: (payload: TaskCreateInput) =>
    request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: TaskUpdateInput) =>
    request<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
}
