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
        <Inbox api={api} demo={false} />
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

  it('sorts with AI, shows the review, applies it and refreshes', async () => {
    renderInbox(createMockApi({ delay: 0 }))
    await screen.findByText('Thanksgiving plans')
    fireEvent.click(screen.getByRole('button', { name: /Sort 23 new/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Sort 50 emails' }))
    expect(await screen.findByText('Nothing has changed in Gmail yet. Adjust anything that looks off, then apply.', {}, { timeout: 4000 })).toBeInTheDocument()
    // skip the first email
    const first = screen.getAllByRole('checkbox', { name: 'Include this email' })[0]
    fireEvent.click(first)
    fireEvent.click(screen.getByRole('button', { name: /Apply to 22 emails/ }))
    expect(await screen.findByText('Done.', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Done.').closest('.ibx-result')).toHaveTextContent('Sorted 22 emails')
    await waitFor(() => expect(screen.getByText(/Triage sorted 48 emails today/)).toBeInTheDocument())
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
})
