import { useEffect, useRef } from 'react'

// Subtle matrix rain — ambient atmosphere, not screensaver
export default function MatrixRain({ opacity = 0.35 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let width, height, columns, drops

    function init() {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
      const fontSize = 13
      columns = Math.floor(width / fontSize)
      drops = Array.from({ length: columns }, () => Math.random() * -50)
    }

    function draw() {
      // Very slow fade so trails are long and ghostly
      ctx.fillStyle = 'rgba(8, 8, 9, 0.055)'
      ctx.fillRect(0, 0, width, height)

      ctx.font = '13px JetBrains Mono, monospace'

      for (let i = 0; i < drops.length; i++) {
        // Randomly pick katakana, latin, or binary
        let char
        const r = Math.random()
        if (r < 0.6) {
          // Katakana range
          char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
        } else if (r < 0.85) {
          char = String.fromCharCode(0x21 + Math.floor(Math.random() * 93))
        } else {
          char = String(Math.floor(Math.random() * 2))
        }

        const y = drops[i] * 13

        // Brighter "head" character
        const headBrightness = Math.random() > 0.5 ? 0.9 : 0.5
        ctx.fillStyle = `rgba(0, 255, 136, ${headBrightness})`
        ctx.fillText(char, i * 13, y)

        // Reset with randomized position when out of view
        if (y > height && Math.random() > 0.978) {
          drops[i] = 0
        }
        drops[i] += 0.5  // slow fall speed
      }

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()

    const observer = new ResizeObserver(() => {
      init()
    })
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
