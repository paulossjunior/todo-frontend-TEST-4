import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskItem from '@/components/TaskItem.vue'
import type { Task } from '@/types/task'

const sample: Task = {
  id: 1,
  title: 'Comprar pão',
  description: 'Padaria da esquina',
  completed: false,
  created_at: '2026-10-29T10:00:00Z',
  updated_at: '2026-10-29T10:00:00Z',
}

describe('TaskItem', () => {
  it('renders title and description', () => {
    const wrapper = mount(TaskItem, { props: { task: sample } })
    expect(wrapper.text()).toContain('Comprar pão')
    expect(wrapper.text()).toContain('Padaria da esquina')
    expect(wrapper.classes()).not.toContain('is-completed')
  })

  it('shows completed state', () => {
    const wrapper = mount(TaskItem, {
      props: { task: { ...sample, completed: true } },
    })
    expect(wrapper.classes()).toContain('is-completed')
  })

  it('emits toggle on checkbox change', async () => {
    const wrapper = mount(TaskItem, { props: { task: sample } })
    await wrapper.get('input[type="checkbox"]').trigger('change')
    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('toggle')?.[0]?.[0]).toEqual(sample)
  })

  it('emits remove when remove button clicked', async () => {
    const wrapper = mount(TaskItem, { props: { task: sample } })
    const buttons = wrapper.findAll('button')
    const removeBtn = buttons.find((b) => b.text() === 'Remover')
    await removeBtn?.trigger('click')
    expect(wrapper.emitted('remove')?.[0]?.[0]).toEqual(sample)
  })

  it('emits edit when edit button clicked', async () => {
    const wrapper = mount(TaskItem, { props: { task: sample } })
    const buttons = wrapper.findAll('button')
    const editBtn = buttons.find((b) => b.text() === 'Editar')
    await editBtn?.trigger('click')
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(sample)
  })
})
