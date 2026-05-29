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
 * A second, subtler bug then appeared on mobile: with all five icons shown and
 * full (unclamped) labels, the in-flow status bar — once expanded to the
 * longest app description — still pushed the bottom icon out of view because
 * the screen wasn't tall enough and the bar could grow without bound.
 *
 * jsdom doesn't compute geometric layout, so we can't measure overlap directly.
 * Instead we verify the contract three ways:
 *   1. Behavior  — every app renders, and activating an icon surfaces that
 *                  app's full description in the status bar (nothing clipped).
 *   2. Structure — the status bar is a normal-flow flex child after the grid
 *                  (asserted against the DOM and the actual CSS rules), i.e.
 *                  it is NOT position:absolute over the icons anymore.
 *   3. Mobile    — the CSS *mechanisms* that keep every icon visible when the
 *                  bar expands on small screens: the bar's height is capped and
 *                  its overflow scrolls internally (so it can't grow over the
 *                  icons), labels are NOT clamped (full names stay visible), and
 *                  the screen is stretched tall enough to reserve room below.
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

/** Return the declaration block of the first rule matching `selector {` in `source`. */
function ruleBodyIn(source, selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = source.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'))
  return m ? m[1] : null
}

/** Return the declaration block of the first top-level rule matching `selector {`. */
function ruleBody(selector) {
  return ruleBodyIn(css, selector)
}

/** Extract the body of the `@media (max-width: 640px) {…}` block (brace-matched,
 *  since it contains nested rules that a non-greedy `[^}]` match would truncate). */
function mobileBlock() {
  const start = css.search(/@media\s*\(\s*max-width:\s*640px\s*\)/)
  if (start === -1) return null
  const open = css.indexOf('{', start)
  if (open === -1) return null
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i)
  }
  return null
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

describe('MacDesktop — mobile keeps every icon visible when the bar expands (CSS contract)', () => {
  // jsdom can't measure geometry, so we lock in the *mechanisms* that stop the
  // expanded status bar from covering the bottom icon on small screens.
  const mobile = mobileBlock()

  it('has a max-width:640px media block', () => {
    expect(mobile).toBeTruthy()
  })

  it('caps the bar height on mobile and scrolls overflow inside it (not over icons)', () => {
    // Bounded height: the bar can only grow so far before its own content
    // scrolls, so it can never expand without limit down across the icon grid.
    const barMobile = ruleBodyIn(mobile, '.mac-status-bar')
    expect(barMobile).toBeTruthy()
    expect(barMobile).toMatch(/max-height:\s*\d+px/)
    // …and the base rule keeps overflowing description text inside the bar.
    expect(ruleBody('.mac-status-bar')).toMatch(/overflow:\s*auto/)
  })

  it('does NOT clamp icon labels on mobile (full app names must stay visible)', () => {
    // Regression guard for an explicit product requirement: show full names.
    const labelMobile = ruleBodyIn(mobile, '.mac-icon-label')
    expect(labelMobile).toBeTruthy()
    expect(labelMobile).not.toMatch(/line-clamp/)
    expect(labelMobile).not.toMatch(/text-overflow:\s*ellipsis/)
  })

  it('stretches the screen tall enough to reserve room below the icons', () => {
    // The mobile screen height comes from `.mac-top` padding-bottom (% of width).
    // It must be enlarged well past natural proportions so the icon block plus
    // the fully-expanded bar both fit; a regression toward the default re-opens
    // the overlap. 160% is a floor with slack for minor tuning (current: 176%).
    const topMobile = ruleBodyIn(mobile, '.mac-top')
    expect(topMobile).toBeTruthy()
    const m = topMobile.match(/padding-bottom:\s*(\d+)%/)
    expect(m).toBeTruthy()
    expect(Number(m[1])).toBeGreaterThanOrEqual(160)
  })
})
