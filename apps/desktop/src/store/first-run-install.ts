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

export function publishFirstRunInstallActive(active: boolean): void {
  $firstRunInstallActive.set(active)
}

export function firstRunInstallActive(): boolean {
  return $firstRunInstallActive.get()
}
