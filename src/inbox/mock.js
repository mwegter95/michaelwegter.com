// An in-browser stand-in for the /inbox API, used by ?demo=1 and the tests.
// Every person, company and email here is invented sample data.

import { looksUnread } from './format'

const H = 3600e3
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const PEOPLE = [
  { match: 'mom@example.org', name: 'Mom', kind: 'family' },
  { match: 'ruth.k@example.org', name: 'Grandma Ruth', kind: 'family' },
  { match: 'dana.whitfield@example.net', name: 'Dana Whitfield', kind: 'friend' },
]

// [hoursAgo, from, subject, summary, labels, importance, personal, inInbox, body]
const SEED = [
  [1.2, 'Mom <mom@example.org>', 'Thanksgiving plans', 'Asks whether you can host this year and if Saturday the 28th works better than Thursday.', ['A. Personal'], 'high', true, true,
    'Hi honey,\n\nYour dad and I were talking and wondered if you two would want to host this year? Grandma says Saturday the 28th works better for her than Thursday.\n\nNo pressure at all, just let me know by next weekend so I can tell your aunt.\n\nLove you,\nMom'],
  [2.5, 'Priya & Sam <priyaandsam@example.com>', 'Wedding DJ inquiry for June 12, 2027', 'Couple marrying at Silverwood Barn on June 12, 2027 asks about availability and packages; flexible budget.', ['B. DJ/Inquiries'], 'high', false, true,
    "Hi there!\n\nWe're getting married at Silverwood Barn on June 12, 2027 (ceremony at 4, reception until 11) and a friend sent us your mixes. Are you available?\n\nWe'd love ceremony audio plus the reception, and maybe uplighting. Our budget is flexible for the right fit. Could we set up a call next week?\n\nThanks so much,\nPriya & Sam"],
  [3.1, 'Payroll <payroll@company.example>', 'Timesheet due today at 5 PM', 'Reminder that this week\'s timesheet is due by 5 PM today.', ['B. Work'], 'high', false, true,
    'Reminder: your timesheet for the week ending Friday is due today by 5:00 PM. Late timesheets delay payroll.'],
  [4.0, 'Dana Whitfield <dana.whitfield@example.net>', 'Dinner Sunday?', 'Invites you both to dinner Sunday around 5; she is bringing lasagna.', ['A. Personal'], 'medium', true, true,
    "Hey! Are you two free Sunday around 5? I'm bringing the lasagna, you just bring yourselves. Marcus might come too.\n\n— D"],
  [5.5, 'Northwind Credit Union <alerts@northwind-cu.example>', 'Your September statement is ready', 'September checking statement is available; no action needed.', ['A. Financial/Statements'], 'low', false, false, null],
  [6.2, 'The Morning Brief <newsletter@morningbrief.example>', 'Saturday edition: the week in five minutes', 'Weekend newsletter with five stories and a crossword.', ['A. Read'], 'low', false, false, 'newsletter'],
  [7.0, 'Fjord Air <no-reply@fjordair.example>', 'Check in now for MSP to SEA', 'Flight FA 218 departs Friday at 7:05 AM; check-in is open.', ['A. Travel'], 'high', false, true,
    'Your trip to Seattle is coming up.\n\nFlight FA 218, Minneapolis (MSP) to Seattle (SEA)\nFriday, 7:05 AM, Gate assigned at check-in\n\nCheck in now to choose your seats and add bags.'],
  [8.3, 'Pine Street Hardware <deals@pinestreet.example>', '30% off fall lawn care', 'Promotion on grass seed, starter fertilizer and spreaders this weekend.', ['A. Read'], 'low', false, false, null],
  [9.1, 'Lakeside Dental <frontdesk@lakesidedental.example>', 'Appointment reminder: Tue 8:00 AM', 'Cleaning on Tuesday at 8:00 AM; reply C to confirm.', ['A. Health'], 'medium', false, false, null],
  [20, 'Grandma Ruth <ruth.k@example.org>', 'Photos from the lake', 'Sent photos from the lake weekend and says she loves you both.', ['A. Personal'], 'medium', true, true,
    'I finally figured out how to attach these! The one of you two on the dock is my favorite.\n\nLove,\nGrandma'],
  [22, 'GitHub <noreply@github.example>', '[mw-backend] Dependency alert', 'A dependency in requirements.txt has a moderate advisory.', ['B. Work'], 'medium', false, false, null],
  [24, 'City of Birchwood <notices@birchwood.example>', 'Leaf pickup starts Oct 20', 'Curbside leaf collection runs Oct 20 to Nov 14 in compostable bags.', ['A. Home'], 'low', false, false, null],
  [26, 'Marcus Lee <marcus.lee@example.com>', 'Re: bowling league Thursday', 'Needs a fourth bowler Thursday at 7.', ['A. Personal'], 'medium', true, false,
    "We need a fourth for Thursday. You in? Lanes at 7, I'll grab the pitcher."],
  [30, 'Xenon Electric <billing@xenonelectric.example>', 'Your bill is ready: $84.12 due Oct 24', 'Electric bill of $84.12 is due October 24; autopay is on.', ['A. Financial/Bills'], 'medium', false, false, null],
  [44, 'Orchard Books <orders@orchardbooks.example>', 'Your order has shipped', 'Two paperbacks shipped; arriving Tuesday.', ['A. Shopping/Receipts'], 'low', false, false, null],
  [47, 'Studio Lumen <hello@studiolumen.example>', 'Uplighting rental quote', 'Quote for 12 uplights for the Nov 8 wedding: $240, delivery included.', ['B. DJ/Vendors'], 'high', false, true, null],
  [50, 'The Morning Brief <newsletter@morningbrief.example>', 'Friday edition', 'Daily newsletter.', ['A. Read'], 'low', false, false, 'newsletter'],
  [70, 'Northwind Credit Union <alerts@northwind-cu.example>', 'New sign-in from Chrome on Mac', 'A new sign-in was recorded; review if this wasn\'t you.', ['A. Financial/Security'], 'high', false, false, null],
  [75, 'Pine Street Hardware <deals@pinestreet.example>', 'Members save more this week', 'Promotion.', ['A. Read'], 'low', false, false, null],
  [96, 'Kettle & Crumb <hello@kettleandcrumb.example>', 'Your receipt from Kettle & Crumb', '$14.50 receipt for coffee and pastries.', ['A. Shopping/Receipts'], 'low', false, false, null],
  [120, 'Aunt Jo <jo.miller@example.org>', 'Recipe you asked for', 'Sends the wild rice soup recipe you asked about at the reunion.', ['A. Personal'], 'medium', true, false,
    "Here it is! The secret is a splash of sherry at the end. Don't tell your mother I gave it up so easily."],
  [140, 'Fjord Air <no-reply@fjordair.example>', 'Trip confirmation', 'Booking confirmation for the Seattle trip.', ['A. Travel'], 'medium', false, false, null],
  [170, 'The Morning Brief <newsletter@morningbrief.example>', 'Tuesday edition', 'Daily newsletter.', ['A. Read'], 'low', false, false, 'newsletter'],
  [200, 'Silverwood Barn <events@silverwoodbarn.example>', 'Vendor load-in times for Nov 8', 'Load-in for vendors on Nov 8 starts at 1 PM through the north doors.', ['B. DJ/Vendors'], 'medium', false, false, null],
  [260, 'Xenon Electric <billing@xenonelectric.example>', 'Payment received', 'Autopay of $91.40 processed.', ['A. Financial/Bills'], 'low', false, false, null],
]

