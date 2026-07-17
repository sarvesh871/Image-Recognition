import './LoadingSpinner.css'

function LoadingSpinner({ size = 'md', label }) {
  return (
    <div className={`spinner spinner--${size}`} role="status" aria-live="polite">
      <svg viewBox="0 0 44 44" className="spinner__ring">
        <circle className="spinner__track" cx="22" cy="22" r="19" />
        <circle className="spinner__arc" cx="22" cy="22" r="19" />
      </svg>
      {label && <span className="spinner__label">{label}</span>}
    </div>
  )
}

export default LoadingSpinner
