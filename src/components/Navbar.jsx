import './Navbar.css'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M20 14.3A8.4 8.4 0 019.7 4a8.4 8.4 0 1010.3 10.3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Navbar({ theme, onToggleTheme, imageCount }) {
  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <div className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="34" height="34">
              <defs>
                <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent-1)" />
                  <stop offset="100%" stopColor="var(--accent-2)" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="17" fill="none" stroke="url(#markGrad)" strokeWidth="2.4" opacity="0.35" />
              <circle cx="20" cy="20" r="17" fill="none" stroke="url(#markGrad)" strokeWidth="2.4"
                strokeDasharray="70 100" strokeLinecap="round" transform="rotate(-90 20 20)" />
              <circle cx="20" cy="20" r="6.5" fill="url(#markGrad)" />
            </svg>
          </span>
          <div className="navbar__title">
            <span className="navbar__name">Lucid</span>
            <span className="navbar__tagline">AI Image Recognition</span>
          </div>
        </div>

        <div className="navbar__right">
          {typeof imageCount === 'number' && (
            <span className="navbar__count mono">
              {imageCount} scanned
            </span>
          )}
          <button
            className="navbar__toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className={`navbar__toggle-thumb ${theme === 'dark' ? 'is-dark' : ''}`}>
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
