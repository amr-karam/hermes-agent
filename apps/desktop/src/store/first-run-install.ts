import { atom } from 'nanostores'

/** True while the first-run install surface owns the screen: the setup choice,
 *  an in-flight bootstrap, or a failed install. Published by
 *  DesktopInstallOverlay, which already holds the bootstrap snapshot.
 *
 *  Two distant surfaces read it, and both need the same answer:
 *  - The boot recovery overlay must yield. It sits on the same z-index rung and
 *    mounts later, so a boot failure raised while the setup choice is on screen
 *    covers the only UI that can answer it — the choice can then never be made.
 *  - The boot wait's budget is paced by a human (the choice) and by the
 *    installer (a cold products build is minutes), not by a backend spawn, so
 *    the flat boot timeout must not run against it. */
export const $firstRunInstallActive = atom(false)

/** ms since the install last showed a sign of life. Seeded at module load so a
 *  probe taken before the overlay has published anything reads as fresh rather
 *  than as an infinitely old stall. */
let lastProgressAt = Date.now()

/** True while the current stage is one the manifest marks `needs_user_input`
 *  (or the setup choice is on screen). Reset whenever the surface stops owning
 *  the screen so a later run never inherits the previous stage's answer. */
let awaitingUser = false

export interface FirstRunInstallActivity {
  active: boolean
  awaitingUser: boolean
  idleForMs: number
}

export function publishFirstRunInstallActive(active: boolean): void {
  $firstRunInstallActive.set(active)

  if (!active) {
    awaitingUser = false
  }
}

/** A sign of life from the installer: any bootstrap event, or the initial
 *  snapshot that proves how far the run already got. */
export function publishFirstRunInstallProgress(): void {
  lastProgressAt = Date.now()
}

/** The install is waiting on a person, not on work. Time spent there is the
 *  user's, so no stall ceiling applies to it. */
export function publishFirstRunInstallAwaitingUser(next: boolean): void {
  awaitingUser = next
}

export function firstRunInstallActive(): boolean {
  return $firstRunInstallActive.get()
}

/** What the boot wait samples on its suspension probe. Deliberately a plain
 *  read, not a store subscription: the probe is polled, and only the install
 *  overlay may publish into it. */
export function firstRunInstallActivity(): FirstRunInstallActivity {
  return {
    active: $firstRunInstallActive.get(),
    awaitingUser,
    idleForMs: Date.now() - lastProgressAt
  }
}