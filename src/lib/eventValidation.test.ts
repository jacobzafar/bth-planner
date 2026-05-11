import { describe, it, expect } from 'vitest';

// Mirrors validation logic in AddEventPage.tsx
export type EventDraft = {
  title: string;
  dueDate: string;
};

export type ValidationResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

export function validateEventDraft(
  draft: EventDraft,
  today: string = new Date().toISOString().split('T')[0],
): ValidationResult {
  if (!draft.title.trim() || !draft.dueDate) {
    return { ok: false, error: 'Fyll i alla obligatoriska fält' };
  }
  if (draft.dueDate < today) {
    return { ok: true, warning: 'Varning: Datumet har redan passerat' };
  }
  return { ok: true };
}

describe('validateEventDraft', () => {
  const today = '2026-05-11';

  it('rejects empty title', () => {
    const r = validateEventDraft({ title: '   ', dueDate: '2026-05-12' }, today);
    expect(r.ok).toBe(false);
  });

  it('rejects missing date', () => {
    const r = validateEventDraft({ title: 'Inlämning', dueDate: '' }, today);
    expect(r.ok).toBe(false);
  });

  it('warns when date is in the past but still accepts', () => {
    const r = validateEventDraft({ title: 'Inlämning', dueDate: '2026-05-01' }, today);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warning).toBeDefined();
  });

  it('accepts a valid future event without warning', () => {
    const r = validateEventDraft({ title: 'Tenta', dueDate: '2026-06-01' }, today);
    expect(r).toEqual({ ok: true });
  });
});
