import ImageCard from './ImageCard'
import LoadingSpinner from './LoadingSpinner'
import './Gallery.css'

function EmptyState() {
  return (
    <div className="gallery-empty">
      <div className="gallery-empty__icon">
        <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
          <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17" cy="20" r="3.4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 33l9.5-9.5a3 3 0 014 0L34 35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3>Your gallery is empty</h3>
      <p>Upload your first image above and Lucid will start recognizing it right away.</p>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="gallery-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="gallery-skeleton-card" key={i}>
          <div className="gallery-skeleton-card__media" />
          <div className="gallery-skeleton-card__line" style={{ width: '60%' }} />
          <div className="gallery-skeleton-card__line" style={{ width: '90%' }} />
          <div className="gallery-skeleton-card__line" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  )
}

function Gallery({ images, loading, refreshing, onViewDetails, onPlayAudio }) {
  return (
    <section className="gallery" id="gallery">
      <div className="gallery__header">
        <div>
          <h2 className="gallery__title">Recognition gallery</h2>
          <p className="gallery__subtitle">Every image you've analyzed, newest first.</p>
        </div>
        {refreshing && <LoadingSpinner size="sm" label="Refreshing" />}
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : images.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="gallery-grid">
          {images.map((image) => (
            <ImageCard
              key={image.imageId}
              image={image}
              onViewDetails={onViewDetails}
              onPlayAudio={onPlayAudio}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Gallery
