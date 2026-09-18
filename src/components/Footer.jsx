export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-copy">
          © {year} Michael Wegter
        </span>
        <div className="footer-links">
          <a
            href="https://github.com/mwegter95"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/michaelwegter"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            LinkedIn
          </a>
          <a href="mailto:mwegter95@gmail.com" className="footer-link">
            Email
          </a>
          {/* Plain static files in public/ — not React routes — so they stay
              reachable (for Google's OAuth review, among others) even if the
              SPA fails to boot. */}
          <a href="/privacy.html" className="footer-link">
            Privacy
          </a>
          <a href="/terms.html" className="footer-link">
            Terms
          </a>
        </div>
      </div>
    </footer>
  )
}
