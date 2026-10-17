import { Button } from "@nous-research/ui/ui/components/button";
import { IconCalendar as Calendar, IconFilter as Filter, IconX as X, IconMessage as MessageSquare } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useI18n } from "@/i18n";

export interface SessionFilters {
  source?: string;
  after?: string; // ISO date
  before?: string; // ISO date
  minMessages?: number;
}

interface FilterChipsProps {
  filters: SessionFilters;
  onChange: (filters: SessionFilters) => void;
  onUpdateUrl: (key: string, value: string | null) => void;
}

const CHIP_CLASS = "gap-1 px-2 bg-primary/10 text-primary border-primary/30";

export function FilterChips({ filters, onChange, onUpdateUrl }: FilterChipsProps) {
  const { t } = useI18n();
  const [, setSearchParams] = useSearchParams();

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.source) count++;
    if (filters.after) count++;
    if (filters.before) count++;
    if (filters.minMessages) count++;
    return count;
  }, [filters]);

  const handleSourceChange = useCallback(
    (source: string | undefined) => {
      onChange({ ...filters, source });
      onUpdateUrl("source", source ?? null);
    },
    [filters, onChange, onUpdateUrl],
  );

  const handleDateChange = useCallback(
    (key: "after" | "before", value: string | undefined) => {
      onChange({ ...filters, [key]: value });
      onUpdateUrl(key, value ?? null);
    },
    [filters, onChange, onUpdateUrl],
  );

  const handleMinMessagesChange = useCallback(
    (value: number | undefined) => {
      onChange({ ...filters, minMessages: value });
      onUpdateUrl("min_messages", value ? String(value) : null);
    },
    [filters, onChange, onUpdateUrl],
  );

  const clearAll = useCallback(() => {
    onChange({});
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("source");
        next.delete("after");
        next.delete("before");
        next.delete("min_messages");
        return next;
      },
      { replace: true },
    );
  }, [onChange, setSearchParams]);

  if (activeCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-2 pb-1">
      <span className="flex items-center gap-1 text-[10px] font-medium text-text-tertiary">
        <Filter className="h-2.5 w-2.5" />
        {t.sessions.filters}
      </span>

      <div className="flex flex-wrap gap-1">
        {filters.source && (
          <Button
            outlined
            size="sm"
            onClick={() => handleSourceChange(undefined)}
            className={CHIP_CLASS}
            aria-label={`${t.sessions.sourceFilter}: ${filters.source}`}
          >
            <MessageSquare className="h-2.5 w-2.5" />
            {filters.source}
            <X className="h-2.5 w-2.5" />
          </Button>
        )}

        {filters.after && (
          <Button
            outlined
            size="sm"
            onClick={() => handleDateChange("after", undefined)}
            className={CHIP_CLASS}
            aria-label={`${t.sessions.dateAfter}: ${filters.after}`}
          >
            <Calendar className="h-2.5 w-2.5" />
            {t.sessions.after} {filters.after}
            <X className="h-2.5 w-2.5" />
          </Button>
        )}

        {filters.before && (
          <Button
            outlined
            size="sm"
            onClick={() => handleDateChange("before", undefined)}
            className={CHIP_CLASS}
            aria-label={`${t.sessions.dateBefore}: ${filters.before}`}
          >
            <Calendar className="h-2.5 w-2.5" />
            {t.sessions.before} {filters.before}
            <X className="h-2.5 w-2.5" />
          </Button>
        )}

        {filters.minMessages && (
          <Button
            outlined
            size="sm"
            onClick={() => handleMinMessagesChange(undefined)}
            className={CHIP_CLASS}
            aria-label={`${t.sessions.minMessages}: ${filters.minMessages}+`}
          >
            <MessageSquare className="h-2.5 w-2.5" />
            {t.sessions.minMessages} {filters.minMessages}+
            <X className="h-2.5 w-2.5" />
          </Button>
        )}
      </div>

      {activeCount > 0 && (
        <Button
          ghost
          size="sm"
          onClick={clearAll}
          className="ml-auto text-xs text-text-tertiary hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          {t.common.clearAll}
        </Button>
      )}
    </div>
  );
}