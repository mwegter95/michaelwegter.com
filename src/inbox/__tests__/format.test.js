import { describe, expect, it } from 'vitest'
import {
  batchSentence, dayKey, dayLabel, emailDocument, groupByDay, groupBySort, initials, isHighlight, labelText,
  looksUnread, sortGroupMeta, sortTimeLabel, timeLabel, todaySentences, waitingSentence,
} from '../format'

const NOW = new Date(2026, 9, 10, 14, 30) // Sat Oct 10 2026, 2:30 PM local

describe('dates', () => {
  it('labels days the way a person would say them', () => {
    expect(dayLabel(dayKey(NOW), NOW)).toBe('Today')
    expect(dayLabel('2026-10-09', NOW)).toBe('Yesterday')
    expect(dayLabel('2026-10-07', NOW)).toBe('Wednesday')
    expect(dayLabel('2026-09-28', NOW)).toBe('Sep 28')
    expect(dayLabel('2025-12-31', NOW)).toBe('Dec 31, 2025')
  })

  it('shows a time today and a date otherwise', () => {
    expect(timeLabel(new Date(2026, 9, 10, 9, 5), NOW)).toBe('9:05 AM')
    expect(timeLabel(new Date(2026, 9, 8, 9, 5), NOW)).toBe('Oct 8')
  })

  it('groups newest-first mail by local day', () => {
    const groups = groupByDay([
      { id: 'a', date: new Date(2026, 9, 10, 9).toISOString() },
      { id: 'b', date: new Date(2026, 9, 10, 8).toISOString() },
      { id: 'c', date: new Date(2026, 9, 9, 22).toISOString() },
    ], NOW)
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([['Today', ['a', 'b']], ['Yesterday', ['c']]])
  })
})

describe('recently sorted', () => {
  const at = (h, m = 0) => new Date(2026, 9, 10, h, m).toISOString()

  it('groups mail by the sort that filed it, newest first', () => {
    const groups = groupBySort([
      { id: 'a', batch_id: 9, sorted_at: at(9, 14), source: 'claude', in_inbox: true },
      { id: 'b', batch_id: 9, sorted_at: at(9, 14), source: 'claude', in_inbox: false },
      { id: 'c', batch_id: 8, sorted_at: at(9, 10), source: 'wegter-pc', in_inbox: false },
      // imported history shares one batch id; ten minutes apart is a different sort
      { id: 'd', batch_id: 2, sorted_at: at(8, 30), source: 'import' },
      { id: 'e', batch_id: 2, sorted_at: at(8, 29), source: 'import' },
      { id: 'f', batch_id: 2, sorted_at: at(7, 0), source: 'import' },
    ], NOW)
    expect(groups.map((g) => g.items.map((i) => i.id))).toEqual([['a', 'b'], ['c'], ['d', 'e'], ['f']])
    expect(groups[0].label).toBe('Today, 9:14 AM')
    expect(sortGroupMeta(groups[0])).toBe('via Claude · 2 emails · 1 in inbox')
    expect(sortGroupMeta(groups[1])).toBe('via wegter-pc · 1 email')
    expect(sortGroupMeta(groups[2])).toBe('Imported · 2 emails')
    expect(sortTimeLabel(new Date(2026, 9, 9, 18, 2), NOW)).toBe('Yesterday, 6:02 PM')
  })

  it('only mail still waiting on Michael looks unread', () => {
    const base = { read: false, in_inbox: false, gmail_unread: false, importance: 'low', personal: false }
    expect(looksUnread(base)).toBe(false) // archived and marked read by triage
    expect(looksUnread({ ...base, in_inbox: true })).toBe(true)
    expect(looksUnread({ ...base, importance: 'high' })).toBe(true)
    expect(looksUnread({ ...base, personal: true })).toBe(true)
    expect(looksUnread({ ...base, gmail_unread: true })).toBe(true) // marked unread on purpose
    expect(looksUnread({ ...base, in_inbox: true, read: true })).toBe(false)
  })
})

describe('words on screen', () => {
  it('writes the day as two sentences', () => {
    expect(todaySentences({ today: { sorted: 47, read: 12 }, highlights: { unread: 3 } }))
      .toEqual(["Triage sorted 47 emails today, and you've read 12.", '3 highlights still need you.'])
    expect(todaySentences({ today: { sorted: 0, read: 1 }, highlights: { unread: 1 } }))
      .toEqual(["You've read 1 email today.", '1 highlight still needs you.'])
    expect(todaySentences({ today: { sorted: 0, read: 0 }, highlights: { unread: 0 } })[0]).toBe('Nothing has been sorted yet today.')
  })

  it('says what Gmail has waiting', () => {
    expect(waitingSentence({ waiting: 23 })).toBe('23 unread emails are waiting in Gmail.')
    expect(waitingSentence({ waiting: 500, waiting_capped: true })).toBe('500+ unread emails are waiting in Gmail.')
    expect(waitingSentence({ waiting: 0 })).toBe('Gmail has nothing new to sort.')
    expect(waitingSentence(null)).toBe('')
  })

  it('summarises a batch', () => {
    expect(batchSentence({ status: 'done', source: 'ai', applied: 50, archived: 41, important: 4, personal: 2 }))
      .toBe('Sorted 50 emails, archived 41, 4 marked important, 2 personal.')
    expect(batchSentence({ status: 'failed', error: 'Gmail is not connected.' })).toBe('Gmail is not connected.')
    expect(batchSentence({ status: 'done', applied: 0, message: 'Nothing new to sort. Inbox is clear.' })).toBe('Nothing new to sort. Inbox is clear.')
  })

  it('reads labels without their ordering prefix', () => {
    expect(labelText('A. Financial/Credit Cards')).toBe('Financial / Credit Cards')
    expect(labelText('Receipts')).toBe('Receipts')
  })

  it('makes initials and spots highlights', () => {
    expect(initials('Priya & Sam')).toBe('PS')
    expect(initials('mom')).toBe('M')
    expect(isHighlight({ importance: 'high' })).toBe(true)
    expect(isHighlight({ importance: 'low', personal: true })).toBe(true)
    expect(isHighlight({ importance: 'medium' })).toBe(false)
  })
})

describe('emailDocument', () => {
  it('locks the email down: no scripts, links open in a new tab, images optional', () => {
    const doc = emailDocument({ html: '<p>Hi</p><img src="https://t.example/p.gif">' }, { blockImages: true })
    expect(doc).toContain("default-src 'none'")
    expect(doc).toContain('img-src data: cid:')
    expect(doc).toContain('<base target="_blank">')
    expect(emailDocument({ html: '<p>x</p>' })).toContain('img-src https: http: data: cid:')
  })

  it('escapes plain-text emails', () => {
    expect(emailDocument({ html: '', plain: '<b>not bold</b>' })).toContain('&lt;b&gt;not bold&lt;/b&gt;')
  })
})
