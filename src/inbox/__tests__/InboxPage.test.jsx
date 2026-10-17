import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SiteAuthProvider } from '../../auth/SiteAuth'
import InboxPage, { Inbox } from '../InboxPage'
import { createMockApi } from '../mock'

function renderInbox(api = createMockApi({ delay: 0 })) {
  render(
    <SiteAuthProvider>
      <MemoryRouter initialEntries={['/apps/inbox']}>
        <Inbox api={api} localAi={api.localAi} demo={false} />
      </MemoryRouter>
    </SiteAuthProvider>,
  )
  return api
}

describe('Inbox dashboard', () => {
  it('keeps the inbox private when not signed in as the owner', () => {
    render(
      <SiteAuthProvider>
        <MemoryRouter initialEntries={['/apps/inbox']}>
          <Routes><Route path="/apps/inbox" element={<InboxPage />} /></Routes>
        </MemoryRouter>
      </SiteAuthProvider>,
    )
    expect(screen.getByText(/private inbox/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Try it with sample mail' })).toHaveAttribute('href', '/apps/inbox?demo=1')
  })

  it('opens on highlights with the day written out, pins on top', async () => {
    renderInbox()
    expect(await screen.findByText(/Triage sorted 26 emails today/)).toBeInTheDocument()
    expect(screen.getByText(/highlights still need you/)).toBeInTheDocument()
    const pins = screen.getByLabelText('Pinned emails')
    expect(within(pins).getByText('Priya & Sam')).toBeInTheDocument()
    expect(await screen.findByText('Thanksgiving plans')).toBeInTheDocument()
    expect(screen.queryByText('30% off fall lawn care')).not.toBeInTheDocument() // low importance isn't a highlight
  })

  it('opening an email reads it and counts it for today', async () => {
    renderInbox()
    const subject = await screen.findByText('Thanksgiving plans')
    expect(screen.getByText(/you've read 3\./)).toBeInTheDocument()
    fireEvent.click(subject)
    expect(await screen.findByText('Triage summary')).toBeInTheDocument()
    expect(await screen.findByTitle('Email: Thanksgiving plans')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/you've read 4\./)).toBeInTheDocument())
  })

  it('mark unread and pin from the reader, with undo', async () => {
    const api = renderInbox()
    fireEvent.click(await screen.findByText('Thanksgiving plans'))
    await screen.findByText('Triage summary')
    const toolbar = screen.getByRole('toolbar', { name: 'Email actions' })
    fireEvent.click(within(toolbar).getByRole('button', { name: /^Pin$/ }))
    const pins = screen.getByLabelText('Pinned emails')
    await waitFor(() => expect(within(pins).getByText('Mom')).toBeInTheDocument())
    const toasts = screen.getAllByRole('status').find((el) => el.classList.contains('ibx-toasts'))
    expect(await within(toasts).findByText('Pinned')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(within(screen.getByLabelText('Pinned emails')).queryByText('Mom')).not.toBeInTheDocument())
    const before = (await api.messages({ view: 'highlights' })).items.find((m) => m.subject === 'Thanksgiving plans')
    expect(before.pinned).toBe(false)
  })

  it('recently sorted groups mail by sort, and archived mail never looks unread', async () => {
    renderInbox()
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: 'Recently sorted' }))
    expect(await screen.findByText('via Claude · 9 emails · 5 in inbox')).toBeInTheDocument()
    expect(screen.getByText('via wegter-pc · 7 emails · 2 in inbox')).toBeInTheDocument()
    expect(screen.getByText('via the Sheet · 3 emails')).toBeInTheDocument()
    expect(screen.queryByText('Payment received')).not.toBeInTheDocument() // sorted 8 days ago
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings[0]).toMatch(/^Today, \d/)
    expect(screen.getByText('Thanksgiving plans').closest('.ibx-row')).toHaveClass('is-unread')
    const promo = screen.getByText('30% off fall lawn care').closest('.ibx-row')
    expect(promo).not.toHaveClass('is-unread')
    fireEvent.click(within(promo).getByRole('button', { name: 'Mark unread' }))
    await waitFor(() => expect(screen.getByText('30% off fall lawn care').closest('.ibx-row')).toHaveClass('is-unread'))
  })

  it('copies for Claude, takes the pasted reply and applies it', async () => {
    renderInbox(createMockApi({ delay: 0 }))
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    expect(screen.getByRole('tab', { name: 'Copy for Claude' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('link', { name: /Open Claude/ })).toHaveAttribute('href', 'https://claude.ai/new')
    fireEvent.click(screen.getByRole('button', { name: 'Copy 50 emails for Claude' }))
    // jsdom has no clipboard, so the text is offered to copy by hand
    const box = await screen.findByText(/Your browser blocked copying/)
    const exported = box.closest('details').querySelector('textarea').value
    const ids = [...exported.matchAll(/^ID: (.+)$/gm)].map((m) => m[1])
    expect(ids).toHaveLength(23)
    const reply = { actions: ids.map((id) => ({ id, labels: ['A. Read'], importance: 'low', personal: false, archive_ok: true, summary: 'x' })), summary: 'All routine.' }
    fireEvent.change(screen.getByRole('textbox', { name: "Claude's reply" }), { target: { value: '```json\n' + JSON.stringify(reply) + '\n```' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply to Gmail' }))
    expect(await screen.findByText('Done.', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Done.').closest('.ibx-result')).toHaveTextContent('Sorted 23 emails, archived 23')
    await waitFor(() => expect(screen.getByText(/Triage sorted 49 emails today/)).toBeInTheDocument())
  })

  it('sorts on wegter-pc a few at a time, shows the review, applies it and refreshes', async () => {
    const api = createMockApi({ delay: 0 })
    const sort = vi.spyOn(api.localAi, 'sort')
    renderInbox(api)
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    fireEvent.click(screen.getByRole('tab', { name: 'Sort on wegter-pc' }))
    expect(await screen.findByText(/wegter-pc is ready/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sort 50 emails on wegter-pc' }))
    expect(await screen.findByText('Nothing has changed in Gmail yet. Adjust anything that looks off, then apply.', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(sort).toHaveBeenCalledTimes(3) // 23 emails, 8 per call
    expect(sort.mock.calls.every(([part]) => part.ids.length <= 8)).toBe(true)
    expect(screen.getByText(/Batch summary from wegter-pc/)).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Include this email' })[0])
    fireEvent.click(screen.getByRole('button', { name: /Apply to 22 emails/ }))
    expect(await screen.findByText('Done.', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Done.').closest('.ibx-result')).toHaveTextContent('Sorted 22 emails')
    await waitFor(() => expect(screen.getByText(/Triage sorted 48 emails today/)).toBeInTheDocument())
  })

  it('says when wegter-pc is unreachable and keeps its button off', async () => {
    const api = createMockApi({ delay: 0 })
    api.localAi.health = async () => { throw new Error('wegter-pc isn’t reachable. It may be asleep or off, or its server isn’t running.') }
    renderInbox(api)
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    fireEvent.click(screen.getByRole('tab', { name: 'Sort on wegter-pc' }))
    expect(await screen.findByText(/may be asleep or off/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sort 50 emails on wegter-pc' })).toBeDisabled()
  })

  it('keyboard: j opens the next email, e archives, ? shows shortcuts', async () => {
    const api = renderInbox()
    await screen.findByText('Thanksgiving plans')
    act(() => { fireEvent.keyDown(window, { key: 'j' }) })
    expect(await screen.findByText('Triage summary')).toBeInTheDocument()
    act(() => { fireEvent.keyDown(window, { key: '?' }) })
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument()
    act(() => { fireEvent.keyDown(window, { key: 'Escape' }) })
    const spy = vi.spyOn(api, 'act')
    act(() => { fireEvent.keyDown(window, { key: 'e' }) })
    await waitFor(() => expect(spy).toHaveBeenCalledWith([expect.any(String)], 'archive', undefined))
  })

  it('shows why Gmail failed instead of a vague line', async () => {
    const api = createMockApi({ delay: 0 })
    api.status = async () => { throw Object.assign(new Error("Apps Script refused the request: Bad signature. GMAIL_SCRIPT_SECRET on the server doesn't match."), { status: 424, body: { code: 'auth' } }) }
    renderInbox(api)
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Gmail didn’t answer.')
    expect(alert).toHaveTextContent('GMAIL_SCRIPT_SECRET')
    expect(within(alert).getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
