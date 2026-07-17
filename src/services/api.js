const API_BASE_URL = 'https://hdr0ekq016.execute-api.ap-south-1.amazonaws.com'

/**
 * Wraps fetch with consistent error handling.
 */
async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`,
        {
            cache: "no-store",
            ...options
        }
    )
  } catch (networkErr) {
    throw new Error('Network error — check your connection and try again.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

/**
 * Requests a pre-signed upload URL, then PUTs the file directly to it.
 * Progress is reported via onProgress(percent) using XHR (fetch cannot
 * report upload progress).
 */
export async function uploadImage(file, onProgress) {
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase()

  const { imageId, objectKey, uploadUrl } = await request('/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extension })
  })

  if (!uploadUrl) {
    throw new Error('No upload URL returned by the server.')
  }

  await putWithProgress(uploadUrl, file, onProgress)

  return { imageId, objectKey }
}

function putWithProgress(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed — network error.'))
    xhr.send(file)
  })
}

/** Fetches the gallery of recognized images. */
export function getImages() {
  return request(`/images?t=${Date.now()}`,
      {
          method: "GET"
      }
  )
}

/** Fetches full detail for a single image. */
export function getImage(id) {
  return request(`/image/${encodeURIComponent(id)}`, { method: 'GET' })
}

export async function waitForImage(imageId, timeout = 20000) {

  const start = Date.now()

  while (Date.now() - start < timeout) {

    const images = await getImages()

    const found = images.find(img => img.imageId === imageId)

    if (found) {
      return found
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error("Recognition timed out.")
}