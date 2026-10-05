/** Shared budget for any renderer await that rides out a primary backend
 * cold boot (initial getConnection(), the registry restore's descriptor
 * wait). Matches the main-process spawn budget
 * (DEFAULT_BACKEND_READY_TIMEOUT_MS in electron/backend-health.ts): a
 * healthy cold boot publishes well within this; anything longer means the
 * backend is not coming and the caller should fail instead of hanging.
 * Reconnect-class awaits against an already-spawned backend use the shorter
 * RECONNECT_ATTEMPT_TIMEOUT_MS below instead. */
export const BACKEND_BOOT_WAIT_TIMEOUT_MS = 45_000

// desktop.getConnection() / getConnectionFor() / revalidateConnection() /
// resolveGatewayWsUrl() are IPC round-trips into the main process with no
// timeout of their own (#93454). A wedged main-process round-trip (e.g. a
// stuck revalidation after a liveness-probe trip) otherwise hangs an awaiting
// caller forever. Every caller of these bounds them with this shared budget.
export const RECONNECT_ATTEMPT_TIMEOUT_MS = 20_000

/** Longest the first-run install may go completely silent before the boot wait
 *  concludes it wedged. This is a STALL ceiling, not a duration budget: a real
 *  cold install is paced by the network, by npm/uv, and by a person answering
 *  the manifest's `needs_user_input` stages, so any total-elapsed bound is
 *  wrong by construction (a measured 2026-10-04 first launch ran 32 min and was
 *  still building products). Silence is the only honest wedge signal.
 *
 *  Sized against the observed quiet stretches of that run: 123 s inside
 *  `git fetch origin/main`, 87 s inside uv's dependency resolve, 56 s inside a
 *  259-commit checkout. 10 min clears those with room to spare while still
 *  ending a genuinely dead installer in the recovery surface instead of
 *  "Starting Hermes…" forever. */
export const FIRST_RUN_INSTALL_STALL_CEILING_MS = 10 * 60_000

/** How often a suspended wait re-reads its probe. The suspension is owned by
 *  another surface (an overlay that mounts, re-renders, and unmounts), so a
 *  coarse boundary would let one unlucky sample decide the whole wait. */
const SUSPENSION_POLL_MS = 250

/** Rejection raised by withTimeout. The bounded work is NOT cancelled — the
 * caller decides what a straggler that settles later means. */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}

/** Settle with `promise`, or reject with a TimeoutError after `ms`.
 * `onTimeout` runs synchronously before the rejection is published so callers
 * can revoke ownership of work that would otherwise keep running unowned. If
 * that callback throws, its error becomes this promise's rejection. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
  onTimeout?: (error: TimeoutError) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new TimeoutError(message)

      try {
        onTimeout?.(error)
      } catch (onTimeoutError) {
        reject(onTimeoutError)

        return
      }

      reject(error)
    }, ms)

    Promise.resolve(promise).then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      err => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

/** What a suspended wait can observe about the thing pacing it. */
export interface SuspensionProbe {
  /** True while something other than this wait's own clock paces it. */
  suspended: boolean
  /** How long that pacing has gone without a sign of life. Omit when the caller
   *  cannot observe one — the stall ceiling then never applies and `ms` is the
   *  only bound. */
  idleForMs?: number
  /** True while the pacing waits on a person rather than on work. A human
   *  reading API-key instructions is not a stall, so no ceiling applies. */
  awaitingUser?: boolean
}

/** Settle with `promise`, or reject with a TimeoutError after `ms` of
 *  UNSUSPENDED time — plus, when the caller can see it, after
 *  `stallCeilingMs` of silence from the pacing work.
 *
 *  Un-suspended time is CHARGED, not sampled at `ms` boundaries: the suspension
 *  belongs to another surface that legitimately flickers (an overlay remount, a
 *  snapshot that has not hydrated, a stage event that resets the state), and a
 *  boundary sampler lets any one of those flickers fail a boot that is visibly
 *  progressing — which is precisely what this function exists to prevent. The
 *  flat budget only bites once the wait has genuinely not been paced for `ms`.
 *
 *  `stallCeilingMs` bounds silence, not duration, so a long-but-alive install
 *  runs to completion while a wedged one still ends in a real recovery
 *  affordance. */
export function withSuspendedTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
  probe: () => SuspensionProbe,
  stallCeilingMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const startedAt = Date.now()
    const pollMs = Math.min(SUSPENSION_POLL_MS, Math.max(ms, 1))
    let chargedMs = 0
    let sampledAt = startedAt
    let timer: ReturnType<typeof setTimeout>

    const expire = () => {
      const now = Date.now()
      const span = now - sampledAt

      sampledAt = now

      const { suspended, idleForMs, awaitingUser } = probe()

      if (!suspended) {
        chargedMs += span
      }

      const outOfBudget = chargedMs >= ms
      const stalled = !awaitingUser && idleForMs !== undefined && idleForMs >= stallCeilingMs

      if (outOfBudget || stalled) {
        reject(new TimeoutError(message))

        return
      }

      timer = setTimeout(expire, pollMs)
    }

    timer = setTimeout(expire, pollMs)

    Promise.resolve(promise).then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      err => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}
