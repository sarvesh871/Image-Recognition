import { memo, useState } from 'react'
import { formatDate, gradeTone } from '../utils/format'
import './ImageCard.css'

function ImageCard({ image, onViewDetails, onPlayAudio }) {
  const [loaded, setLoaded] = useState(false)
  const tone = gradeTone(image.recognitionGrade)

  return (
    <article className="image-card">
      <div className="image-card__media">
        {!loaded && <div className="image-card__skeleton" />}
        <img
          src={image.imageUrl}
          alt={image.featuredObject || 'Recognized image'}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`image-card__img ${loaded ? 'is-loaded' : ''}`}
        />
        <span className={`image-card__badge badge--${tone}`}>
          {image.recognitionGrade || 'Unrated'}
        </span>
      </div>

      <div className="image-card__body">
        <h3 className="image-card__title">{image.featuredObject || 'Unidentified object'}</h3>
        <p className="image-card__summary">{image.summary || 'No summary available yet.'}</p>
        <div className="image-card__date mono">{formatDate(image.captureTimestamp)}</div>

        <div className="image-card__actions">
          <button
            className="image-card__btn image-card__btn--ghost"
            onClick={() => onPlayAudio(image)}
            disabled={!image.audioUrl}
          >
            <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
              <path d="M4 7v6h3l4.5 3.5v-13L7 7H4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M14.5 7.5a3 3 0 010 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Play
          </button>
          <button className="image-card__btn image-card__btn--primary" onClick={() => onViewDetails(image)}>
            View details
          </button>
        </div>
      </div>
    </article>
  )
}

export default memo(ImageCard)
