// Shared event constants and helpers used by Dashboard, CalendarPage and AddEventPage.

export const EVENT_TYPE_LABEL: Record<string, string> = {
  exam: 'Tenta',
  assignment: 'Uppgift',
  lab: 'Labb',
  seminar: 'Seminarium',
  lecture: 'Föreläsning',
  other: 'Annat',
};

export const EVENT_STATUS_LABEL: Record<string, string> = {
  upcoming: 'Kommande',
  complete: 'Klar',
  overdue: 'Försenad',
};

export const EVENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'exam', label: '📋 Tenta' },
  { value: 'assignment', label: '📝 Uppgift' },
  { value: 'lab', label: '🧪 Labb' },
  { value: 'seminar', label: '💬 Seminarium' },
  { value: 'lecture', label: '🎓 Föreläsning' },
  { value: 'other', label: '📌 Annat' },
];

export const EVENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'upcoming', label: 'Kommande' },
  { value: 'complete', label: 'Klar' },
  { value: 'overdue', label: 'Försenad' },
];

export type ParsedHp = { ok: true; value: number } | { ok: false; error: string };

/** Parse a free-text HP value. Empty string is treated as 0. */
export function parseHpInput(raw: string): ParsedHp {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: 0 };
  const parsed = Number.parseFloat(trimmed.replace(',', '.'));
  if (Number.isNaN(parsed) || parsed < 0) {
    return { ok: false, error: 'Ogiltigt HP-värde' };
  }
  return { ok: true, value: parsed };
}
