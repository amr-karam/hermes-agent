import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api, type SlashCommand } from "@/lib/api";
import { fuzzyRank } from "@hermes/shared";
import { Button } from "@nous-research/ui/ui/components/button";
import { IconSearch as Search, IconChevronRight as ChevronRight, IconX as X, IconKeyboard as Keyboard } from "@tabler/icons-react";
import { cn, themedBody } from "@/lib/utils";
import { usePtyWebSocket } from "@/lib/pty-websocket-context";

interface SlashCommandPaletteProps {
  profile?: string;
  onClose: () => void;
}

export function SlashCommandPalette({ profile, onClose }: SlashCommandPaletteProps) {
  const [commands, setCommands] = useState<SlashCommand[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  // ChatPage supplies the live PTY socket through PtyWebSocketProvider.
  const ptyWs = usePtyWebSocket();

  useEffect(() => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    setPortalRoot(div);
    return () => {
      div.remove();
    };
  }, []);

  useEffect(() => {
    api
      .getCommands(profile)
      .then((r) => {
        setCommands(r.commands);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load commands");
        setLoading(false);
      });
  }, [profile]);

  const filtered = useMemo(() =>
    fuzzyRank(commands, query, (c) => `${c.name} ${c.description} ${c.category} ${c.args_hint}`).map((r) => r.item),
    [commands, query],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const insertCommand = (cmd: SlashCommand) => {
    if (ptyWs && ptyWs.readyState === WebSocket.OPEN) {
      const cmdStr = `${cmd.name}${cmd.args_hint ? ` ${cmd.args_hint}` : ""} `;
      ptyWs.send(cmdStr);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selected]) insertCommand(filtered[selected]);
    }
  };

  if (!portalRoot) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slash-palette-title"
    >
      <div className={cn(themedBody, "relative w-full max-w-2xl max-h-[70vh] border border-border bg-card shadow-2xl flex flex-col")}>
        <header className="p-4 pb-2 border-b border-border flex items-center justify-between">
          <h2 id="slash-palette-title" className="font-mondwest text-display text-sm tracking-wider">
            Slash Commands
          </h2>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <Keyboard className="h-3.5 w-3.5" />
            <span>{filtered.length} of {commands.length}</span>
            <Button ghost size="icon" onClick={onClose} className="text-text-secondary hover:text-foreground" aria-label="Close">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <div className="px-4 pt-2 pb-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Filter commands…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
              onKeyDown={handleKeyDown}
              className="w-full pl-7 pr-4 h-8 text-sm border border-border bg-background rounded"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8 text-xs text-text-tertiary">
              Loading commands…
            </div>
          )}
          {error && (
            <div className="p-4 text-xs text-destructive">{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="p-4 text-xs text-text-tertiary italic">
              No commands match your search.
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul role="listbox" aria-label="Available slash commands">
              {filtered.map((cmd, idx) => (
                <li
                  key={cmd.name}
                  role="option"
                  aria-selected={idx === selected}
                  onClick={() => insertCommand(cmd)}
                  onMouseEnter={() => setSelected(idx)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-mono",
                    idx === selected ? "bg-primary/10 text-foreground" : "text-text-secondary hover:bg-midground/5 hover:text-foreground",
                    "cursor-pointer"
                  )}
                >
                  <span className="font-medium text-primary">{cmd.name}</span>
                  {cmd.args_hint && <span className="text-text-tertiary">{cmd.args_hint}</span>}
                  <span className="flex-1 text-text-tertiary truncate">{cmd.description}</span>
                  <span className="text-display text-xs tracking-wider text-text-tertiary">{cmd.category}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-border p-2 text-xs text-text-tertiary">
          <kbd className="px-1.5 py-0.5 bg-midground rounded border border-border">↑↓</kbd> navigate
          <span className="mx-1">·</span>
          <kbd className="px-1.5 py-0.5 bg-midground rounded border border-border">Enter</kbd> insert
          <span className="mx-1">·</span>
          <kbd className="px-1.5 py-0.5 bg-midground rounded border border-border">Esc</kbd> close
        </footer>
      </div>
    </div>
  );

  return createPortal(content, portalRoot ?? document.body);
}