import { useEffect, useRef } from 'react'
import Icon from './Icons'

/** Right-hand sheet (full screen on phones). Esc closes; focus returns to the opener. */
export default function Drawer({ title, onClose, children, footer, wide = false, labelledBy }) {
  const ref = useRef(null)
  useEffect(() => {
    const opener = document.activeElement
    ref.current?.querySelector('[data-autofocus], button, input, textarea, select')?.focus()
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); opener?.focus?.() }
  }, [onClose])
  const id = labelledBy || `ibx-drawer-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className="ibx-drawer-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className={`ibx-drawer${wide ? ' ibx-drawer--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        <header className="ibx-drawer-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="ibx-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </header>
        <div className="ibx-drawer-body">{children}</div>
        {footer && <footer className="ibx-drawer-foot">{footer}</footer>}
      </section>
    </div>
  )
}
