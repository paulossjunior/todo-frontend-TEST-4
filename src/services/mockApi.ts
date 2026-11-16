import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

const seed: Task[] = [
  {
    id: 1,
    title: 'Comprar pão',
    description: 'Padaria da esquina, pão francês',
    completed: false,
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
  },
  {
    id: 2,
    title: 'Terminar relatório do Q4',
    description: 'Enviar para a diretoria até sexta',
    completed: false,
    created_at: '2026-10-29T10:05:00Z',
    updated_at: '2026-10-29T10:05:00Z',
  },
  {
    id: 3,
    title: 'Correr 5km',
    description: null,
    completed: true,
    created_at: '2026-10-28T07:00:00Z',
    updated_at: '2026-10-29T08:00:00Z',
  },
  {
    id: 4,
    title: 'Pagar conta de luz',
    description: 'Vencimento dia 30',
    completed: true,
    created_at: '2026-10-27T09:00:00Z',
    updated_at: '2026-10-28T18:00:00Z',
  },
]

let tasks: Task[] = seed.map((t) => ({ ...t }))
let nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function nowIso(): string {
  return new Date().toISOString()
}

function findIndex(id: number): number {
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error(`Task ${id} not found`)
  return idx
}

export const mockApi = {
  list: () => delay(tasks.map((t) => ({ ...t }))),
  get: (id: number) => delay({ ...tasks[findIndex(id)] }),
  create: (payload: TaskCreateInput) => {
    const task: Task = {
      id: nextId++,
      title: payload.title,
      description: payload.description ?? null,
      completed: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    tasks = [task, ...tasks]
    return delay({ ...task })
  },
  update: (id: number, payload: TaskUpdateInput) => {
    const idx = findIndex(id)
    const current = tasks[idx]
    const updated: Task = {
      ...current,
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.completed !== undefined ? { completed: payload.completed } : {}),
      updated_at: nowIso(),
    }
    tasks = tasks.map((t, i) => (i === idx ? updated : t))
    return delay({ ...updated })
  },
  remove: (id: number) => {
    const idx = findIndex(id)
    tasks = tasks.filter((_, i) => i !== idx)
    return delay<void>(undefined)
  },
}
