import { useCallback, useRef, useState } from 'react'
import { uploadImage, waitForImage } from "../services/api"
import './UploadCard.css'

function UploadCard({ onUploaded, onError }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | uploading | processing | done
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const pickFile = useCallback((selected) => {
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      onError?.('Please choose an image file.')
      return
    }
    setFile(selected)
    setStatus('idle')
    setProgress(0)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(selected)
  }, [onError])

  const handleInputChange = (e) => {
    pickFile(e.target.files?.[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setProgress(0)
    setStatus('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    try {
      const result = await uploadImage(
          file,
          (pct) => setProgress(pct)
      )
      setStatus("processing")
      await waitForImage(result.imageId)
      setStatus("done")
      await onUploaded?.()
      setTimeout(reset, 1400)
    } catch (err) {
      setStatus('idle')
      onError?.(err.message || 'Upload failed. Please try again.')
    }
  }

  const isBusy = status === 'uploading' || status === 'processing'

  return (
    <div className="upload-card">
      <div className="upload-card__copy">
        <span className="upload-card__eyebrow">Recognition engine</span>
        <h1 className="upload-card__title">
          See what your image
          <span className="upload-card__title-gradient"> is really saying.</span>
        </h1>
        <p className="upload-card__subtitle">
          Drop in a photo and Lucid identifies objects, reads text, and scores its own
          confidence — in seconds.
        </p>
      </div>

      <div
        className={`upload-dropzone ${isDragging ? 'is-dragging' : ''} ${preview ? 'has-preview' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {!preview && (
          <div className="upload-dropzone__empty">
            <div className="upload-dropzone__icon">
              <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
                <path
                  d="M20 26V10m0 0l-6 6m6-6l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 26v3a3 3 0 003 3h18a3 3 0 003-3v-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="upload-dropzone__title">Drag an image here, or choose a file</p>
            <p className="upload-dropzone__hint">JPG, PNG, HEIC — up to 15 MB</p>

            <div className="upload-dropzone__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => inputRef.current?.click()}
              >
                Choose image
              </button>
              <label className="btn btn--ghost">
                Use camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleInputChange}
                  hidden
                />
              </label>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              hidden
            />
          </div>
        )}

        {preview && (
          <div className="upload-preview">
            <div className="upload-preview__image-wrap">
              <img src={preview} alt="Selected upload preview" className="upload-preview__image" />
              {status === 'processing' && (
                <div className="upload-preview__scan" aria-hidden="true" />
              )}
              {!isBusy && status !== 'done' && (
                <button className="upload-preview__remove" onClick={reset} aria-label="Remove selected image">
                  ×
                </button>
              )}
            </div>

            <div className="upload-preview__meta">
              <div className="upload-preview__filename">{file?.name}</div>

              {status === 'idle' && (
                <div className="upload-preview__actions">
                  <button className="btn btn--primary" onClick={handleUpload}>
                    Upload &amp; analyze
                  </button>
                  <button className="btn btn--ghost" onClick={reset}>
                    Cancel
                  </button>
                </div>
              )}

              {status === 'uploading' && (
                <div className="upload-progress">
                  <div className="upload-progress__track">
                    <div className="upload-progress__fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="upload-progress__label mono">{progress}% uploaded</span>
                </div>
              )}

              {status === 'processing' && (
                <div className="upload-processing">
                  <span className="upload-processing__dots">
                    <span /><span /><span />
                  </span>
                  Analyzing image…
                </div>
              )}

              {status === 'done' && (
                <div className="upload-done">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M6.5 10.2l2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Added to your gallery
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadCard
