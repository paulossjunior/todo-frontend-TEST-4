import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '@/components/TaskList.vue'
import TaskItem from '@/components/TaskItem.vue'
import type { Task } from '@/types/task'

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

describe('TaskList', () => {
  it('renders empty label when no tasks', () => {
    const wrapper = mount(TaskList, { props: { tasks: [], emptyLabel: 'Sem tarefas' } })
    expect(wrapper.text()).toContain('Sem tarefas')
    expect(wrapper.findAllComponents(TaskItem)).toHaveLength(0)
  })

  it('renders default empty label when none provided', () => {
    const wrapper = mount(TaskList, { props: { tasks: [] } })
    expect(wrapper.text()).toContain('Nenhuma tarefa.')
  })

  it('renders one TaskItem per task', () => {
    const tasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: 'B' }), makeTask({ id: 3, title: 'C' })]
    const wrapper = mount(TaskList, { props: { tasks } })
    expect(wrapper.findAllComponents(TaskItem)).toHaveLength(3)
    expect(wrapper.text()).toContain('B')
    expect(wrapper.text()).toContain('C')
  })

  it('bubbles toggle/remove/edit events from child items', async () => {
    const task = makeTask({ id: 42 })
    const wrapper = mount(TaskList, { props: { tasks: [task] } })
    const item = wrapper.getComponent(TaskItem)

    await item.vm.$emit('toggle', task)
    await item.vm.$emit('remove', task)
    await item.vm.$emit('edit', task)

    expect(wrapper.emitted('toggle')?.[0]?.[0]).toEqual(task)
    expect(wrapper.emitted('remove')?.[0]?.[0]).toEqual(task)
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(task)
  })
})
