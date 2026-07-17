import { useEffect, useState } from 'react'
import { getImage } from '../services/api'
import { formatConfidence, formatDate, gradeTone } from '../utils/format'
import Tabs from './Tabs'
import ObjectCard from './ObjectCard'
import AudioPlayer from './AudioPlayer'
import LoadingSpinner from './LoadingSpinner'
import ConfidenceRing from './ConfidenceRing'
import './DetailsModal.css'

const TAB_IDS = {
  SUMMARY: 'summary',
  OBJECTS: 'objects',
  TEXT: 'text',
  AUDIO: 'audio'
}

function DetailsModal({ imageStub, onClose, initialTab = TAB_IDS.SUMMARY }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getImage(imageStub.imageId)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load details for this image.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [imageStub.imageId])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const data = detail || imageStub
  const tone = gradeTone(data.recognitionGrade)
  const objects = detail?.objects || []
  const detectedText = detail?.detectedText || []

  const tabs = [
    { id: TAB_IDS.SUMMARY, label: 'Summary' },
    { id: TAB_IDS.OBJECTS, label: 'Objects', count: objects.length || undefined },
    { id: TAB_IDS.TEXT, label: 'Detected text', count: detectedText.length || undefined },
    { id: TAB_IDS.AUDIO, label: 'Audio' }
  ]

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Image recognition details">
        <button className="modal__close" onClick={onClose} aria-label="Close details">
          ×
        </button>

        <div className="modal__media">
          <img src={data.imageUrl} alt={data.featuredObject || 'Recognized image'} className="modal__image" />
          <div className="modal__media-fade" />
          <div className="modal__media-caption">
            <span className={`modal__grade badge--${tone}`}>{data.recognitionGrade || 'Unrated'}</span>
            <h2 className="modal__heading">{data.featuredObject || 'Unidentified object'}</h2>
            <span className="modal__date mono">{formatDate(data.captureTimestamp)}</span>
          </div>
        </div>

        <div className="modal__content">
          <div className="modal__tabs">
            <Tabs tabs={tabs}  activeTab={activeTab}  onChange={setActiveTab}/>
          </div>

          {loading && (
            <div className="modal__loading">
              <LoadingSpinner size="lg" label="Loading details…" />
            </div>
          )}

          {!loading && error && (
            <div className="modal__error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="modal__tab-panel">
              {activeTab === TAB_IDS.SUMMARY && (
                <div className="summary-grid">
                  <div className="summary-grid__main">
                    <h4>Summary</h4>
                    <p>{data.summary || 'No summary available.'}</p>
                  </div>
                  <div className="summary-grid__stats">
                    <div className="stat-tile">
                      <ConfidenceRing
                        value={data.averageConfidence <= 1 ? data.averageConfidence * 100 : data.averageConfidence || 0}
                        size={56}
                        strokeWidth={5}
                        tone={tone}
                      >
                        <span className="stat-tile__ring-value">
                          {formatConfidence(data.averageConfidence)}
                        </span>
                      </ConfidenceRing>
                      <div>
                        <div className="stat-tile__label">Average confidence</div>
                      </div>
                    </div>
                    <div className="stat-tile stat-tile--row">
                      <div className="stat-tile__label">Recognition grade</div>
                      <span className={`modal__grade badge--${tone}`}>{data.recognitionGrade || 'Unrated'}</span>
                    </div>
                    <div className="stat-tile stat-tile--row">
                      <div className="stat-tile__label">Model version</div>
                      <span className="mono stat-tile__mono">{data.modelVersion || '—'}</span>
                    </div>
                    {Array.isArray(data.categories) && data.categories.length > 0 && (
                      <div className="stat-tile stat-tile--column">
                        <div className="stat-tile__label">Categories</div>
                        <div className="summary-grid__categories">
                          {data.categories.map((cat) => (
                            <span key={cat} className="summary-grid__category-chip">{cat}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === TAB_IDS.OBJECTS && (
                objects.length === 0 ? (
                  <p className="modal__empty-text">No objects detected.</p>
                ) : (
                  <div className="objects-list">
                    {objects.map((object, idx) => (
                      <ObjectCard key={`${object.name}-${idx}`} object={object} />
                    ))}
                  </div>
                )
              )}

              {activeTab === TAB_IDS.TEXT && (
                detectedText.length === 0 ? (
                  <p className="modal__empty-text">No text detected.</p>
                ) : (
                  <ul className="text-list">
                    {detectedText.map((line, idx) => (
                      <li key={idx} className="text-list__item">{line}</li>
                    ))}
                  </ul>
                )
              )}

              {activeTab === TAB_IDS.AUDIO && (
                <AudioPlayer src={data.audioUrl} label={data.featuredObject || 'Audio summary'} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailsModal
