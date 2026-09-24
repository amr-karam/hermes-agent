/**
 * Local two-model orchestration (Ollama-backed).
 *
 * Each worker is an independent `ollama serve` instance on its own port.
 * The coordinator routes requests by mode: fanout (both answer), debate
 * (draft + critique), or delegate (router classifies complexity → worker).
 *
 * No main-process bridge is needed — the renderer talks to Ollama HTTP
 * endpoints directly, same-origin on 127.0.0.1.
 */
import { atom } from 'nanostores'

export type OrchestratorMode = 'fanout' | 'debate' | 'delegate'

export interface OrchestratorSettings {
  mode: OrchestratorMode
  primaryUrl: string
  secondaryUrl: string
  primaryModel: string
  secondaryModel: string
  timeoutMs: number
}

export const DEFAULT_ORCHESTRATOR_SETTINGS: OrchestratorSettings = {
  mode: 'fanout',
  primaryUrl: 'http://127.0.0.1:11434',
  secondaryUrl: 'http://127.0.0.1:11435',
  primaryModel: 'llama3.1:8b',
  secondaryModel: 'phi3.5:mini',
  timeoutMs: 120_000
}

export const $orchestratorSettings = atom<OrchestratorSettings>(DEFAULT_ORCHESTRATOR_SETTINGS)

export interface OrchestratorState {
  busy: boolean
  results: string[] | null
  error: string | null
}

export const $orchestrator = atom<OrchestratorState>({ busy: false, results: null, error: null })

interface ChatReq { model: string; messages: Array<{ role: string; content: string }>; stream?: boolean }
interface ChatRes { message: { content: string } }

async function postJson(url: string, body: ChatReq, timeoutMs: number): Promise<ChatRes> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    if (!r.ok) {
      throw new Error(`Ollama ${r.status} ${r.statusText}`)
    }
    return (await r.json()) as ChatRes
  } finally {
    clearTimeout(timer)
  }
}

function classifyComplexity(prompt: string, primaryUrl: string, timeoutMs: number): Promise<'simple' | 'complex'> {
  return postJson(primaryUrl, {
    model: DEFAULT_ORCHESTRATOR_SETTINGS.primaryModel,
    messages: [{ role: 'user', content: `Classify as 'simple' or 'complex': ${prompt}` }],
    stream: false
  }, timeoutMs).then(r => {
    const text = r.message.content.trim().toLowerCase()
    return text.includes('complex') ? 'complex' : 'simple'
  }).catch(() => 'simple')
}

export async function orchestrate(prompt: string): Promise<string[]> {
  const settings = $orchestratorSettings.get()
  $orchestrator.set({ busy: true, results: null, error: null })

  try {
    let results: string[]

    if (settings.mode === 'fanout') {
      const [a, b] = await Promise.all([
        postJson(settings.primaryUrl, { model: settings.primaryModel, messages: [{ role: 'user', content: prompt }], stream: false }, settings.timeoutMs),
        postJson(settings.secondaryUrl, { model: settings.secondaryModel, messages: [{ role: 'user', content: prompt }], stream: false }, settings.timeoutMs)
      ])
      results = [a.message.content, b.message.content]
    } else if (settings.mode === 'debate') {
      const draft = await postJson(settings.primaryUrl, { model: settings.primaryModel, messages: [{ role: 'user', content: prompt }], stream: false }, settings.timeoutMs)
      const critique = await postJson(settings.secondaryUrl, { model: settings.secondaryModel, messages: [{ role: 'user', content: `Critique this answer and suggest improvements:\n\n${draft.message.content}` }], stream: false }, settings.timeoutMs)
      results = [draft.message.content, critique.message.content]
    } else {
      const complexity = await classifyComplexity(prompt, settings.primaryUrl, settings.timeoutMs)
      const workerUrl = complexity === 'complex' ? settings.secondaryUrl : settings.primaryUrl
      const workerModel = complexity === 'complex' ? settings.secondaryModel : settings.primaryModel
      const res = await postJson(workerUrl, { model: workerModel, messages: [{ role: 'user', content: prompt }], stream: false }, settings.timeoutMs)
      results = [res.message.content]
    }

    $orchestrator.set({ busy: false, results, error: null })
    return results
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    $orchestrator.set({ busy: false, results: null, error: msg })
    throw error
  }
}

export async function checkOrchestratorHealth(url: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const r = await fetch(`${url}/api/tags`, { signal: controller.signal })
    clearTimeout(timer)
    return r.ok
  } catch {
    return false
  }
}

export function setOrchestratorMode(mode: OrchestratorMode): void {
  const next = { ...$orchestratorSettings.get(), mode }
  $orchestratorSettings.set(next)
}

export function setOrchestratorPrimaryModel(model: string): void {
  const next = { ...$orchestratorSettings.get(), primaryModel: model }
  $orchestratorSettings.set(next)
}

export function setOrchestratorSecondaryModel(model: string): void {
  const next = { ...$orchestratorSettings.get(), secondaryModel: model }
  $orchestratorSettings.set(next)
}

export function setOrchestratorUrls(primaryUrl: string, secondaryUrl: string): void {
  const next = { ...$orchestratorSettings.get(), primaryUrl, secondaryUrl }
  $orchestratorSettings.set(next)
}
