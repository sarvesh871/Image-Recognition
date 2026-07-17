import { formatConfidence } from '../utils/format'
import ConfidenceRing from './ConfidenceRing'
import './ObjectCard.css'

function ObjectCard({ object }) {
  const confidencePct = object.confidence <= 1 ? object.confidence * 100 : object.confidence
  const tone = confidencePct >= 75 ? 'high' : confidencePct >= 45 ? 'mid' : 'low'

  return (
    <div className="object-card">
      <ConfidenceRing value={confidencePct} size={48} strokeWidth={4} tone={tone}>
        <span className="object-card__ring-text">{Math.round(confidencePct)}</span>
      </ConfidenceRing>

      <div className="object-card__info">
        <div className="object-card__top">
          <h4 className="object-card__name">{object.name}</h4>
          {object.category && <span className="object-card__category">{object.category}</span>}
        </div>

        <div className="object-card__stats">
          <span>
            Confidence <strong>{formatConfidence(object.confidence)}</strong>
          </span>
          {typeof object.count === 'number' && (
            <span>
              Count <strong>{object.count}</strong>
            </span>
          )}
        </div>

        {Array.isArray(object.aliases) && object.aliases.length > 0 && (
          <div className="object-card__aliases">
            {object.aliases.map((alias) => (
              <span key={alias} className="object-card__alias">{alias}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ObjectCard