const NEWSLETTER = `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:24px 0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;font-family:Georgia,serif;color:#222">
<tr><td style="padding:28px 32px 8px;font:700 26px Georgia,serif">The Morning Brief</td></tr>
<tr><td style="padding:0 32px 18px;color:#777;font:14px Arial,sans-serif">Five stories worth your time this weekend</td></tr>
<tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e6e2da"></td></tr>
<tr><td style="padding:18px 32px;font:16px/1.6 Georgia,serif"><b>1. The quiet comeback of the paper map.</b> Why hikers are carrying them again, and what apps still get wrong about trailheads.</td></tr>
<tr><td style="padding:0 32px 18px;font:16px/1.6 Georgia,serif"><b>2. A city that plants a tree for every baby born.</b> Ten years in, the canopy is measurable from space.</td></tr>
<tr><td style="padding:0 32px 18px;font:16px/1.6 Georgia,serif"><b>3. The crossword.</b> This week's theme is hidden in the long answers. <a href="https://example.com/crossword" style="color:#b0452c">Play it here</a>.</td></tr>
<tr><td style="padding:16px 32px 28px;color:#999;font:12px Arial,sans-serif">You're receiving this because you subscribed. <a href="https://example.com/unsubscribe" style="color:#999">Unsubscribe</a></td></tr>
</table></td></tr></table>`

