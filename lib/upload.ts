const API_BASE = 'http://localhost:5000'

export interface UploadResponse {
    url: string
    publicId: string
}

/**
 * Upload an image file to Cloudinary via the backend
 * @param file - The image file to upload
 * @returns Promise with the Cloudinary URL and public ID
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const formData = new FormData()
    formData.append('file', file)

    const headers: Record<string, string> = {}
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(error.message || 'Failed to upload image')
    }

    return response.json()
}
