'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { eventAPI, productAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Trash2, ArrowLeft, Search, Package, Zap, Image as ImageIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { categoryAPI } from '@/lib/api'
import Header from '@/components/header'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  title: string
  startingPrice: number
  status: string
  image?: string
}

interface EventProduct {
  id: string
  productId: string
  order: number
  product: Product
}

interface Event {
  id: string
  title: string
  date: string
  startTime: string
  status: string
  products: EventProduct[]
}

export default function ManageEventPage() {
  const params = useParams()
  const eventId = params.id as string
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  
  // New Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    startingPrice: '',
    categoryId: '',
    image: ''
  })

  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      const eventData = await eventAPI.getById(eventId)
      setEvent(eventData)

      if (user) {
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getAll({ 
            sellerId: user.id, 
            status: 'AVAILABLE' 
          }),
          categoryAPI.getAll()
        ])
        setMyProducts(productsData)
        setCategories(categoriesData)
      }
    } catch (err: any) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (productId: string) => {
    try {
      setActionLoading(true)
      const nextOrder = (event?.products.length || 0) + 1
      await eventAPI.addProduct(eventId, productId, nextOrder)
      await loadData() // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to add product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveProduct = async (eventProductId: string) => {
    try {
      setActionLoading(true)
      await eventAPI.removeProduct(eventId, eventProductId)
      await loadData() // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to remove product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      // 1. Create Product
      const createdProduct = await productAPI.create({
        ...newProduct,
        startingPrice: parseInt(newProduct.startingPrice, 10),
      })
      
      // 2. Add to Event
      const nextOrder = (event?.products.length || 0) + 1
      await eventAPI.addProduct(eventId, createdProduct.id, nextOrder)
      
      // 3. Reset and Refresh
      setIsModalOpen(false)
      setNewProduct({
        title: '',
        description: '',
        startingPrice: '',
        categoryId: '',
        image: ''
      })
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create and add product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const filteredProducts = myProducts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !event?.products.some(ep => ep.productId === p.id)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-slate-400 text-center">Loading management dashboard...</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" className="text-slate-400 hover:text-white p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
              <p className="text-slate-400">
                {new Date(event.date).toLocaleDateString()} at {event.startTime}
              </p>
            </div>
          </div>
          <Link href={`/events/${event.id}`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              <Zap className="w-4 h-4 mr-2" />
              Go to Live Room
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Items in Event */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Event Lots ({event.products.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              {event.products.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800 p-8 text-center border-dashed">
                  <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">No items added to this event yet</p>
                </Card>
              ) : (
                event.products.map((ep, index) => (
                  <Card key={ep.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-20 h-20 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {ep.product.image ? (
                          <img src={ep.product.image} alt={ep.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-700 absolute inset-0 m-auto" />
                        )}
                        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black text-[10px]">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white truncate">{ep.product.title}</h3>
                            <p className="text-sm text-amber-500 font-medium">{formatCurrency(ep.product.startingPrice)}</p>
                          </div>
                          <Badge 
                            className={`${
                              ep.product.status === 'AVAILABLE' ? 'bg-slate-700' : 
                              ep.product.status === 'SOLD' ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                          >
                            {ep.product.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">Lot {ep.order}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 p-0 px-2"
                            onClick={() => handleRemoveProduct(ep.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Add More Products */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Add Your Properties
              </h2>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-1" />
                    New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Product for Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAndAdd} className="space-y-4 pt-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-400">Title</label>
                       <Input 
                         required
                         value={newProduct.title}
                         onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                         className="bg-slate-800 border-slate-700" 
                         placeholder="Modern Penthouse..."
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-400">Description</label>
                       <textarea 
                         required
                         value={newProduct.description}
                         onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                         className="w-full bg-slate-800 border-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]" 
                         placeholder="Describe the property..."
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-400">Price (RWF)</label>
                         <Input 
                           required
                           type="number"
                           value={newProduct.startingPrice}
                           onChange={e => setNewProduct({...newProduct, startingPrice: e.target.value})}
                           className="bg-slate-800 border-slate-700" 
                           placeholder="5000000"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-400">Category</label>
                         <select 
                           required
                           value={newProduct.categoryId}
                           onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                           className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                         >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                         </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-400">Image URL</label>
                       <Input 
                         value={newProduct.image}
                         onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                         className="bg-slate-800 border-slate-700" 
                         placeholder="https://images.unsplash..."
                       />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={actionLoading} className="bg-amber-500 text-black font-bold">
                        {actionLoading ? 'Creating...' : 'Create & Add'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search your available properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No available products found</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-500 transition"
                    >
                      <div>
                        <p className="font-medium text-white">{product.title}</p>
                        <p className="text-sm text-slate-400">{formatCurrency(product.startingPrice)}</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleAddProduct(product.id)}
                        className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/20"
                      >
                        Add to Event
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
