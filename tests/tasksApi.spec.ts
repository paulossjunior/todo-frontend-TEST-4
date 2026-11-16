import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '@/types/task'

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

function textResponse(body: string, init: ResponseInit): Response {
  return new Response(body, { headers: { 'Content-Type': 'text/plain' }, ...init })
}

async function loadHttpApi() {
  vi.stubEnv('VITE_USE_MOCK', '')
  vi.resetModules()
  const mod = await import('@/services/tasksApi')
  return mod.tasksApi
}

const sampleTask: Task = {
  id: 1,
  title: 't',
  description: null,
  completed: false,
  created_at: '2026-10-29T10:00:00Z',
  updated_at: '2026-10-29T10:00:00Z',
}

describe('tasksApi (HTTP)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('list GETs /api/tasks and parses JSON', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([sampleTask]),
    )
    const api = await loadHttpApi()
    const tasks = await api.list()
    expect(tasks).toEqual([sampleTask])
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[0]).toBe('http://localhost:5000/api/tasks')
    expect((call[1] as RequestInit).headers).toMatchObject({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    })
  })

  it('get fetches a single task by id', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(sampleTask))
    const api = await loadHttpApi()
    await api.get(42)
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      'http://localhost:5000/api/tasks/42',
    )
  })

  it('create POSTs JSON body', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse(sampleTask, { status: 201 }),
    )
    const api = await loadHttpApi()
    await api.create({ title: 'novo' })
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect((init as RequestInit).method).toBe('POST')
    expect((init as RequestInit).body).toBe(JSON.stringify({ title: 'novo' }))
  })

  it('update PATCHes with serialized body', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(sampleTask))
    const api = await loadHttpApi()
    await api.update(7, { completed: true })
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('http://localhost:5000/api/tasks/7')
    expect((init as RequestInit).method).toBe('PATCH')
    expect((init as RequestInit).body).toBe(JSON.stringify({ completed: true }))
  })

  it('remove DELETEs and tolerates empty 204 body', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    )
    const api = await loadHttpApi()
    await expect(api.remove(1)).resolves.toBeUndefined()
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect((init as RequestInit).method).toBe('DELETE')
  })

  it('throws with status and body on non-ok response', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      textResponse('oops', { status: 500, statusText: 'Internal Server Error' }),
    )
    const api = await loadHttpApi()
    await expect(api.list()).rejects.toThrow(/HTTP 500 Internal Server Error: oops/)
  })

  it('throws with empty body when response.text() rejects', async () => {
    const brokenResponse = {
      ok: false,
      status: 418,
      statusText: "I'm a teapot",
      text: () => Promise.reject(new Error('body stream broken')),
      json: () => Promise.reject(new Error('n/a')),
    } as unknown as Response
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(brokenResponse)
    const api = await loadHttpApi()
    await expect(api.list()).rejects.toThrow(/HTTP 418 I'm a teapot: $/)
  })

  it('uses VITE_API_URL env override and strips trailing slash', async () => {
    vi.stubEnv('VITE_USE_MOCK', '')
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/')
    vi.resetModules()
    const mod = await import('@/services/tasksApi')
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    await mod.tasksApi.list()
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      'https://api.example.com/api/tasks',
    )
  })

  it('merges extra headers into request', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    const api = await loadHttpApi()
    await api.list()
    const headers = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].headers
    expect(headers).toMatchObject({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    })
  })
})

describe('tasksApi (mock mode)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('swaps to mockApi when VITE_USE_MOCK=true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    vi.resetModules()
    const [{ tasksApi }, { mockApi }] = await Promise.all([
      import('@/services/tasksApi'),
      import('@/services/mockApi'),
    ])
    expect(tasksApi).toBe(mockApi)
  })
})
