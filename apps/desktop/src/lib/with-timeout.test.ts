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
  const never = new Promise<never>(() => undefined)
  const STALL = 10_000

  it('rejects on the budget while the wait is not suspended', async () => {
    vi.useFakeTimers()

    try {
      const result = withSuspendedTimeout(never, 10, 'timed out', () => ({ suspended: false }), STALL)
      const rejection = expect(result).rejects.toThrow('timed out')

      await vi.advanceTimersByTimeAsync(10)
      await rejection
    } finally {
      vi.useRealTimers()
    }
  })

  it('charges only unsuspended time, so a brief gap cannot fail a live install', async () => {
    // The bug this pins: the suspension belongs to another surface that
    // legitimately flickers (overlay remount, a snapshot that has not hydrated,
    // a stage event resetting state). Sampled at `ms` boundaries, one flicker
    // rejected a boot whose installer was visibly still running.
    vi.useFakeTimers()

    try {
      let suspended = true
      let settled = false

      const result = withSuspendedTimeout(
        never,
        1_000,
        'timed out',
        () => ({ suspended, idleForMs: 0 }),
        STALL
      ).catch(() => {
        settled = true
      })

      // ~4s of installation, punctuated by three 250 ms flickers: 750 ms of
      // unsuspended time in total, spread out. Accumulated, that is under
      // budget; any single sample of it would have been charged a whole second.
      for (let tick = 0; tick < 16; tick += 1) {
        await vi.advanceTimersByTimeAsync(250)

        if (tick % 5 === 2) {
          suspended = false

          await vi.advanceTimersByTimeAsync(250)

          suspended = true
        }
      }

      expect(settled).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects once unsuspended time accumulates past the budget', async () => {
    vi.useFakeTimers()

    try {
      let suspended = false
      let settled = false

      const result = withSuspendedTimeout(never, 1_000, 'timed out', () => ({ suspended, idleForMs: 0 }), STALL).catch(
        () => {
          settled = true
        }
      )

      // 750 ms unsuspended is under budget and must survive...
      for (let tick = 0; tick < 3; tick += 1) {
        suspended = true
        await vi.advanceTimersByTimeAsync(250)
        suspended = false
        await vi.advanceTimersByTimeAsync(250)
      }

      expect(settled).toBe(false)

      // ...and crossing 1s of accumulated unsuspended time must not.
      await vi.advanceTimersByTimeAsync(250)
      await result
      expect(settled).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects a suspended wait whose pacer has gone silent past the stall ceiling', async () => {
    vi.useFakeTimers()

    try {
      const startedAt = Date.now()

      const result = withSuspendedTimeout(
        never,
        10,
        'timed out',
        () => ({ suspended: true, idleForMs: Date.now() - startedAt }),
        1_000
      )

      const rejection = expect(result).rejects.toThrow('timed out')

      await vi.advanceTimersByTimeAsync(1_100)
      await rejection
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps waiting while the pacer is stalled but waiting on a person', async () => {
    // `setup` and `gateway` are needs_user_input: the manifest itself says the
    // clock there belongs to a human, so silence is not a wedge.
    vi.useFakeTimers()

    try {
      const startedAt = Date.now()
      let settled = false

      const result = withSuspendedTimeout(
        never,
        10,
        'timed out',
        () => ({ suspended: true, awaitingUser: true, idleForMs: Date.now() - startedAt }),
        1_000
      ).catch(() => {
        settled = true
      })

      await vi.advanceTimersByTimeAsync(60_000)
      expect(settled).toBe(false)

      // The person answers; the installer resumes and its progress re-arms the
      // ceiling, so the same wait still survives.
      await vi.advanceTimersByTimeAsync(5_000)
      expect(settled).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('runs a long-but-alive install past any fixed duration budget', async () => {
    // The measured 2026-10-04 first launch: 14 min in `git fetch` + a
    // 259-commit checkout, 3.5 min of uv, then a 12 min monorepo npm install,
    // still building products at 32 min. Elapsed time is not a failure signal;
    // only silence is.
    vi.useFakeTimers()

    try {
      const startedAt = Date.now()
      let settled = false
      let settle: (value: { ok: boolean }) => void = () => undefined

      const connection = new Promise<{ ok: boolean }>(resolve => {
        settle = resolve
      })

      const result = withSuspendedTimeout(
        connection,
        45_000,
        'timed out',
        () => {
          const idleForMs = (Date.now() - startedAt) % 60_000

          return { suspended: true, idleForMs }
        },
        10 * 60_000
      ).then(value => {
        settled = true

        return value
      })

      // 40 minutes of install, never silent for more than a minute.
      await vi.advanceTimersByTimeAsync(40 * 60_000)
      expect(settled).toBe(false)

      settle({ ok: true })
      await expect(result).resolves.toEqual({ ok: true })
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

      const result = withSuspendedTimeout(connection, 10, 'timed out', () => ({ suspended: true }), STALL).then(value => {
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
      const result = withSuspendedTimeout(Promise.reject(failure), 10, 'timed out', () => ({ suspended: true }), STALL)

      await expect(result).rejects.toBe(failure)
    } finally {
      vi.useRealTimers()
    }
  })
})
