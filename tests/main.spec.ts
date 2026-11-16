import { afterEach, describe, expect, it, vi } from 'vitest'

describe('main.ts bootstrap', () => {
  afterEach(() => {
    vi.resetModules()
    document.body.innerHTML = ''
  })

  it('creates the Vue app, installs Pinia, and mounts #app', async () => {
    const root = document.createElement('div')
    root.id = 'app'
    document.body.appendChild(root)

    await import('@/main')

    expect(root.innerHTML).toContain('Todo List')
  })
})
