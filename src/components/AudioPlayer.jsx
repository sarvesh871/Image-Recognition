import './AudioPlayer.css'

function AudioPlayer({ src, label = 'Audio summary' }) {
  if (!src) {
    return (
      <div className="audio-empty">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <path
            d="M4 15V9a1 1 0 011-1h3l5-4v16l-5-4H5a1 1 0 01-1-1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M17 4l4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p>No audio available for this image.</p>
      </div>
    )
  }

  return (
    <div className="audio-player">
      <div className="audio-player__label">{label}</div>
      <audio controls src={src} preload="none" className="audio-player__el">
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

export default AudioPlayer
