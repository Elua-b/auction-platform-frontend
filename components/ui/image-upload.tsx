'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadImage, UploadResponse } from '@/lib/upload'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onError,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Image must be less than 5MB'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const result: UploadResponse = await uploadImage(file)
      onChange(result.url)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }, [onChange, onError])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        // Preview mode
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-900 border border-slate-600">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleClick}
                disabled={disabled || isUploading}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative w-full h-48 rounded-lg border-2 border-dashed transition-all cursor-pointer',
            'flex flex-col items-center justify-center gap-3',
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-700/50',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-sm text-slate-400">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-700 rounded-full">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
