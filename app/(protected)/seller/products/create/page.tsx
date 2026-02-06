'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI, categoryAPI, auctionAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    startingPrice: '',
    categoryId: '',
  })

  const [auctionData, setAuctionData] = useState({
    startTime: '',
    endTime: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoryAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAuctionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAuctionData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.title || !formData.description || !formData.startingPrice || !formData.categoryId) {
        throw new Error('Please fill in all required fields')
      }

      if (!auctionData.startTime || !auctionData.endTime) {
        throw new Error('Please set auction start and end times')
      }

      // Create product
      const productResponse = await productAPI.create({
        ...formData,
        startingPrice: parseInt(formData.startingPrice, 10),
      })

      // Create auction for the product
      await auctionAPI.create({
        productId: productResponse.id,
        startTime: auctionData.startTime,
        endTime: auctionData.endTime,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/seller/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/seller/dashboard">
          <Button variant="outline" className="mb-6 text-slate-300 hover:text-white border-slate-600 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Product</h1>
          <p className="text-slate-400 mb-8">List a new product for auction</p>

          <Card className="bg-slate-800 border-slate-700 p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-900 border-green-700">
                <AlertDescription className="text-green-200">
                  Product created successfully! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Details */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Product Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Product Title *</label>
                    <Input
                      type="text"
                      name="title"
                      placeholder="Enter product title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                    <Textarea
                      name="description"
                      placeholder="Describe your product in detail"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-32"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Product Image URL</label>
                    <Input
                      type="url"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Starting Price (RWF) *</label>
                    <Input
                      type="number"
                      name="startingPrice"
                      placeholder="5000"
                      step="1"
                      min="0"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Auction Details */}
              <div className="border-t border-slate-700 pt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Auction Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Auction Start Time *</label>
                    <Input
                      type="datetime-local"
                      name="startTime"
                      value={auctionData.startTime}
                      onChange={handleAuctionChange}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Auction End Time *</label>
                    <Input
                      type="datetime-local"
                      name="endTime"
                      value={auctionData.endTime}
                      onChange={handleAuctionChange}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  {loading ? 'Creating...' : 'Create Product & Auction'}
                </Button>
                <Link href="/seller/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full text-slate-300 hover:text-white border-slate-600 bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
