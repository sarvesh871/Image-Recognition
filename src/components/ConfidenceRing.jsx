import './ConfidenceRing.css'

/**
 * Signature element: a circular gradient gauge that represents a
 * confidence / grade value. Reused in the navbar mark, gallery
 * cards, and the details modal so recognition confidence always
 * reads the same way across the app.
 */
function ConfidenceRing({ value = 0, size = 40, strokeWidth = 4, tone = 'mid', children }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={`ring ring--${tone}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle
          className="ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="ring__arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <span className="ring__inner">{children}</span>}
    </div>
  )
}

export default ConfidenceRing
