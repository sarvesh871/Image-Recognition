export function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date'
  const ms = timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' · ' + date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatConfidence(value) {
  if (value === null || value === undefined) return '—'
  const pct = value <= 1 ? value * 100 : value
  return `${Math.round(pct)}%`
}

export function gradeTone(grade) {
  const g = (grade || '').toLowerCase()
  if (['excellent', 'high', 'a', 'strong'].some((k) => g.includes(k))) return 'high'
  if (['medium', 'moderate', 'b', 'fair'].some((k) => g.includes(k))) return 'mid'
  if (['low', 'weak', 'poor', 'c', 'd'].some((k) => g.includes(k))) return 'low'
  return 'mid'
}

export function bytesToSize(bytes) {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
