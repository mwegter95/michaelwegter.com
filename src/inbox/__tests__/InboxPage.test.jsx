import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SiteAuthProvider } from '../../auth/SiteAuth'
import InboxPage, { Inbox } from '../InboxPage'
import { createMockApi } from '../mock'
import { GMAIL_EVERY_MS } from '../useInbox'

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

  it('chooses one or several sorts to see only their mail', async () => {
    renderInbox()
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: 'Recently sorted' }))
    await screen.findByText('via wegter-pc · 7 emails · 2 in inbox')
    fireEvent.click(screen.getByRole('button', { name: 'All sorts' }))
    const picker = await screen.findByRole('dialog', { name: 'Choose sorts' })
    const row = (meta) => within(picker).getByText(meta).closest('label')
    fireEvent.click(within(await waitFor(() => row('via wegter-pc · 7 emails · 2 in inbox'))).getByRole('checkbox'))
    await waitFor(() => expect(screen.queryByText('Thanksgiving plans')).not.toBeInTheDocument())
    expect(screen.getByText('Photos from the lake')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 sort' })).toBeInTheDocument()
    fireEvent.click(within(row('via Claude · 9 emails · 5 in inbox')).getByRole('checkbox'))
    expect(await screen.findByText('Thanksgiving plans')).toBeInTheDocument()
    const chips = screen.getByRole('group', { name: 'Showing only these sorts' })
    expect(chips.querySelectorAll('.ibx-sortchip')).toHaveLength(2)
    expect(screen.queryByText('Leaf pickup starts Oct 20')).toBeInTheDocument() // wegter-pc's sort
    expect(screen.queryByText('Payment received')).not.toBeInTheDocument()
    fireEvent.click(within(picker).getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog', { name: 'Choose sorts' })).not.toBeInTheDocument()
    fireEvent.click(within(chips).getByRole('button', { name: 'Show all sorts' }))
    expect(await screen.findByText('via the Sheet · 3 emails')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Showing only these sorts' })).not.toBeInTheDocument()
  })

  it('picks a sort from its heading to see it alone with its note', async () => {
    renderInbox()
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: 'Recently sorted' }))
    const only = await screen.findAllByRole('button', { name: /^Show only the .* sort$/ })
    fireEvent.click(only[0])
    expect(await screen.findByText(/^From (today|yesterday)’s .* sort$/)).toBeInTheDocument()
    expect(screen.getByLabelText('Notes from this sort')).toHaveTextContent('Mom asked about hosting Thanksgiving')
    expect(screen.queryByText('Photos from the lake')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'All sorted' }))
    expect(await screen.findByText('Photos from the lake')).toBeInTheDocument() // switching views starts over
    fireEvent.click(screen.getByRole('button', { name: 'All sorts' }))
    const picker = await screen.findByRole('dialog', { name: 'Choose sorts' })
    expect(await within(picker).findByText('via Claude · 2 emails')).toBeInTheDocument() // 8 days ago: All sorted only
  })

  it('narrows highlights to the sorts you pick', async () => {
    renderInbox()
    await screen.findByText('Thanksgiving plans')
    expect(screen.getByText('Photos from the lake')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'All sorts' }))
    const picker = await screen.findByRole('dialog', { name: 'Choose sorts' })
    expect(within(picker).getByText('Sorts with highlights')).toBeInTheDocument()
    const row = await within(picker).findByText('via Claude · 1 highlight') // three days ago: a bank sign-in alert
    fireEvent.click(within(row.closest('label')).getByRole('checkbox'))
    expect(await screen.findByText('New sign-in from Chrome on Mac')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Thanksgiving plans')).not.toBeInTheDocument())
    expect(screen.queryByText('Photos from the lake')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Showing only these sorts' })).toBeInTheDocument()
  })

  it('says the server may be out of date when it doesn’t know about sorts', async () => {
    const api = createMockApi({ delay: 0 })
    api.sorts = async () => { throw Object.assign(new Error("Can't reach the server. Check your connection and try again."), { status: 0 }) }
    renderInbox(api)
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: 'All sorts' }))
    const picker = await screen.findByRole('dialog', { name: 'Choose sorts' })
    expect(await within(picker).findByText(/still running an older version/)).toBeInTheDocument()
    expect(within(picker).getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('when Gmail’s daily limit is used up, says so calmly and keeps the last counts', async () => {
    const api = createMockApi({ delay: 0 })
    const status = api.status
    api.status = async (refresh) => ({ ...(await status(refresh)), quota: true, error: 'used up' })
    renderInbox(api)
    expect(await screen.findByText('Gmail’s daily limit is used up.')).toBeInTheDocument()
    expect(screen.getByText('Gmail’s daily limit is used up.').closest('.ibx-problem')).toHaveTextContent('20,000 Gmail reads a day')
    expect(screen.queryByText('Gmail didn’t answer.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Sort 23 new$/ })).toBeInTheDocument() // the held count still shows
  })

  it('asks Gmail every ten minutes, and not at all while the tab is hidden', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    try {
      const api = createMockApi({ delay: 0 })
      const status = vi.spyOn(api, 'status')
      renderInbox(api)
      await screen.findByText('Thanksgiving plans')
      expect(status).toHaveBeenCalledTimes(1)
      await act(async () => { vi.advanceTimersByTime(GMAIL_EVERY_MS - 1000) })
      expect(status).toHaveBeenCalledTimes(1)
      await act(async () => { vi.advanceTimersByTime(1000) })
      expect(status).toHaveBeenCalledTimes(2)
      hidden.mockReturnValue(true)
      await act(async () => { vi.advanceTimersByTime(GMAIL_EVERY_MS * 3) })
      expect(status).toHaveBeenCalledTimes(2)
      hidden.mockReturnValue(false)
      await act(async () => { document.dispatchEvent(new Event('visibilitychange')) })
      expect(status).toHaveBeenCalledTimes(3) // caught up once on coming back
    } finally {
      hidden.mockRestore()
      vi.useRealTimers()
    }
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
    // Review rows show each email's own opening text (the export's snippet), not a model-written summary.
    expect(screen.getAllByText('Says the league shirts arrived; pick yours up Thursday.').length).toBeGreaterThan(0)
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Include this email' })[0])
    fireEvent.click(screen.getByRole('button', { name: /Apply to 22 emails/ }))
    expect(await screen.findByText('Done.', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Done.').closest('.ibx-result')).toHaveTextContent('Sorted 22 emails')
    await waitFor(() => expect(screen.getByText(/Triage sorted 48 emails today/)).toBeInTheDocument())
  })

  it('sends wegter-pc several batches at once and keeps the export order', async () => {
    const api = createMockApi({ delay: 0 })
    const real = api.localAi.sort
    let inFlight = 0
    let most = 0
    const finishOrder = []
    api.localAi.sort = async (part, signal) => {
      inFlight++
      most = Math.max(most, inFlight)
      // the first batch is the slowest, so later ones come back before it
      await new Promise((r) => setTimeout(r, part.ids[0].endsWith('-0') ? 60 : 10))
      inFlight--
      finishOrder.push(part.ids[0])
      return real(part, signal)
    }
    const summarize = vi.spyOn(api.localAi, 'summarize')
    const apply = vi.spyOn(api, 'applySorted')
    renderInbox(api)
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    fireEvent.click(screen.getByRole('tab', { name: 'Sort on wegter-pc' }))
    expect(await screen.findByText(/groups of 8, 4 groups at once/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sort 50 emails on wegter-pc' }))
    await screen.findByText('Nothing has changed in Gmail yet. Adjust anything that looks off, then apply.', {}, { timeout: 4000 })
    expect(most).toBe(3) // 23 emails make 3 batches, all in flight together
    expect(finishOrder[finishOrder.length - 1]).toMatch(/-0$/)
    const sent = apply.mock.calls[0][0].actions.map((a) => a.id)
    expect(sent).toHaveLength(23)
    expect(sent[0]).toMatch(/-0$/) // export order, not the order the answers came back in
    expect(apply.mock.calls[0][0].actions.every((a) => !('summary' in a) || !a.summary)).toBe(true)
    // The batch note is written from the emails' own subjects and opening text.
    const lines = summarize.mock.calls[0][0]
    expect(lines[0]).toBe('Marcus Lee: Bowling shirts are in (medium). Says the league shirts arrived; pick yours up Thursday.')
  })

  it('sends one batch at a time to an older wegter-pc that does not say how many it takes', async () => {
    const api = createMockApi({ delay: 0 })
    const health = api.localAi.health
    api.localAi.health = async () => { const h = await health(); delete h.parallel; return h }
    const real = api.localAi.sort
    let inFlight = 0
    let most = 0
    api.localAi.sort = async (part, signal) => {
      inFlight++; most = Math.max(most, inFlight)
      await new Promise((r) => setTimeout(r, 10))
      inFlight--
      return real(part, signal)
    }
    renderInbox(api)
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    fireEvent.click(screen.getByRole('tab', { name: 'Sort on wegter-pc' }))
    expect(await screen.findByText(/wegter-pc is ready/)).toBeInTheDocument()
    expect(screen.queryByText(/groups at once/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sort 50 emails on wegter-pc' }))
    await screen.findByText('Nothing has changed in Gmail yet. Adjust anything that looks off, then apply.', {}, { timeout: 4000 })
    expect(most).toBe(1)
  })

  it('stops the other batches when one fails, and says why', async () => {
    const api = createMockApi({ delay: 0 })
    const signals = []
    api.localAi.sort = async (part, signal) => {
      signals.push(signal)
      await new Promise((r) => setTimeout(r, 10))
      if (part.ids[0].endsWith('-8')) throw Object.assign(new Error('LM Studio answered HTTP 500: boom'), { status: 424, body: { code: 'lmstudio_error' } })
      await new Promise((r) => setTimeout(r, 40))
      return { actions: [] }
    }
    const apply = vi.spyOn(api, 'applySorted')
    renderInbox(api)
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    fireEvent.click(screen.getByRole('tab', { name: 'Sort on wegter-pc' }))
    await screen.findByText(/wegter-pc is ready/)
    fireEvent.click(screen.getByRole('button', { name: 'Sort 50 emails on wegter-pc' }))
    expect(await screen.findByText('LM Studio answered HTTP 500: boom', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(signals.every((s) => s.aborted)).toBe(true)
    expect(apply).not.toHaveBeenCalled()
  })

  it('shows each email’s own opening text in the list, not the triage summary', async () => {
    renderInbox()
    const row = (await screen.findByText('Thanksgiving plans')).closest('article')
    expect(within(row).getByText(/Hi honey,/)).toBeInTheDocument()
    expect(within(row).queryByText(/Asks whether you can host/)).not.toBeInTheDocument()
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
