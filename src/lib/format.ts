/**
 * Formatting helpers. Everything here is Ontario-facing: en-CA dates, and
 * plain wording rather than jargon — homeowners read this, not schedulers.
 */

const DATE = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const DATE_SHORT = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return DATE.format(new Date(value));
}

export function formatDateShort(value: string | null | undefined) {
  if (!value) return null;
  return DATE_SHORT.format(new Date(value));
}

/** "Today", "Yesterday", "3 days ago", then falls back to a real date. */
export function formatRelativeDay(value: string | null | undefined) {
  if (!value) return null;
  const days = daysSince(value);
  if (days === null) return null;
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return DATE_SHORT.format(new Date(value));
}

/** Compares calendar days in local time, so "yesterday" doesn't flip at 19:00. */
const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

export function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((startOfDay(new Date()) - startOfDay(then)) / 86_400_000);
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
