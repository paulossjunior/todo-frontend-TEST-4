import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import type { Task } from '@/types/task'

const listMock = vi.fn()
const createMock = vi.fn()
const updateMock = vi.fn()
const removeMock = vi.fn()

vi.mock('@/services/tasksApi', () => ({
  tasksApi: {
    list: (...args: unknown[]) => listMock(...args),
    get: vi.fn(),
    create: (...args: unknown[]) => createMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    remove: (...args: unknown[]) => removeMock(...args),
  },
}))

import App from '@/App.vue'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Comprar pão',
    description: 'Padaria',
    completed: false,
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
    ...overrides,
  }
}

async function mountApp() {
  const wrapper = mount(App, { global: { plugins: [createPinia()] } })
  await flushPromises()
  return wrapper
}

describe('App (integration)', () => {
  beforeEach(() => {
    listMock.mockReset()
    createMock.mockReset()
    updateMock.mockReset()
    removeMock.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders pending and completed sections and dispatches fetchAll on mount', async () => {
    listMock.mockResolvedValueOnce([
      makeTask({ id: 1, title: 'Pendente', completed: false }),
      makeTask({ id: 2, title: 'Feita', completed: true }),
    ])
    const wrapper = await mountApp()

    expect(listMock).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Pendentes (1)')
    expect(wrapper.text()).toContain('Concluídas (1)')
    expect(wrapper.text()).toContain('Pendente')
    expect(wrapper.text()).toContain('Feita')
  })

  it('creates a new task via the form, prepending it to pending', async () => {
    listMock.mockResolvedValueOnce([])
    const created = makeTask({ id: 10, title: 'Nova', description: 'desc' })
    createMock.mockResolvedValueOnce(created)

    const wrapper = await mountApp()

    await wrapper.get('input[type="text"]').setValue('Nova')
    await wrapper.get('textarea').setValue('desc')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(createMock).toHaveBeenCalledWith({ title: 'Nova', description: 'desc' })
    expect(wrapper.text()).toContain('Nova')
    expect(wrapper.text()).toContain('Pendentes (1)')
  })

  it('toggles a task to completed moving it between sections', async () => {
    const task = makeTask({ id: 1, completed: false })
    listMock.mockResolvedValueOnce([task])
    updateMock.mockResolvedValueOnce({ ...task, completed: true })

    const wrapper = await mountApp()
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(updateMock).toHaveBeenCalledWith(1, { completed: true })
    expect(wrapper.text()).toContain('Pendentes (0)')
    expect(wrapper.text()).toContain('Concluídas (1)')
  })

  it('removes a task from the list', async () => {
    const task = makeTask({ id: 1 })
    listMock.mockResolvedValueOnce([task])
    removeMock.mockResolvedValueOnce(undefined)

    const wrapper = await mountApp()
    const removeBtn = wrapper.findAll('button').find((b) => b.text() === 'Remover')
    await removeBtn?.trigger('click')
    await flushPromises()

    expect(removeMock).toHaveBeenCalledWith(1)
    expect(wrapper.text()).toContain('Pendentes (0)')
    expect(wrapper.text()).not.toContain('Comprar pão')
  })

  it('enters edit mode, saves changes, and exits edit mode', async () => {
    const task = makeTask({ id: 1, title: 'Antigo', description: 'Desc' })
    listMock.mockResolvedValueOnce([task])
    updateMock.mockResolvedValueOnce({ ...task, title: 'Editado' })

    const wrapper = await mountApp()
    const editBtn = wrapper.findAll('button').find((b) => b.text() === 'Editar')
    await editBtn?.trigger('click')
    expect(wrapper.text()).toContain('Editar tarefa')

    await wrapper.get('input[type="text"]').setValue('Editado')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(updateMock).toHaveBeenCalledWith(1, { title: 'Editado', description: 'Desc' })
    expect(wrapper.text()).toContain('Nova tarefa')
    expect(wrapper.text()).toContain('Editado')
  })

  it('cancels edit mode and returns to create mode', async () => {
    const task = makeTask({ id: 1 })
    listMock.mockResolvedValueOnce([task])
    const wrapper = await mountApp()

    await wrapper.findAll('button').find((b) => b.text() === 'Editar')?.trigger('click')
    expect(wrapper.text()).toContain('Editar tarefa')
    await wrapper.get('button.btn--ghost').trigger('click')
    expect(wrapper.text()).toContain('Nova tarefa')
  })

  it('shows error banner when fetch fails', async () => {
    listMock.mockRejectedValueOnce(new Error('offline'))
    const wrapper = await mountApp()
    expect(wrapper.get('[role="alert"]').text()).toBe('offline')
  })

  it('toggles Filtro X to hide the Concluídas section and show it again', async () => {
    listMock.mockResolvedValueOnce([
      makeTask({ id: 1, title: 'Pendente', completed: false }),
      makeTask({ id: 2, title: 'Feita', completed: true }),
    ])
    const wrapper = await mountApp()

    const filterBtn = wrapper.findAll('button').find((b) => b.text() === 'Filtro X')
    expect(filterBtn).toBeDefined()
    expect(filterBtn!.attributes('aria-pressed')).toBe('false')
    expect(wrapper.text()).toContain('Concluídas (1)')
    expect(wrapper.text()).toContain('Feita')

    await filterBtn!.trigger('click')
    expect(filterBtn!.attributes('aria-pressed')).toBe('true')
    expect(filterBtn!.classes()).toContain('filter-button--active')
    expect(wrapper.text()).not.toContain('Concluídas (1)')
    expect(wrapper.text()).not.toContain('Feita')
    expect(wrapper.text()).toContain('Pendentes (1)')
    expect(wrapper.text()).toContain('Pendente')

    await filterBtn!.trigger('click')
    expect(filterBtn!.attributes('aria-pressed')).toBe('false')
    expect(wrapper.text()).toContain('Concluídas (1)')
    expect(wrapper.text()).toContain('Feita')
  })

  it('shows loading indicator while fetch is in-flight', async () => {
    let resolve!: (v: Task[]) => void
    listMock.mockReturnValueOnce(new Promise<Task[]>((r) => (resolve = r)))
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Carregando…')
    resolve([])
    await flushPromises()
    expect(wrapper.text()).not.toContain('Carregando…')
  })
})
