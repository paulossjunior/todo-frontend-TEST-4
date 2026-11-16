import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '@/components/TaskForm.vue'
import type { Task } from '@/types/task'

const editingTask: Task = {
  id: 10,
  title: 'Antigo título',
  description: 'Antiga descrição',
  completed: false,
  created_at: '2026-10-29T10:00:00Z',
  updated_at: '2026-10-29T10:00:00Z',
}

describe('TaskForm', () => {
  it('shows "Nova tarefa" header and "Adicionar" button when not editing', () => {
    const wrapper = mount(TaskForm)
    expect(wrapper.text()).toContain('Nova tarefa')
    const submit = wrapper.get('button[type="submit"]')
    expect(submit.text()).toBe('Adicionar')
    expect(wrapper.find('.btn--ghost').exists()).toBe(false)
  })

  it('shows "Editar tarefa" header and prefills fields when editing', async () => {
    const wrapper = mount(TaskForm, { props: { editing: editingTask } })
    expect(wrapper.text()).toContain('Editar tarefa')
    const title = wrapper.get<HTMLInputElement>('input[type="text"]')
    const desc = wrapper.get<HTMLTextAreaElement>('textarea')
    expect(title.element.value).toBe('Antigo título')
    expect(desc.element.value).toBe('Antiga descrição')
    expect(wrapper.find('.btn--ghost').exists()).toBe(true)
  })

  it('disables submit when title is empty or whitespace', async () => {
    const wrapper = mount(TaskForm)
    const btn = wrapper.get<HTMLButtonElement>('button[type="submit"]')
    expect(btn.element.disabled).toBe(true)

    await wrapper.get('input[type="text"]').setValue('   ')
    expect(btn.element.disabled).toBe(true)

    await wrapper.get('input[type="text"]').setValue('Nova tarefa')
    expect(btn.element.disabled).toBe(false)
  })

  it('disables buttons while submitting', async () => {
    const wrapper = mount(TaskForm, { props: { editing: editingTask, submitting: true } })
    const submit = wrapper.get<HTMLButtonElement>('button[type="submit"]')
    const cancel = wrapper.get<HTMLButtonElement>('button.btn--ghost')
    expect(submit.element.disabled).toBe(true)
    expect(cancel.element.disabled).toBe(true)
  })

  it('emits submit with trimmed title and description, then clears when creating', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('input[type="text"]').setValue('  Title  ')
    await wrapper.get('textarea').setValue('  Desc  ')
    await wrapper.get('form').trigger('submit.prevent')

    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toEqual({ title: 'Title', description: 'Desc' })
    expect(wrapper.get<HTMLInputElement>('input[type="text"]').element.value).toBe('')
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('')
  })

  it('emits submit with description=null when textarea blank', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('input[type="text"]').setValue('Only title')
    await wrapper.get('form').trigger('submit.prevent')
    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toEqual({ title: 'Only title', description: null })
  })

  it('does not emit submit when title is empty', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('keeps fields intact after submit when editing', async () => {
    const wrapper = mount(TaskForm, { props: { editing: editingTask } })
    await wrapper.get('input[type="text"]').setValue('Novo título')
    await wrapper.get('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      title: 'Novo título',
      description: 'Antiga descrição',
    })
    expect(wrapper.get<HTMLInputElement>('input[type="text"]').element.value).toBe('Novo título')
  })

  it('emits cancel when cancel button clicked', async () => {
    const wrapper = mount(TaskForm, { props: { editing: editingTask } })
    await wrapper.get('button.btn--ghost').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('updates fields when editing prop changes', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.setProps({ editing: editingTask })
    expect(wrapper.get<HTMLInputElement>('input[type="text"]').element.value).toBe('Antigo título')

    await wrapper.setProps({ editing: null })
    expect(wrapper.get<HTMLInputElement>('input[type="text"]').element.value).toBe('')
  })
})
