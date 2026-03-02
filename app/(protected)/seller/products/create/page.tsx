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
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'
import { ImageUpload } from '@/components/ui/image-upload'

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
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-4xl space-y-10">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 leading-none">Onboard Asset</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-black">Official Registry Documentation</p>
          </div>
          <div className="flex gap-2 text-[10px] items-center">
              <span className="text-slate-400 uppercase font-bold tracking-widest">Seller</span>
              <span className="text-slate-300">/</span>
              <span className="text-primary font-black uppercase tracking-widest">Inventory</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-black uppercase tracking-widest">Create</span>
          </div>
        </div>

        {/* Back Button */}
        <Link href="/seller/dashboard">
          <Button variant="outline" className="text-slate-400 border-slate-200 hover:bg-white hover:text-primary transition-all rounded-sm font-black uppercase tracking-widest text-[9px] h-9 px-6 bg-white shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Return to Command Center
          </Button>
        </Link>

        <Card className="bg-white border-none p-10 rounded-sm shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          
          {error && (
            <Alert variant="destructive" className="mb-8 rounded-sm border-none bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold uppercase tracking-widest text-[10px]">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-8 bg-green-50 border-none rounded-sm">
              <AlertDescription className="text-green-600 font-black uppercase tracking-widest text-[10px] text-center">
                Asset created successfully! Synchronizing registry...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Product Details */}
            <div className="space-y-10">
              <div className="border-b border-slate-50 pb-4 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Asset Specification</h2>
                <div className="p-1 px-3 bg-slate-50 rounded-full">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phase 01 / Technical Identity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Official Title *</label>
                    <Input
                      type="text"
                      name="title"
                      placeholder="e.g. 2024 LUXURY SEDAN SIGNATURE EDITION"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="bg-slate-50 border-none text-slate-800 placeholder:text-slate-300 rounded-sm h-12 font-bold uppercase tracking-tight text-sm focus-visible:ring-1 focus-visible:ring-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Classification *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-none text-slate-800 rounded-sm p-3 h-12 font-bold uppercase tracking-widest text-[10px] focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">SELECT CLASSIFICATION</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Valuation (RWF) *</label>
                    <Input
                      type="number"
                      name="startingPrice"
                      placeholder="50,000"
                      step="1"
                      min="0"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      className="bg-slate-50 border-none text-slate-800 placeholder:text-slate-300 rounded-sm h-12 font-black text-xl tracking-tighter focus-visible:ring-1 focus-visible:ring-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Descriptive Narrative *</label>
                    <Textarea
                      name="description"
                      placeholder="Provide comprehensive details about the asset's condition, provenance, and specifications..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="bg-slate-50 border-none text-slate-700 placeholder:text-slate-300 rounded-sm min-h-[172px] p-4 font-medium text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-primary transition-all resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Authentication Port</label>
                <div className="p-8 bg-slate-50 border-2 border-slate-100 border-dashed rounded-sm hover:border-primary/30 transition-all">
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    onError={(err) => setError(err)}
                  />
                  <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-6">Upload High-Fidelity Asset Imagery</p>
                </div>
              </div>
            </div>

            {/* Auction Schedule */}
            <div className="space-y-10">
              <div className="border-b border-slate-50 pb-4 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Auction Parameters</h2>
                <div className="p-1 px-3 bg-slate-50 rounded-full">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phase 02 / Temporal Window</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" /> Commencement Timestamp *
                  </label>
                  <Input
                    type="datetime-local"
                    name="startTime"
                    value={auctionData.startTime}
                    onChange={handleAuctionChange}
                    className="bg-slate-50 border-none text-slate-800 rounded-sm h-12 font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" /> Conclusion Timestamp *
                  </label>
                  <Input
                    type="datetime-local"
                    name="endTime"
                    value={auctionData.endTime}
                    onChange={handleAuctionChange}
                    className="bg-slate-50 border-none text-slate-800 rounded-sm h-12 font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-slate-50">
              <Button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-sm h-16 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
              >
                {loading ? 'SYNCHRONIZING RECORDS...' : 'AUTHORIZE & PUBLISH ASSET'}
              </Button>
              <Link href="/seller/dashboard" className="flex-1">
                <Button variant="outline" type="button" className="w-full text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-sm h-16 font-black uppercase tracking-widest text-[11px] transition-all">
                  CANCEL
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
