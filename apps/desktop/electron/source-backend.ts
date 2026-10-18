import { existsSync } from 'node:fs'
import path from 'node:path'

import { buildDesktopBackendEnv } from './backend-env'
import { execProbe, isTimeoutError, PROBE_TIMEOUT_MS } from './backend-probes'
import { resolveInstallationLauncher } from './updater-process'

export interface SourceBackend {
  kind: 'command' | 'python'
  label: string
  command: string
  args: string[]
  env: NodeJS.ProcessEnv
  root: string
  bootstrap: false
  shell: boolean
  local: 'installed'
}

interface SourceOptions {
  isWindows?: boolean
  env?: NodeJS.ProcessEnv
}

/** Keep the validated command. PM owns interpreter and generation selection. */
export async function resolveSourceInstallationBackend(
  root: string,
  args: string[],
  options: SourceOptions & { hermesHome?: string } = {}
): Promise<SourceBackend | null> {
  if (!existsSync(path.join(root, 'hermes_cli', 'main.py'))) {
    return null
  }

  const isWindows: boolean = options.isWindows ?? process.platform === 'win32'
  const launcher: string | null = resolveInstallationLauncher(root, isWindows, options.hermesHome)

  if (!launcher) {
    return null
  }

  const shell: boolean = isWindows && /\.(cmd|bat)$/i.test(launcher)
  const command: string = shell ? `"${launcher}"` : launcher
  const env: NodeJS.ProcessEnv = buildDesktopBackendEnv({ currentEnv: options.env ?? process.env })

  try {
    await execProbe(command, ['--version'], {
      cwd: root,
      env: { ...process.env, ...options.env, ...env },
      shell,
      stdio: 'ignore',
      timeout: PROBE_TIMEOUT_MS,
      windowsHide: true
    })
  } catch (error) {
    // A timeout is inconclusive, not fatal. execProbe already retried once on
    // timeout, so reaching here means the launcher outlived 2x the budget — but
    // both its files are proven present above, so `null` would report a healthy
    // install as absent and route the launch into a first-run setup wait for an
    // install that needs no setup. Trust it; a launcher that is genuinely hung
    // fails on its own start-up timeout with an honest error. Only a real
    // failure (missing binary, non-zero exit) means "no usable install".
    if (!isTimeoutError(error)) {
      return null
    }
  }

  return {
    kind: 'command',
    label: `Hermes at ${root}`,
    command,
    args: [...args],
    env,
    root,
    bootstrap: false,
    shell,
    local: 'installed'
  }
}

/** Developer overrides retain their interpreter, even outside the checkout. */
export function createSourcePythonBackend(
  root: string,
  python: string | null,
  args: string[],
  options: SourceOptions = {}
): SourceBackend | null {
  if (!python) {
    return null
  }

  let command: string = python

  if ((options.isWindows ?? process.platform === 'win32') && /[\\/]pythonw\.exe$/i.test(python)) {
    // Use only the console interpreter beside the selected windowless one.
    const consolePython: string = python.replace(/pythonw\.exe$/i, 'python.exe')

    if (existsSync(consolePython)) {
      command = consolePython
    }
  }

  return {
    kind: 'python',
    label: `Hermes source at ${root}`,
    command,
    args: ['-m', 'hermes_cli.main', ...args],
    // The backend runs in the user's workspace cwd, and the selected
    // interpreter need not have this checkout installed: name it explicitly.
    // (The scrubbed inherited value could point at another checkout.)
    env: { ...buildDesktopBackendEnv({ currentEnv: options.env ?? process.env }), PYTHONPATH: root },
    root,
    bootstrap: false,
    shell: false,
    local: 'installed'
  }
}
