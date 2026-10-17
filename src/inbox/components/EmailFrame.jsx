import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { emailDocument } from '../format'

/**
 * Renders one email's HTML in a sandboxed iframe sized to its content.
 * No scripts and no forms run (sandbox has no allow-scripts / allow-forms);
 * allow-same-origin only lets this page measure the height. Links open in a
 * new tab. Remote images can be blocked with a CSP inside the document.
 */
export default function EmailFrame({ message, blockImages }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(120)
  const [showImages, setShowImages] = useState(!blockImages)
  useEffect(() => { setShowImages(!blockImages) }, [blockImages, message?.id])

  const hasRemoteImages = useMemo(() => /<img[^>]+src=["']?https?:/i.test(message?.html || '') ||
    /url\(\s*['"]?https?:/i.test(message?.html || ''), [message?.html])
  const doc = useMemo(() => emailDocument(message, { blockImages: !showImages }), [message, showImages])

  const measure = useCallback(() => {
    const d = ref.current?.contentDocument
    if (!d?.documentElement) return
    const h = Math.max(d.documentElement.scrollHeight, d.body?.scrollHeight || 0)
    if (h) setHeight(Math.min(h + 4, 60000))
  }, [])

  const onLoad = useCallback(() => {
    measure()
    const d = ref.current?.contentDocument
    // Images and web fonts change the height after load.
    d?.addEventListener('load', measure, true)
    ;[150, 600, 1500, 3500].forEach((ms) => setTimeout(measure, ms))
  }, [measure])

  useEffect(() => {
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  return (
    <>
      {!showImages && hasRemoteImages && (
        <p className="ibx-images-off">
          Images from the web are hidden.{' '}
          <button type="button" className="ibx-link-btn" onClick={() => setShowImages(true)}>Show images</button>
        </p>
      )}
      <iframe
        ref={ref}
        title={`Email: ${message?.subject || 'message'}`}
        className="ibx-frame"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        srcDoc={doc}
        onLoad={onLoad}
        style={{ height }}
      />
    </>
  )
}
