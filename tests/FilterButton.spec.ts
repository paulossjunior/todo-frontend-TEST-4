import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterButton from '@/components/FilterButton.vue'

describe('FilterButton', () => {
  it('renders with the provided label and inactive state by default', () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'Filtro X', modelValue: false },
    })
    const btn = wrapper.get('button')
    expect(btn.text()).toBe('Filtro X')
    expect(btn.attributes('type')).toBe('button')
    expect(btn.attributes('aria-pressed')).toBe('false')
    expect(btn.classes()).not.toContain('filter-button--active')
  })

  it('reflects active modelValue through aria-pressed and modifier class', () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'Filtro X', modelValue: true },
    })
    const btn = wrapper.get('button')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(btn.classes()).toContain('filter-button--active')
  })

  it('emits update:modelValue=true when clicked from inactive state', async () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'Filtro X', modelValue: false },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('emits update:modelValue=false when clicked from active state', async () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'Filtro X', modelValue: true },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('updates visual + aria state when parent toggles modelValue (v-model round trip)', async () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'Filtro X', modelValue: false },
    })
    await wrapper.setProps({ modelValue: true })
    const btn = wrapper.get('button')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(btn.classes()).toContain('filter-button--active')
  })
})
