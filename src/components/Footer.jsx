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
        </div>
      </div>
    </footer>
  )
}
