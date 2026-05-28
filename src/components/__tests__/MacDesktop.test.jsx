/**
 * First test for the repo.
 *
 * Scenario (the bug this captures): on mobile the Macintosh "desktop" status
 * bar was absolutely positioned over the icon grid, so the bottommost app
 * (its name + glyph) got covered when the bar expanded on hover/tap.
 *
 * The fix makes `.mac-screen-inner` a flex column with the icon grid and the
 * status bar as in-flow siblings, so the bar always reserves its own height
 * beneath the icons and can never overlap them.
 *
 * jsdom doesn't compute geometric layout, so we verify the contract two ways:
 *   1. Behavior  — every app renders, and activating an icon surfaces that
 *                  app's full description in the status bar (nothing clipped).
 *   2. Structure — the status bar is a normal-flow flex child after the grid
 *                  (asserted against the DOM and the actual CSS rules), i.e.
 *                  it is NOT position:absolute over the icons anymore.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import MacDesktop from '../MacDesktop.jsx'
import { apps } from '../../data/apps.js'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, '../../index.css'), 'utf8')

/** Return the declaration block of the first CSS rule matching `selector {`. */
function ruleBody(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = css.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'))
  return m ? m[1] : null
}

function renderMac() {
  return render(
    <MemoryRouter>
      <MacDesktop showAll />
    </MemoryRouter>
  )
}

function iconFor(app) {
  return screen.getAllByText(app.title)[0].closest('.mac-icon')
}

describe('MacDesktop — icons and status bar coexist without overlap', () => {
  it('renders every app as an icon', () => {
    renderMac()
    apps.forEach(app => {
      expect(screen.getAllByText(app.title).length).toBeGreaterThan(0)
    })
  })

  it('surfaces the full app description in the status bar when an icon is activated', () => {
    renderMac()
    const ld = apps.find(a => a.iconKey === 'life-dashboard')
    fireEvent.mouseEnter(iconFor(ld))

    const statusBar = document.querySelector('.mac-status-bar')
    expect(statusBar).toBeInTheDocument()
    expect(statusBar).toHaveTextContent(ld.title)
    expect(statusBar).toHaveTextContent(ld.category)
    // The whole description must be present (the symptom was it being cut off).
    expect(statusBar).toHaveTextContent(ld.description)
  })

  it('keeps the status bar in normal flow as a flex sibling after the grid (DOM)', () => {
    renderMac()
    const inner = document.querySelector('.mac-screen-inner')
    const desktop = inner?.querySelector('.mac-desktop')
    const bar = inner?.querySelector('.mac-status-bar')

    expect(inner).toBeTruthy()
    expect(desktop?.parentElement).toBe(inner)
    expect(bar?.parentElement).toBe(inner)
    // Status bar comes AFTER the icon grid in document order.
    expect(
      desktop.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('reserves space via flex layout, not an absolute overlay (CSS contract)', () => {
    const inner = ruleBody('.mac-screen-inner')
    const bar = ruleBody('.mac-status-bar')
    const desktop = ruleBody('.mac-desktop')

    expect(inner).toBeTruthy()
    expect(bar).toBeTruthy()
    expect(desktop).toBeTruthy()

    // Container lays its children out in a column…
    expect(inner).toMatch(/display:\s*flex/)
    expect(inner).toMatch(/flex-direction:\s*column/)
    // …the grid takes the remaining space and scrolls if needed…
    expect(desktop).toMatch(/overflow-y:\s*auto/)
    // …and the status bar reserves its own height in flow (NOT absolute).
    expect(bar).not.toMatch(/position:\s*absolute/)
    expect(bar).toMatch(/flex:\s*0\s+0\s+auto/)
  })
})
