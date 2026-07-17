import './Toast.css'

function Icon({ type }) {
  if (type === 'error') {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="13.6" r="1" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 10.2l2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="toast-stack" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
          <span className="toast__icon">
            <Icon type={toast.type} />
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
