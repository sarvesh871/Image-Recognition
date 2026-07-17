import { useCallback, useState } from 'react'
import Navbar from './components/Navbar'
import UploadCard from './components/UploadCard'
import Gallery from './components/Gallery'
import DetailsModal from './components/DetailsModal'
import Toast from './components/Toast'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import { useGallery } from './hooks/useGallery'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const { toasts, showToast, dismissToast } = useToast()
  const handleGalleryError = useCallback((message) => showToast(message, 'error'), [showToast])
  const { images, loading, refreshing, reload } = useGallery(handleGalleryError)

  const [activeImage, setActiveImage] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  const handleUploaded = useCallback(async () => {
      await reload()
      showToast(
          "Recognition completed successfully.",
          "success"
      )
  }, [reload, showToast])

  const handleUploadError = useCallback((message) => {
    showToast(message, 'error')
  }, [showToast])

  const openDetails = useCallback((image) => {
    setActiveTab('summary')
    setActiveImage(image)
  }, [])

  const openAudio = useCallback((image) => {
    if (!image.audioUrl) {
      showToast('No audio available for this image.', 'error')
      return
    }
    setActiveTab('audio')
    setActiveImage(image)
  }, [showToast])

  const closeDetails = useCallback(() => setActiveImage(null), [])

  return (
    <div className="app">
      <Navbar theme={theme} onToggleTheme={toggleTheme} imageCount={images.length} />

      <main>
        <section className="container">
          <UploadCard onUploaded={handleUploaded} onError={handleUploadError} />
        </section>

        <section className="container">
          <Gallery
            images={images}
            loading={loading}
            refreshing={refreshing}
            onViewDetails={openDetails}
            onPlayAudio={openAudio}
          />
        </section>
      </main>

      <footer className="app-footer">
        <div className="container app-footer__inner">
          <span>Lucid — AI Image Recognition</span>
          <span className="mono">Powered by your recognition API</span>
        </div>
      </footer>

      {activeImage && (
        <DetailsModal imageStub={activeImage} onClose={closeDetails} initialTab={activeTab} />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
