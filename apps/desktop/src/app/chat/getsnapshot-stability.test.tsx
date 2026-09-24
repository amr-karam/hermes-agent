import { MessageByIndexProvider, useAuiState } from '@assistant-ui/react'
import { act, cleanup, render } from '@testing-library/react'
import { atom } from 'nanostores'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { stubThreadEnvironment } from '@/components/assistant-ui/test-utils'
import { Thread } from '@/components/assistant-ui/thread'
import type { ChatMessage } from '@/lib/chat-messages'
import { $transcriptTailBySessionId } from '@/store/transcript-tail'

import { PRIMARY_SESSION_VIEW, SessionViewProvider } from './session-view'

import { ChatRuntimeBoundary } from '.'

const requestFreshSession = vi.hoisted(() => vi.fn())
const startManualProviderOAuth = vi.hoisted(() => vi.fn())
const requestModelMenuToggle = vi.hoisted(() => vi.fn<() => boolean>(() => true))

vi.mock('@/app/chat/composer/focus', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requestModelMenuToggle: () => requestModelMenuToggle()
}))

vi.mock('@/store/profile', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  requestFreshSession: () => requestFreshSession()
}))

vi.mock('@/store/onboarding', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  startManualProviderOAuth: (...args: unknown[]) => startManualProviderOAuth(...args)
}))

stubThreadEnvironment()

const userMessage: ChatMessage = {
  id: 'm-user',
  role: 'user',
  parts: [{ type: 'text', text: 'question one' }]
}

const assistantMessage: ChatMessage = {
  id: 'm-assistant',
  role: 'assistant',
  parts: [{ type: 'text', text: 'settled reply' }]
}

const threadMessagesSnapshots: unknown[] = []
const messagePartsSnapshots: unknown[] = []
const messageContentSnapshots: unknown[] = []

function ThreadProbe() {
  const messages = useAuiState(s => s.thread.messages)

  threadMessagesSnapshots.push(messages)

  return null
}

function MessageProbe() {
  const parts = useAuiState(s => s.message.parts)
  const content = useAuiState(s => s.message.content)

  messagePartsSnapshots.push(parts)
  messageContentSnapshots.push(content)

  return null
}

function Harness({ busy, tick }: { busy: boolean; tick: number }) {
  const $messages = harnessMessages
  const $runtimeId = harnessRuntimeId
  const $storedId = harnessStoredId

  const view = {
    ...PRIMARY_SESSION_VIEW,
    $messages,
    $runtimeId,
    $storedId
  }

  return (
    <MemoryRouter>
      <SessionViewProvider value={view}>
        <ChatRuntimeBoundary
          busy={busy}
          onCancel={() => {}}
          onEdit={async () => {}}
          onReload={async () => {}}
          onThreadMessagesChange={() => {}}
          suppressMessages={false}
        >
          <Thread sessionId="stored" />
          <ThreadProbe />
          <MessageByIndexProvider index={1}>
            <MessageProbe />
          </MessageByIndexProvider>
          <span data-testid="tick">{tick}</span>
        </ChatRuntimeBoundary>
      </SessionViewProvider>
    </MemoryRouter>
  )
}

let harnessMessages = atom<ChatMessage[]>([userMessage, assistantMessage])
let harnessRuntimeId = atom<string | null>('runtime')
let harnessStoredId = atom<string | null>('stored')

beforeEach(() => {
  harnessMessages = atom<ChatMessage[]>([userMessage, assistantMessage])
  harnessRuntimeId = atom<string | null>('runtime')
  harnessStoredId = atom<string | null>('stored')
  $transcriptTailBySessionId.set({})
  Object.defineProperty(window, 'hermesDesktop', { configurable: true, value: { api: vi.fn() } })
  threadMessagesSnapshots.length = 0
  messagePartsSnapshots.length = 0
  messageContentSnapshots.length = 0
})

afterEach(() => {
  cleanup()
  requestFreshSession.mockClear()
  startManualProviderOAuth.mockClear()
  requestModelMenuToggle.mockReset().mockReturnValue(true)
})

/**
 * Phase-1 feedback loop for the packaged crash
 * "Maximum update depth exceeded. The result of getSnapshot should be cached
 * to avoid an infinite loop" (stack through UseTapEffects → AuiProvider →
 * ChatRuntimeBoundary).
 *
 * Red-capable signals:
 * 1. render()/rerender() throws Maximum update depth (React's native
 *    useSyncExternalStore error) when a useAuiState selector returns a fresh
 *    reference on every getSnapshot while a notify loop re-enters render.
 * 2. Consecutive getSnapshot results for unchanged content are not Object.is
 *    stable — recorded snapshots for thread.messages / message.parts /
 *    message.content must be a single identity across forced boundary
 *    re-renders, busy flips, and $messages identity churn.
 */
describe('ChatRuntimeBoundary getSnapshot stability', () => {
  it('keeps selector snapshots Object.is stable across re-renders, busy flips, and $messages churn', () => {
    const { rerender } = render(<Harness busy={false} tick={0} />)

    // Fresh adapter literal on every boundary render (store prop is inline).
    for (let tick = 1; tick <= 8; tick++) {
      rerender(<Harness busy={tick % 2 === 1} tick={tick} />)
    }

    // New array identity, same ChatMessage refs — forces the full-sync
    // messageRepository identity change (always-notify path).
    act(() => {
      harnessMessages.set([...harnessMessages.get()])
    })

    rerender(<Harness busy={false} tick={99} />)

    expect(messagePartsSnapshots.length).toBeGreaterThan(0)
    expect(messageContentSnapshots.length).toBeGreaterThan(0)
    expect(threadMessagesSnapshots.length).toBeGreaterThan(0)

    expect(new Set(messagePartsSnapshots).size).toBe(1)
    expect(new Set(messageContentSnapshots).size).toBe(1)
    expect(new Set(threadMessagesSnapshots).size).toBe(1)
  })

  it('survives a notify-storm of boundary re-renders without Maximum update depth', () => {
    expect(() => {
      const { rerender } = render(<Harness busy={false} tick={0} />)

      for (let tick = 1; tick <= 25; tick++) {
        rerender(<Harness busy={tick % 3 === 0} tick={tick} />)

        if (tick % 5 === 0) {
          act(() => {
            harnessMessages.set([...harnessMessages.get()])
          })
        }
      }
    }).not.toThrow('Maximum update depth')
  })
})
