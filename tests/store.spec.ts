import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Task } from '@/types/task'

const listMock = vi.fn()
const getMock = vi.fn()
const createMock = vi.fn()
const updateMock = vi.fn()
const removeMock = vi.fn()

vi.mock('@/services/tasksApi', () => ({
  tasksApi: {
    list: (...args: unknown[]) => listMock(...args),
    get: (...args: unknown[]) => getMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    remove: (...args: unknown[]) => removeMock(...args),
  },
}))

import { useTasksStore } from '@/stores/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Task',
    description: null,
    completed: false,
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
    ...overrides,
  }
}

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetchAll populates tasks and toggles loading', async () => {
    const seed = [makeTask({ id: 1, completed: false }), makeTask({ id: 2, completed: true })]
    listMock.mockResolvedValueOnce(seed)
    const store = useTasksStore()

    const promise = store.fetchAll()
    expect(store.loading).toBe(true)
    await promise

    expect(store.loading).toBe(false)
    expect(store.tasks).toEqual(seed)
    expect(store.error).toBeNull()
  })

  it('fetchAll captures error message from Error instances', async () => {
    listMock.mockRejectedValueOnce(new Error('boom'))
    const store = useTasksStore()
    await store.fetchAll()
    expect(store.error).toBe('boom')
    expect(store.loading).toBe(false)
    expect(store.tasks).toEqual([])
  })

  it('fetchAll captures fallback message for non-Error rejections', async () => {
    listMock.mockRejectedValueOnce('oops')
    const store = useTasksStore()
    await store.fetchAll()
    expect(store.error).toBe('Erro desconhecido')
  })

  it('createTask prepends new task and clears previous error', async () => {
    const created = makeTask({ id: 9, title: 'Nova' })
    createMock.mockResolvedValueOnce(created)
    const store = useTasksStore()
    store.tasks = [makeTask({ id: 1 })]
    store.error = 'old'

    const result = await store.createTask({ title: 'Nova' })

    expect(result).toEqual(created)
    expect(store.tasks[0]).toEqual(created)
    expect(store.tasks).toHaveLength(2)
    expect(store.error).toBeNull()
  })

  it('createTask records error and rethrows', async () => {
    createMock.mockRejectedValueOnce(new Error('bad'))
    const store = useTasksStore()
    await expect(store.createTask({ title: 'x' })).rejects.toThrow('bad')
    expect(store.error).toBe('bad')
  })

  it('updateTask replaces matching task', async () => {
    const original = makeTask({ id: 1, title: 'old' })
    const updated = makeTask({ id: 1, title: 'new' })
    updateMock.mockResolvedValueOnce(updated)
    const store = useTasksStore()
    store.tasks = [original, makeTask({ id: 2 })]

    const result = await store.updateTask(1, { title: 'new' })

    expect(result).toEqual(updated)
    expect(store.tasks[0]).toEqual(updated)
    expect(store.tasks[1].id).toBe(2)
  })

  it('updateTask records error and rethrows', async () => {
    updateMock.mockRejectedValueOnce(new Error('nope'))
    const store = useTasksStore()
    await expect(store.updateTask(1, { title: 'x' })).rejects.toThrow('nope')
    expect(store.error).toBe('nope')
  })

  it('toggleTask flips completed through updateTask', async () => {
    const task = makeTask({ id: 1, completed: false })
    updateMock.mockResolvedValueOnce({ ...task, completed: true })
    const store = useTasksStore()
    store.tasks = [task]

    await store.toggleTask(task)
    expect(updateMock).toHaveBeenCalledWith(1, { completed: true })
    expect(store.tasks[0].completed).toBe(true)
  })

  it('removeTask drops task from list on success', async () => {
    removeMock.mockResolvedValueOnce(undefined)
    const store = useTasksStore()
    store.tasks = [makeTask({ id: 1 }), makeTask({ id: 2 })]

    await store.removeTask(1)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].id).toBe(2)
  })

  it('removeTask records error and rethrows', async () => {
    removeMock.mockRejectedValueOnce(new Error('denied'))
    const store = useTasksStore()
    store.tasks = [makeTask({ id: 1 })]
    await expect(store.removeTask(1)).rejects.toThrow('denied')
    expect(store.error).toBe('denied')
    expect(store.tasks).toHaveLength(1)
  })

  it('pending and completed getters partition tasks', () => {
    const store = useTasksStore()
    store.tasks = [
      makeTask({ id: 1, completed: false }),
      makeTask({ id: 2, completed: true }),
      makeTask({ id: 3, completed: false }),
    ]
    expect(store.pending.map((t) => t.id)).toEqual([1, 3])
    expect(store.completed.map((t) => t.id)).toEqual([2])
  })
})
