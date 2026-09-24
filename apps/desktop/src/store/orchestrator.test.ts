import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.stubGlobal('fetch', vi.fn())

import { orchestrate, checkOrchestratorHealth, setOrchestratorMode } from './orchestrator'

const mockFetch = global.fetch as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockFetch.mockReset()
})

describe('orchestrator', () => {
  it('checkOrchestratorHealth returns false for an unreachable URL', async () => {
    const ok = await checkOrchestratorHealth('http://127.0.0.1:1', 200)
    expect(ok).toBe(false)
  })

  it('orchestrate in fanout mode calls both endpoints', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => ({ message: { content: 'answer A' } }) })
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => ({ message: { content: 'answer B' } }) })

    const results = await orchestrate('test prompt')
    expect(results).toEqual(['answer A', 'answer B'])
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('orchestrate in debate mode calls primary then secondary', async () => {
    setOrchestratorMode('debate')
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => ({ message: { content: 'draft' } }) })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ message: { content: 'critique of draft' } })
    })

    const results = await orchestrate('test prompt')
    expect(results).toEqual(['draft', 'critique of draft'])
  })

  it('orchestrate propagates fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))
    await expect(orchestrate('test')).rejects.toThrow('network')
  })
})
