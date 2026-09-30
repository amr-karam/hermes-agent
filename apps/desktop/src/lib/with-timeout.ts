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

/** Hard ceiling on a boot wait whose budget is suspended (see
 *  withSuspendedTimeout). A first-run install is paced by a human and by the
 *  installer, so the budget above cannot be the whole story — but a first run
 *  that wedges must still end in the recovery surface rather than hanging
 *  "Starting Hermes…" forever. */
export const FIRST_RUN_INSTALL_BOOT_CEILING_MS = 30 * 60_000

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

/** Settle with `promise`, or reject with a TimeoutError after `ms` of
 *  UNSUSPENDED time. While `isSuspended()` is true the deadline is re-armed
 *  instead of firing, so work paced by something other than its own clock — a
 *  first-run install waiting on the user's setup choice, then on a multi-minute
 *  products build — is not failed by a budget that only fits a cold backend
 *  spawn. `ceilingMs` bounds the total wait so a wedged run still ends in a
 *  real recovery affordance. */
export function withSuspendedTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
  isSuspended: () => boolean,
  ceilingMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const startedAt = Date.now()
    let timer: ReturnType<typeof setTimeout>

    const expire = () => {
      if (isSuspended() && Date.now() - startedAt < ceilingMs) {
        timer = setTimeout(expire, ms)

        return
      }

      reject(new TimeoutError(message))
    }

    timer = setTimeout(expire, ms)

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
