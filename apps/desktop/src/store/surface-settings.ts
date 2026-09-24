/**
 * Surface settings (desktop wallpaper + slideshow) — the renderer's cache of
 * the main process's authoritative copy (`electron/surface-ipc.ts`, persisted
 * to surface-settings.json under userData).
 *
 * Main owns the truth: applying a wallpaper talks to the OS, captures the
 * user's original picture once, and re-applies the dark/light variant on
 * theme flips. This store only edits: an optimistic local set for slider-drag
 * responsiveness, then a patched IPC push whose merged response is adopted
 * only while it is still the newest patch (generation counter, so a slow
 * response can never clobber a newer edit).
 */
import { type SurfaceSettings } from '@hermes/shared/translucency'
import { atom } from 'nanostores'

import { isMacPlatform, isWindowsPlatform } from '@/lib/platform'

/**
 * Wallpaper apply is OS-level (registry / System Events) — Linux has neither,
 * so the row is absent there rather than offering a dead lever.
 */
export const SURFACE_WALLPAPER_SUPPORTED = isMacPlatform() || isWindowsPlatform()

const DEFAULT_SURFACE_SETTINGS: SurfaceSettings = {
  theme: 'dark',
  accentColor: { light: { color: '', source: '' }, dark: { color: '', source: '' } },
  wallpaper: { path: '', position: 'fill', opacity: 100, blur: 0, darkPath: '' },
  transparency: { enabled: false, intensity: 0, material: '' },
  slideshow: { enabled: false, folder: '', intervalMinutes: 30, shuffle: false }
}

export const $surfaceSettings = atom<SurfaceSettings>(DEFAULT_SURFACE_SETTINGS)

function clampPercent(value: number): number {
  const n = Math.round(Number(value))

  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

/** Section-wise merge: a patch replaces only the sections it carries. */
function applyPatch(current: SurfaceSettings, patch: Partial<SurfaceSettings>): SurfaceSettings {
  return {
    ...current,
    ...patch,
    accentColor: { ...current.accentColor, ...(patch.accentColor ?? {}) },
    wallpaper: { ...current.wallpaper, ...(patch.wallpaper ?? {}) },
    transparency: { ...current.transparency, ...(patch.transparency ?? {}) },
    slideshow: { ...current.slideshow, ...(patch.slideshow ?? {}) }
  }
}

// Generation counter for in-flight pushes: only the newest patch's response
// may adopt, so two fast edits resolve in order regardless of IPC timing.
let patchSeq = 0

async function pushPatch(patch: Partial<SurfaceSettings>): Promise<void> {
  const seq = ++patchSeq
  $surfaceSettings.set(applyPatch($surfaceSettings.get(), patch))

  try {
    const next = await window.hermesDesktop?.setSurfaceSettings(patch)

    if (next && seq === patchSeq) {
      $surfaceSettings.set(next)
    }
  } catch {
    // Optimistic local state stands; main keeps its own copy either way.
  }
}

/** Pull the authoritative copy (mount, and after pickers that main applied directly). */
export async function hydrateSurfaceSettings(): Promise<void> {
  patchSeq++ // invalidate in-flight adopts — the fetched copy is newer than them

  try {
    const next = await window.hermesDesktop?.getSurfaceSettings()

    if (next) {
      $surfaceSettings.set({ ...DEFAULT_SURFACE_SETTINGS, ...next })
    }
  } catch {
    // Defaults stand.
  }
}

export function setSurfaceWallpaperOpacity(value: number): void {
  const wallpaper = $surfaceSettings.get().wallpaper
  void pushPatch({ wallpaper: { ...wallpaper, opacity: clampPercent(value) } })
}

export function setSurfaceWallpaperBlur(value: number): void {
  const wallpaper = $surfaceSettings.get().wallpaper
  void pushPatch({ wallpaper: { ...wallpaper, blur: clampPercent(value) } })
}

export function setSlideshowEnabled(enabled: boolean): void {
  const slideshow = $surfaceSettings.get().slideshow
  void pushPatch({ slideshow: { ...slideshow, enabled } })
}

export function setSlideshowShuffle(shuffle: boolean): void {
  const slideshow = $surfaceSettings.get().slideshow
  void pushPatch({ slideshow: { ...slideshow, shuffle } })
}

export function setSlideshowInterval(intervalMinutes: number): void {
  const slideshow = $surfaceSettings.get().slideshow
  void pushPatch({ slideshow: { ...slideshow, intervalMinutes: Math.max(1, Math.round(intervalMinutes)) } })
}

/** Outcome of a wallpaper action: cancel is ok, only a failed apply errors. */
export interface SurfaceActionResult {
  ok: boolean
  error?: string
}

/** Pick a picture and apply it through main (which captures the original first). */
export async function chooseAndSetWallpaper(): Promise<SurfaceActionResult> {
  const path = (await window.hermesDesktop?.pickWallpaper()) ?? null

  if (!path) {
    return { ok: true } // dialog cancelled
  }

  const result = (await window.hermesDesktop?.setWallpaper({ path })) ?? { ok: false, error: 'No bridge.' }

  if (!result.ok) {
    return result
  }

  const wallpaper = $surfaceSettings.get().wallpaper
  $surfaceSettings.set(applyPatch($surfaceSettings.get(), { wallpaper: { ...wallpaper, path } }))
  void hydrateSurfaceSettings()

  return { ok: true }
}

/** Pick the dark-mode variant; main swaps it on the next theme flip/now. */
export async function chooseDarkWallpaper(): Promise<SurfaceActionResult> {
  const path = (await window.hermesDesktop?.pickWallpaper()) ?? null

  if (!path) {
    return { ok: true }
  }

  const wallpaper = $surfaceSettings.get().wallpaper
  await pushPatch({ wallpaper: { ...wallpaper, darkPath: path } })

  return { ok: true }
}

/** Clear both variants; main restores the capture-once original picture. */
export async function clearWallpaper(): Promise<SurfaceActionResult> {
  const result = (await window.hermesDesktop?.clearWallpaper()) ?? { ok: false, error: 'No bridge.' }

  if (!result.ok) {
    return result
  }

  const wallpaper = $surfaceSettings.get().wallpaper
  $surfaceSettings.set(applyPatch($surfaceSettings.get(), { wallpaper: { ...wallpaper, path: '', darkPath: '' } }))
  void hydrateSurfaceSettings()

  return { ok: true }
}

/** Pick the rotation folder; main re-arms the slideshow on the patch. */
export async function chooseSlideshowFolder(): Promise<void> {
  const folder = (await window.hermesDesktop?.pickSlideshowFolder()) ?? null

  if (!folder) {
    return
  }

  const slideshow = $surfaceSettings.get().slideshow
  await pushPatch({ slideshow: { ...slideshow, folder } })
}
