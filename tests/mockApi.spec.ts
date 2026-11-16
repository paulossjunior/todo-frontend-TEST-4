import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockApi: typeof import('@/services/mockApi').mockApi

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('@/services/mockApi')
  mockApi = mod.mockApi
})

describe('mockApi', () => {
  it('seeds 4 tasks on first list', async () => {
    const tasks = await mockApi.list()
    expect(tasks).toHaveLength(4)
    expect(tasks.map((t) => t.id)).toEqual([1, 2, 3, 4])
    expect(tasks.filter((t) => t.completed)).toHaveLength(2)
  })

  it('list returns a new array of copies (no aliasing)', async () => {
    const a = await mockApi.list()
    const b = await mockApi.list()
    expect(a).not.toBe(b)
    expect(a[0]).not.toBe(b[0])
    a[0].title = 'mutated'
    const c = await mockApi.list()
    expect(c[0].title).not.toBe('mutated')
  })

  it('get returns the matching task copy', async () => {
    const task = await mockApi.get(1)
    expect(task.id).toBe(1)
    expect(task.title).toBe('Comprar pão')
  })

  it('get throws synchronously for unknown id', () => {
    expect(() => mockApi.get(999)).toThrow('Task 999 not found')
  })

  it('create prepends new task with incremented id and defaults', async () => {
    const created = await mockApi.create({ title: 'Nova' })
    expect(created.id).toBe(5)
    expect(created.title).toBe('Nova')
    expect(created.description).toBeNull()
    expect(created.completed).toBe(false)
    const list = await mockApi.list()
    expect(list[0].id).toBe(5)
  })

  it('create preserves description when provided', async () => {
    const created = await mockApi.create({ title: 'X', description: 'desc' })
    expect(created.description).toBe('desc')
  })

  it('update applies partial changes and bumps updated_at', async () => {
    const before = await mockApi.get(1)
    await new Promise((r) => setTimeout(r, 2))
    const updated = await mockApi.update(1, { title: 'novo' })
    expect(updated.title).toBe('novo')
    expect(updated.description).toBe(before.description)
    expect(updated.completed).toBe(before.completed)
    expect(updated.updated_at >= before.updated_at).toBe(true)
  })

  it('update can clear description with explicit null', async () => {
    const updated = await mockApi.update(1, { description: null })
    expect(updated.description).toBeNull()
  })

  it('update can flip completed independently', async () => {
    const updated = await mockApi.update(1, { completed: true })
    expect(updated.completed).toBe(true)
    expect(updated.title).toBe('Comprar pão')
  })

  it('update throws synchronously for unknown id', () => {
    expect(() => mockApi.update(999, { title: 'x' })).toThrow('Task 999 not found')
  })

  it('remove deletes a task', async () => {
    await mockApi.remove(1)
    const list = await mockApi.list()
    expect(list.map((t) => t.id)).not.toContain(1)
    expect(list).toHaveLength(3)
  })

  it('remove throws synchronously for unknown id', () => {
    expect(() => mockApi.remove(999)).toThrow('Task 999 not found')
  })
})
