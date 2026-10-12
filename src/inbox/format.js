// Pure helpers for the inbox dashboard: dates, grouping, and the words on screen.

const DAY_MS = 86400000

export function toDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(value) {
  const d = toDate(value)
  if (!d) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "Today", "Yesterday", "Thursday" (this week), "Sep 28", "Sep 28, 2025". */
export function dayLabel(key, now = new Date()) {
  if (!key) return 'Undated'
  const d = keyToDate(key)
  const today = keyToDate(dayKey(now))
  const diff = Math.round((today - d) / DAY_MS)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' })
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })
}

/** Time for a list row: "2:14 PM" today, "Oct 8" this year, "Oct 8, 2025" before. */
export function timeLabel(value, now = new Date()) {
  const d = toDate(value)
  if (!d) return ''
  if (dayKey(d) === dayKey(now)) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })
}

/** "Saturday, October 10 at 2:14 PM" for the reader. */
export function fullDate(value) {
  const d = toDate(value)
  if (!d) return ''
  const day = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} at ${time}`
}

/** "Saturday, October 10" for the page heading. */
export function headingDate(now = new Date()) {
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/** Groups messages (already sorted newest first) by the local day of their date. */
export function groupByDay(items, now = new Date(), field = 'date') {
  const groups = []
  let current = null
  for (const item of items) {
    const key = dayKey(item[field])
    if (!current || current.key !== key) {
      current = { key, label: dayLabel(key, now), items: [] }
      groups.push(current)
    }
    current.items.push(item)
  }
  return groups
}

export function plural(n, one, many = `${one}s`) {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
}

export function isHighlight(m) {
  return Boolean(m && (m.importance === 'high' || m.personal))
}

/** Shown as unread only while it's waiting on Michael: unopened and still in the inbox, a
 *  highlight, or unread in Gmail. Mail triage archived and marked read never looks unread. */
export function looksUnread(m) {
  return Boolean(m && !m.read && (m.in_inbox || m.gmail_unread || isHighlight(m)))
}

const SORT_GAP_MS = 10 * 60 * 1000

/** "Today, 9:14 AM", "Yesterday, 6:02 PM", "Sep 28, 8:30 AM". */
export function sortTimeLabel(value, now = new Date()) {
  const d = toDate(value)
  if (!d) return 'Sorted'
  return `${dayLabel(dayKey(d), now)}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

/** Groups mail (newest sort first) into the sorts that filed it: one group per batch, with
 *  imported history split wherever sort times are more than ten minutes apart. */
export function groupBySort(items, now = new Date()) {
  const groups = []
  let current = null
  let last = null
  for (const item of items) {
    const t = toDate(item.sorted_at)?.getTime() ?? null
    const batch = item.batch_id ?? null
    const same = current && current.batch === batch && t != null && last != null && Math.abs(last - t) <= SORT_GAP_MS
    if (!same) {
      current = { key: `${batch}-${item.sorted_at}-${groups.length}`, batch, label: sortTimeLabel(item.sorted_at, now), source: item.source, items: [] }
      groups.push(current)
    }
    current.items.push(item)
    last = t
  }
  return groups
}

/** "via Claude · 26 emails · 7 in inbox" under a sort's heading. */
export function sortGroupMeta(group) {
  const parts = [group.source === 'import' ? 'Imported' : `via ${SOURCE_NAMES[group.source] || group.source || 'triage'}`]
  parts.push(plural(group.items.length, 'email'))
  const inInbox = group.items.filter((m) => m.in_inbox).length
  if (inInbox) parts.push(`${inInbox} in inbox`)
  return parts.join(' · ')
}

export function senderName(m) {
  return (m?.from_name || m?.from_email || 'Unknown sender').trim()
}

export function initials(name) {
  const parts = String(name || '?').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** Labels keep their Gmail name; the "A. " ordering prefix is dropped for reading. */
export function labelText(name) {
  return String(name || '').replace(/^[A-Z0-9]{1,2}\.\s+/, '').replace(/\//g, ' / ')
}

/** The two sentences under the date. */
export function todaySentences(summary) {
  if (!summary) return ['', '']
  const { sorted = 0, read = 0 } = summary.today || {}
  const waiting = summary.highlights?.unread || 0
  let first
  if (sorted > 0) first = `Triage sorted ${plural(sorted, 'email')} today, and you've read ${read.toLocaleString('en-US')}.`
  else if (read > 0) first = `You've read ${plural(read, 'email')} today.`
  else first = 'Nothing has been sorted yet today.'
  const second = waiting > 0
    ? `${plural(waiting, 'highlight')} ${waiting === 1 ? 'still needs' : 'still need'} you.`
    : 'No highlights are waiting on you.'
  return [first, second]
}

/** What Gmail has waiting, for the sort button and drawer. */
export function waitingSentence(gmail) {
  if (!gmail || gmail.waiting == null) return ''
  if (gmail.waiting === 0) return 'Gmail has nothing new to sort.'
  const n = `${gmail.waiting.toLocaleString('en-US')}${gmail.waiting_capped ? '+' : ''}`
  return `${n} unread ${gmail.waiting === 1 ? 'email is' : 'emails are'} waiting in Gmail.`
}

export function batchSentence(batch) {
  if (!batch) return ''
  if (batch.status === 'failed') return batch.error || 'That sort did not finish.'
  if (batch.status === 'discarded') return 'Discarded without changing Gmail.'
  if (batch.status === 'review') return `${plural(batch.total, 'email')} sorted and waiting for your review.`
  if (batch.source === 'import') return batch.message || `Imported ${plural(batch.applied, 'email')}.`
  if (!batch.applied && batch.message) return batch.message
  const parts = [`Sorted ${plural(batch.applied, 'email')}`]
  if (batch.archived) parts.push(`archived ${batch.archived.toLocaleString('en-US')}`)
  if (batch.important) parts.push(`${batch.important} marked important`)
  if (batch.personal) parts.push(`${batch.personal} personal`)
  return parts.join(', ') + '.'
}

export const SOURCE_NAMES = {
  claude: 'Claude',
  'wegter-pc': 'wegter-pc',
  ai: 'AI',
  chatgpt: 'ChatGPT',
  sheet: 'the Sheet',
  import: 'history import',
}

/** Text plus remote images toggle for an email's HTML, inside a sandboxed iframe. */
export function emailDocument(message, { blockImages = false } = {}) {
  const html = message?.html?.trim()
    ? message.html
    : `<div style="white-space:pre-wrap">${escapeHtml(message?.plain || '')}</div>`
  const img = blockImages ? "data: cid:" : "https: http: data: cid:"
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${img}; style-src 'unsafe-inline' https: http:; font-src https: http: data:; media-src https: data:">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{margin:0;padding:0;background:#ffffff;color:#1c1a22}
body{font:15px/1.6 Inter,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:2px 1px;overflow-wrap:anywhere}
img{max-width:100%;height:auto}
table{max-width:100%}
pre{white-space:pre-wrap}
a{color:#1d5fa8}
blockquote{margin:0 0 0 .6em;padding-left:.8em;border-left:2px solid #d9d5e0;color:#5d5a68}
</style></head><body>${html}</body></html>`
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function formatBytes(n) {
  if (!n && n !== 0) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
