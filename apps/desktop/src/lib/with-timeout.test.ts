import { describe, expect, it, vi } from 'vitest'

import { withSuspendedTimeout, withTimeout } from './with-timeout'

describe('withTimeout', () => {
  it('rejects with an onTimeout exception instead of letting it escape the timer callback', async () => {
    vi.useFakeTimers()

    try {
      const callbackFailure = new Error('abort callback failed')

      const result = withTimeout(new Promise<never>(() => undefined), 10, 'work timed out', () => {
        throw callbackFailure
      })

      const rejection = expect(result).rejects.toBe(callbackFailure)

      await vi.advanceTimersByTimeAsync(10)
      await rejection
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('withSuspendedTimeout', () => {
  it('rejects on the budget while the wait is not suspended', async () => {
    vi.useFakeTimers()

    try {
      const result = withSuspendedTimeout(new Promise<never>(() => undefined), 10, 'timed out', () => false, 1_000)
      const rejection = expect(result).rejects.toThrow('timed out')

      await vi.advanceTimersByTimeAsync(10)
      await rejection
    } finally {
      vi.useRealTimers()
    }
  })

  it('re-arms the budget instead of firing while the wait is suspended', async () => {
    vi.useFakeTimers()

    try {
      let suspended = true
      let settled = false

      const result = withSuspendedTimeout(
        new Promise<never>(() => undefined),
        10,
        'timed out',
        () => suspended,
        1_000
      ).catch(() => {
        settled = true
      })

      await vi.advanceTimersByTimeAsync(50)
      expect(settled).toBe(false)

      // The first run hands off; the budget applies again from that moment.
      suspended = false
      await vi.advanceTimersByTimeAsync(10)
      await result
      expect(settled).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('still rejects past the ceiling, so a wedged suspended wait ends in recovery', async () => {
    vi.useFakeTimers()

    try {
      const result = withSuspendedTimeout(new Promise<never>(() => undefined), 10, 'timed out', () => true, 30)
      const rejection = expect(result).rejects.toThrow('timed out')

      await vi.advanceTimersByTimeAsync(40)
      await rejection
    } finally {
      vi.useRealTimers()
    }
  })

  it('resolves with the value when the wait settles during a long suspension', async () => {
    // The first-run contract: the install outlives every budget tick, and the
    // boot still completes on the backend's own answer. A suspension that only
    // ever defers the deadline but never lets the wait through would hang here.
    vi.useFakeTimers()

    try {
      let settled = false
      let settle: (value: { ok: boolean }) => void = () => undefined

      const connection = new Promise<{ ok: boolean }>(resolve => {
        settle = resolve
      })

      const result = withSuspendedTimeout(connection, 10, 'timed out', () => true, 1_000).then(value => {
        settled = true

        return value
      })

      await vi.advanceTimersByTimeAsync(500)
      expect(settled).toBe(false)

      settle({ ok: true })
      await expect(result).resolves.toEqual({ ok: true })
    } finally {
      vi.useRealTimers()
    }
  })

  it('passes the original failure through instead of masking it as a timeout', async () => {
    vi.useFakeTimers()

    try {
      const failure = new Error('backend refused the connection')
      const result = withSuspendedTimeout(Promise.reject(failure), 10, 'timed out', () => true, 1_000)

      await expect(result).rejects.toBe(failure)
    } finally {
      vi.useRealTimers()
    }
  })
})
