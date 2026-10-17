import { useCallback, useRef, useState } from "react";
import { cn, timeAgo } from "@/lib/utils";
import { api, type SessionMessage } from "@/lib/api";
import { useI18n } from "@/i18n";

interface SessionPreviewPopoverProps {
  sessionId: string;
  profile?: string;
  children: React.ReactElement;
  limit?: number;
}

const HOVER_OPEN_MS = 200;
const HOVER_CLOSE_MS = 100;

const ROLE_CLASS: Record<SessionMessage["role"], string> = {
  user: "bg-primary/20 text-primary",
  assistant: "bg-green-500/20 text-green-400",
  system: "bg-yellow-500/20 text-yellow-400",
  tool: "bg-blue-500/20 text-blue-400",
};

/**
 * Hover preview of the last few messages in a session row.
 *
 * The panel is a plain absolutely-positioned sibling rather than a Popover
 * primitive: `@nous-research/ui` ships no popover component, and a hover
 * preview does not justify pulling in a new positioning dependency. It opens on
 * hover with a short intent delay, fetches once per session, and stays mounted
 * while the pointer moves into it.
 */
export function SessionPreviewPopover({
  sessionId,
  profile,
  children,
  limit = 5,
}: SessionPreviewPopoverProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<SessionMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const hoverTimerRef = useRef<number | undefined>(undefined);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const reqRef = useRef(0);

  const loadPreview = useCallback(async () => {
    const myReq = ++reqRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSessionPreview(sessionId, limit, profile);
      if (reqRef.current !== myReq) return;
      setMessages(res.messages);
    } catch (e: unknown) {
      if (reqRef.current !== myReq) return;
      setError(e instanceof Error ? e.message : "Failed to load preview");
    } finally {
      if (reqRef.current === myReq) setLoading(false);
    }
  }, [sessionId, limit, profile]);

  const cancelTimers = () => {
    if (hoverTimerRef.current !== undefined) window.clearTimeout(hoverTimerRef.current);
    if (closeTimerRef.current !== undefined) window.clearTimeout(closeTimerRef.current);
  };

  const handleMouseEnter = () => {
    cancelTimers();
    hoverTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      if (messages === null && !loading) {
        void loadPreview();
      }
    }, HOVER_OPEN_MS);
  };

  // Delay the close so the pointer can cross the gap into the panel itself.
  const handleMouseLeave = () => {
    if (hoverTimerRef.current !== undefined) window.clearTimeout(hoverTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {open && (
        <div
          role="tooltip"
          className={cn(
            "absolute left-full top-0 z-50 ml-2 w-80 overflow-hidden",
            "rounded-md border border-border bg-background-base shadow-lg",
          )}
        >
          <div className="flex items-center justify-between border-b border-border bg-background/95 px-3 py-2">
            <span className="text-xs font-medium text-text-secondary">
              {t.sessions.previewTitle}
            </span>
            {loading && (
              <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <span className="animate-spin">⟳</span> Loading…
              </span>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-3">
            {error && (
              <div className="py-4 text-center text-xs text-destructive">{error}</div>
            )}

            {!error && !loading && messages && messages.length === 0 && (
              <div className="py-4 text-center text-xs text-text-tertiary">
                {t.sessions.noMessages}
              </div>
            )}

            {!error && !loading && messages && messages.length > 0 && (
              <div className="flex flex-col gap-2">
                {messages.map((msg, idx) => (
                  <div key={`${idx}-${msg.role}-${msg.timestamp ?? 0}`} className="flex flex-col gap-1">
                    <div className="flex items-start gap-1.5">
                      <span
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                          ROLE_CLASS[msg.role],
                        )}
                      >
                        {t.sessions.roles[msg.role]}
                      </span>
                      {msg.timestamp && (
                        <span className="shrink-0 text-[10px] text-text-tertiary">
                          {timeAgo(msg.timestamp / 1000)}
                        </span>
                      )}
                    </div>
                    {msg.content && (
                      <div className="ml-6 line-clamp-3 text-xs text-text-secondary">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
