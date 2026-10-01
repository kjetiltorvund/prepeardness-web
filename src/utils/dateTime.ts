export function parseUtcDateTime(value: string | null | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toUtcDateTime(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Cannot serialize an invalid date')
  }

  return date.toISOString().replace('Z', '+00:00')
}

export function formatLocalDate(
  value: string | null | undefined,
  fallback = 'N/A',
): string {
  const date = parseUtcDateTime(value)
  return date ? date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) : fallback
}
