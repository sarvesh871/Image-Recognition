import { useCallback, useEffect, useState } from 'react'
import { getImages } from '../services/api'

export function useGallery(onError) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      const data = await getImages()
      const sorted = [...(data || [])].sort(
        (a, b) => (b.captureTimestamp || 0) - (a.captureTimestamp || 0)
      )
      setImages(sorted)
      return data
    } catch (err) {
      onError?.(err.message || 'Could not load the gallery.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [onError])

  useEffect(() => {
    load()
  }, [load])

  return {images, loading, refreshing, reload: async () => {
        const data = await load({
            silent: true
        })
        return data
    }
  }
}