function bodyHtml(kind, plain, subject) {
  if (kind === 'newsletter') return NEWSLETTER
  if (plain) return `<div dir="ltr">${plain.split('\n').map((l) => (l ? `<div>${escape(l)}</div>` : '<div><br></div>')).join('')}</div>`
  return `<div style="font-family:Arial,sans-serif;max-width:560px">
<p style="font-size:18px;font-weight:700;margin:0 0 12px">${escape(subject)}</p>
<p>This is a sample notification used in the inbox demo. In your real inbox, the full email from Gmail appears here, with its own layout and images.</p>
<p><a href="https://example.com" style="display:inline-block;background:#1d5fa8;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none">View details</a></p>
</div>`
}

function escape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function parseFrom(raw) {
  const m = /^(.*?)\s*<([^>]+)>$/.exec(raw)
  return m ? [m[1].replace(/"/g, ''), m[2].toLowerCase()] : [raw, raw]
}

const dayOf = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export function createMockApi({ now = () => Date.now(), delay = 260 } = {}) {
  const t0 = now()
  const messages = new Map()
  const bodies = new Map()
  const events = []          // {day, kind, id}
  const batches = []
  let lastExport = {}         // id → the sample email behind each exported block
  let settings = {
    prompt: '', people: PEOPLE, labels: [], batch_size: 50, query: '', review_first: true,
    keep_people_in_inbox: true, keep_highlights_unread: true, block_images: false,
    rollup_imported: 0,
  }
  let waiting = 23

  // The five earlier sorts that filed the sample mail, oldest first: [hours ago, source].
  const SORTS = [[196, 'claude'], [100, 'sheet'], [49, 'claude'], [19, 'wegter-pc'], [0.78, 'claude']]
  const sortOf = (h) => (h < 10 ? 4 : h < 48 ? 3 : h < 100 ? 2 : h < 180 ? 1 : 0)
  SEED.forEach(([h, from, subject, summary, labels, importance, personal, inInbox, body], i) => {
    const id = `demo-${(0x1a2b3c + i * 977).toString(16)}`
    const at = new Date(t0 - h * H)
    const [name, email] = parseFrom(from)
    const [sortH, source] = SORTS[sortOf(h)]
    const sortedAt = new Date(t0 - sortH * H)
    const read = h > 30 ? i % 3 !== 0 : (i === 3 || i === 5 || i === 8)
    messages.set(id, {
      id, message_id: 'm' + id, from_name: name, from_email: email, subject, summary,
      snippet: (typeof body === 'string' && body !== 'newsletter' ? body : summary).slice(0, 200),
      labels, importance, personal, in_inbox: inInbox, gmail_unread: !read && inInbox && (importance === 'high' || personal),
      starred: i === 1, message_count: i === 12 ? 3 : 1, date: at.toISOString(), sorted_at: sortedAt.toISOString(),
      // Older reads happened long ago (keeps "read today" to the latest sort's three).
      source, batch_id: sortOf(h) + 1, read, read_at: read ? new Date(h > 30 ? at.getTime() + 0.4 * H : sortedAt.getTime()).toISOString() : null,
      pinned: i === 1 || i === 15, pinned_at: i === 1 || i === 15 ? new Date(t0 - i * H).toISOString() : null,
      trashed: false,
    })
    bodies.set(id, { kind: body === 'newsletter' ? 'newsletter' : null, plain: body !== 'newsletter' ? body : null, from, at })
  })
  // History for the 14-day chart.
  const pattern = [38, 52, 41, 47, 12, 9, 44, 50, 39, 46, 55, 14, 11, 26]
  const readPattern = [9, 14, 8, 12, 4, 3, 11, 15, 7, 10, 13, 5, 2, 0]
  for (let i = 13; i >= 0; i--) {
    const day = dayOf(t0 - i * 24 * H)
    for (let n = 0; n < pattern[13 - i]; n++) events.push({ day, kind: 'sorted', id: `h${i}-${n}` })
    for (let n = 0; n < readPattern[13 - i]; n++) events.push({ day, kind: 'read', id: `h${i}-${n}` })
    for (let n = 0; n < Math.round(readPattern[13 - i] / 2); n++) events.push({ day, kind: 'archive', id: `h${i}-${n}` })
  }
  for (const m of messages.values()) if (m.read && dayOf(m.read_at) === dayOf(t0)) events.push({ day: dayOf(t0), kind: 'read', id: m.id })

  // One finished batch per sort; only the latest has a note.
  const LATEST_NOTE = 'Mom asked about hosting Thanksgiving and a couple wrote about a June 2027 wedding; both need a reply. Your timesheet is due at 5 and Friday\'s flight is open for check-in. The rest was receipts, statements and newsletters, now archived.'
  SORTS.forEach(([sortH, source], i) => {
    const n = SEED.filter(([h]) => sortOf(h) === i)
    batches.push({
      id: i + 1, created_at: new Date(t0 - (sortH + 0.02) * H).toISOString(), finished_at: new Date(t0 - sortH * H).toISOString(),
      day: dayOf(t0 - sortH * H), source, status: 'done', step: '', total: n.length, applied: n.length,
      archived: n.filter((x) => !x[7]).length, important: n.filter((x) => x[5] === 'high').length, personal: n.filter((x) => x[6]).length,
      missing: 0, errored: 0, message: `Applied ${n.length} of ${n.length} threads.`,
      summary: i === SORTS.length - 1 ? LATEST_NOTE : '', error: '', proposal: null,
    })
  })

  const list = () => [...messages.values()].filter((m) => !m.trashed)
  const byDate = (a, b) => (a.date < b.date ? 1 : -1)
  const hl = (m) => m.importance === 'high' || m.personal
  const clone = (x) => JSON.parse(JSON.stringify(x))
  const reply = async (value) => { await wait(delay); return clone(value) }

  function summary() {
    const today = dayOf(now())
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = dayOf(now() - i * 24 * H)
      const count = (k) => new Set(events.filter((e) => e.day === d && e.kind === k).map((e) => e.id)).size
      days.push({ day: d, sorted: count('sorted'), read: count('read'), cleared: count('archive') + count('trash') })
    }
    const labelCounts = {}
    for (const m of list()) for (const l of m.labels) {
      labelCounts[l] = labelCounts[l] || { name: l, count: 0, unread: 0 }
      labelCounts[l].count++
      labelCounts[l].unread += looksUnread(m) ? 1 : 0
    }
    const running = batches.find((b) => b.status === 'running' || b.status === 'applying')
    return {
      today: days.find((d) => d.day === today),
      days,
      highlights: { unread: list().filter((m) => hl(m) && !m.read).length, total: list().filter(hl).length },
      in_inbox: list().filter((m) => m.in_inbox).length,
      sorted_total: list().length,
      labels: Object.values(labelCounts).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      pins: list().filter((m) => m.pinned).sort((a, b) => (a.pinned_at < b.pinned_at ? 1 : -1)),
      latest_batch: [...batches].reverse().find((b) => b.status === 'done' || b.status === 'review') || null,
      running_batch: running || null,
      gmail: { inbox_unread: 4, waiting, waiting_capped: false },
      configured: { script: true },
      settings: { block_images: settings.block_images, review_first: settings.review_first, batch_size: settings.batch_size },
      now: new Date(now()).toISOString(),
      local_day: today,
    }
  }

  function filtered({ view = 'highlights', label, q }) {
    let items = list()
    if (view === 'highlights') items = items.filter((m) => hl(m) && (!m.read || now() - new Date(m.date) < 14 * 24 * H))
    if (view === 'recent') items = items.filter((m) => now() - new Date(m.sorted_at) < 7 * 24 * H)
    if (view === 'pinned') items = items.filter((m) => m.pinned)
    if (view === 'inbox') items = items.filter((m) => m.in_inbox)
    if (label) items = items.filter((m) => m.labels.includes(label))
    if (q) {
      const s = q.toLowerCase()
      items = items.filter((m) => [m.subject, m.from_name, m.from_email, m.summary, m.snippet].some((x) => (x || '').toLowerCase().includes(s)))
    }
    if (view === 'recent') return items.sort((a, b) => (a.sorted_at === b.sorted_at ? byDate(a, b) : a.sorted_at < b.sorted_at ? 1 : -1))
    return items.sort(view === 'pinned' ? (a, b) => (a.pinned_at < b.pinned_at ? 1 : -1) : byDate)
  }

  function runBatch(batch, steps, finish) {
    let i = 0
    const tick = () => {
      if (i < steps.length) {
        batch.step = steps[i++]
        setTimeout(tick, 900)
      } else finish()
    }
    tick()
  }

  function proposalFor(n) {
    const senders = [
      ['Marcus Lee <marcus.lee@example.com>', 'Bowling shirts are in', 'Says the league shirts arrived; pick yours up Thursday.', ['A. Personal'], 'medium', true, false],
      ['Northwind Credit Union <alerts@northwind-cu.example>', 'Large purchase alert: $612.40', 'Card purchase of $612.40 at an electronics store; confirm if it was you.', ['A. Financial/Security'], 'high', false, false],
      ['The Morning Brief <newsletter@morningbrief.example>', 'Sunday edition', 'Weekend newsletter.', ['A. Read'], 'low', false, true],
      ['Orchard Books <orders@orchardbooks.example>', 'Delivered: your order', 'Package delivered to the front door.', ['A. Shopping/Receipts'], 'low', false, true],
      ['Hannah Ortiz <hannah.ortiz@example.com>', 'Rehearsal dinner music?', 'A past client asks if you can DJ her sister\'s rehearsal dinner on May 2.', ['B. DJ/Inquiries'], 'high', false, false],
    ]
    return Array.from({ length: n }, (_, i) => {
      const [from, subject, summary, labels, importance, personal, archive] = senders[i % senders.length]
      return { id: `new-${Date.now().toString(36)}-${i}`, from, subject: i < senders.length ? subject : `${subject} (${i})`, date: new Date(now() - i * 0.3 * H).toISOString(), snippet: summary, summary, labels, importance, personal, archive_ok: archive }
    })
  }

  function applyActions(batch, actions, source) {
    const at = new Date(now())
    for (const a of actions) {
      // Like the server: highlights kept in the inbox stay unread in Gmail until opened here.
      const keepUnread = a.keep_unread ?? (settings.keep_highlights_unread && hl(a) && !a.archive_ok)
      const [name, email] = parseFrom(a.from || 'Sender <sender@example.com>')
      messages.set(a.id, {
        id: a.id, message_id: 'm' + a.id, from_name: name, from_email: email, subject: a.subject || '(no subject)',
        summary: a.summary, snippet: a.summary, labels: a.labels, importance: a.importance, personal: !!a.personal,
        in_inbox: !a.archive_ok, gmail_unread: !!keepUnread, starred: false, message_count: 1,
        date: a.date || at.toISOString(), sorted_at: at.toISOString(), source, batch_id: batch.id,
        read: false, read_at: null, pinned: false, pinned_at: null, trashed: false,
      })
      bodies.set(a.id, { plain: a.summary, from: a.from, at: new Date(a.date || at) })
      events.push({ day: dayOf(at), kind: 'sorted', id: a.id })
    }
    Object.assign(batch, {
      status: 'done', step: '', applied: actions.length, archived: actions.filter((a) => a.archive_ok).length,
      important: actions.filter((a) => a.importance === 'high').length, personal: actions.filter((a) => a.personal).length,
      finished_at: at.toISOString(), message: `Applied ${actions.length} of ${actions.length} threads.`,
    })
    waiting = Math.max(0, waiting - actions.length)
  }

  function newBatch(source, extra = {}) {
    const b = { id: batches.length + 1, created_at: new Date(now()).toISOString(), finished_at: null, day: dayOf(now()), source, status: 'running', step: 'Starting', total: 0, applied: 0, archived: 0, important: 0, personal: 0, missing: 0, errored: 0, summary: '', message: '', error: '', proposal: null, ...extra }
    batches.push(b)
    return b
  }

  return {
    demo: true,
    summary: () => reply(summary()),
    messages: (params) => reply({ view: params.view, items: filtered(params), total: filtered(params).length, next_offset: null }),
    live: () => reply({ items: list().filter((m) => m.in_inbox).sort(byDate), inbox_unread: 4, complete: true, fetched_at: new Date(now()).toISOString() }),
    status: () => reply({ inbox_unread: 4, waiting, waiting_capped: false, checked_at: new Date(now()).toISOString() }),
    async thread(id) {
      await wait(delay + 150)
      const m = messages.get(id)
      const b = bodies.get(id) || {}
      if (!m) throw Object.assign(new Error('That email is no longer in Gmail.'), { status: 404 })
      const msgs = [{ id: m.message_id, from: b.from || `${m.from_name} <${m.from_email}>`, to: 'Michael <michael@example.com>', cc: '', date: m.date, subject: m.subject, html: bodyHtml(b.kind, b.plain, m.subject), plain: b.plain || m.summary, attachments: m.subject.includes('Photos') ? [{ name: 'dock.jpg', size: 482113, type: 'image/jpeg' }, { name: 'sunset.jpg', size: 391022, type: 'image/jpeg' }] : [] }]
      return clone({ thread: { id, subject: m.subject, permalink: 'https://mail.google.com/mail/u/0/#all/' + id, labels: m.labels, inInbox: m.in_inbox, starred: m.starred, messages: msgs }, message: m, cached: false })
    },
    async act(ids, action, labels = []) {
      await wait(delay)
      const day = dayOf(now())
      for (const id of ids) {
        const m = messages.get(id)
        if (!m) continue
        if (action === 'read') { if (!m.read) { m.read = true; m.read_at = new Date(now()).toISOString() } m.gmail_unread = false; events.push({ day, kind: 'read', id }) }
        if (action === 'unread') { m.read = false; m.read_at = null; m.gmail_unread = true }
        if (action === 'pin') { m.pinned = true; m.pinned_at = new Date(now()).toISOString() }
        if (action === 'unpin') { m.pinned = false; m.pinned_at = null }
        if (action === 'archive') { m.in_inbox = false; m.read = true; events.push({ day, kind: 'archive', id }) }
        if (action === 'inbox') m.in_inbox = true
        if (action === 'star') m.starred = true
        if (action === 'unstar') m.starred = false
        if (action === 'trash') { m.trashed = true; m.in_inbox = false; m.pinned = false }
        if (action === 'add_labels') m.labels = [...new Set([...m.labels, ...labels])]
        if (action === 'remove_labels') m.labels = m.labels.filter((l) => !labels.includes(l))
      }
      return clone({ action, updated: ids.map((id) => messages.get(id)).filter(Boolean), failed: {} })
    },
    settings: () => reply({ ...settings, default_prompt: 'You sort Michael\'s Gmail. (The real default prompt comes from the server.)', prompt_is_default: !settings.prompt, detected_labels: [...new Set(list().flatMap((m) => m.labels))].sort() }),
    async saveSettings(changes) { settings = { ...settings, ...changes }; return this.settings() },
    labels: () => reply({ labels: [...new Set(list().flatMap((m) => m.labels))].sort(), gmail: [], used: [], error: null }),
    async exportEmails(limit = 50) {
      await wait(delay + 300)
      const items = proposalFor(Math.min(limit, waiting || 5))
      lastExport = Object.fromEntries(items.map((it) => [it.id, it]))
      const prompt = 'You sort Michael\'s Gmail. (Sample prompt: the real one comes from your settings.)'
      const blocks = items.map((it, i) => `---EMAIL-${i + 1}---\nID: ${it.id}\nFrom: ${it.from}\nSubject: ${it.subject}\nDate: ${it.date}\nBody: ${it.snippet}\n`)
      return { count: items.length, text: `${prompt}\n\nEMAILS (${items.length})\n\n${blocks.join('\n')}`, prompt, blocks, items: items.map(({ id, from, subject, date }) => ({ id, from, subject, date })) }
    },
    async applySorted({ json, actions, summary = '', source = 'claude', review = false } = {}) {
      await wait(delay)
      if (!actions) {
        let parsed
        try { parsed = JSON.parse(String(json).trim().replace(/^```[a-z]*\s*|\s*```$/g, '')) } catch { throw Object.assign(new Error("That isn't valid JSON. Copy Claude's whole reply, from the first [ or { to the last ] or }."), { status: 400 }) }
        actions = (Array.isArray(parsed) ? parsed : parsed.actions || []).filter((a) => a.id)
        summary = (!Array.isArray(parsed) && parsed.summary) || summary
      }
      if (!actions.length) throw Object.assign(new Error('No sorted emails came back.'), { status: 400 })
      const known = (a) => lastExport[a.id] || { from: 'Sender <sender@example.com>', subject: a.summary || a.id, date: new Date(now()).toISOString(), snippet: '' }
      const full = actions.map((a) => ({ ...a, from: known(a).from, subject: known(a).subject, date: known(a).date, snippet: known(a).snippet }))
      if (review) {
        batches.filter((x) => x.status === 'review').forEach((x) => { x.status = 'discarded' })
        return clone({ batch: newBatch(source, { status: 'review', step: '', total: full.length, summary, proposal: { actions: full, summary } }) })
      }
      const b = newBatch(source, { total: full.length, summary })
      runBatch(b, [`Applying labels to ${full.length} emails in Gmail`], () => applyActions(b, full, source))
      return clone({ batch: b })
    },
    batches: () => reply({ batches: [...batches].reverse() }),
    batch: (id) => reply({ batch: batches.find((b) => b.id === id) }),
    async applyReviewed(id, { actions, skip = [] } = {}) {
      await wait(delay)
      const b = batches.find((x) => x.id === id)
      const chosen = (actions || b.proposal.actions).filter((a) => !skip.includes(a.id))
      Object.assign(b, { status: 'applying', step: `Applying labels to ${chosen.length} emails in Gmail`, total: chosen.length })
      runBatch(b, [], () => applyActions(b, chosen, b.source))
      return clone({ batch: b })
    },
    async discard(id) { const b = batches.find((x) => x.id === id); b.status = 'discarded'; return reply({ batch: b }) },
    async importHistory() {
      const b = newBatch('import')
      runBatch(b, ['Reading Rollup rows from 1'], () => Object.assign(b, { status: 'done', step: '', applied: 0, message: 'Imported 0 emails from the Rollup sheet. (Demo)' }))
      return reply({ batch: b })
    },
    connection: () => reply({ script: { configured: true, url: 'https://script.google.com/macros/s/AKfycb…demo/exec', ok: true, version: 1, query: 'label:inbox is:unread newer_than:150d', inbox_unread: 4, reports_to: 'https://api.michaelwegter.com/inbox/ingest' } }),
    // A pretend wegter-pc: answers from what the export "really" contains, a few seconds per call.
    localAi: {
      health: () => reply({ ok: true, model: 'google/gemma-4-12b-qat', model_ready: true, models: ['google/gemma-4-12b-qat'], busy: false }),
      async sort({ ids }) {
        await wait(delay * 3)
        const actions = ids.filter((id) => lastExport[id]).map((id) => {
          const { summary, labels, importance, personal, archive_ok } = lastExport[id]
          return { id, summary, labels, importance, personal, archive_ok }
        })
        return { actions, summary: '', model: 'google/gemma-4-12b-qat', seconds: 4.2, missing: [] }
      },
      summarize: () => reply({ summary: 'A bank alert about a $612 purchase and a rehearsal-dinner inquiry need you. Marcus says the bowling shirts are in. The rest is newsletters and delivery notices.' }),
    },
  }
}
