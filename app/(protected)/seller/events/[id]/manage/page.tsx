'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { eventAPI, productAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Trash2, ArrowLeft, Search, Package, Zap, Image as ImageIcon, Calendar, Clock } from 'lucide-react'
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
import { ImageUpload } from '@/components/ui/image-upload'

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

  const handleEndEvent = async () => {
    if (!confirm('Are you sure you want to terminate this live session? All active bidding will be closed.')) return
    try {
      setActionLoading(true)
      await eventAPI.end(eventId)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to terminate event')
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
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-7xl space-y-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/seller/dashboard">
                <Button variant="outline" size="sm" className="text-slate-400 border-slate-200 hover:bg-white hover:text-primary transition-all rounded-sm font-black uppercase tracking-widest text-[9px] h-8 px-4 bg-white shadow-sm">
                  <ArrowLeft className="w-3 h-3 mr-2" />
                  Registry
                </Button>
              </Link>
              <div className="h-4 w-px bg-slate-200"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Control Center</p>
            </div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{event.title}</h1>
            <div className="flex items-center gap-4 mt-3">
               <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-sm">
                 <Calendar className="w-3 h-3 text-primary" />
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</span>
               </div>
               <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-sm">
                 <Clock className="w-3 h-3 text-primary" />
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{event.startTime}</span>
               </div>
               <Badge className="bg-slate-800 text-white rounded-none px-3 font-black text-[8px] uppercase tracking-widest border-none">
                 {event.status}
               </Badge>
            </div>
          </div>

          <div className="flex gap-4">
            {event.status === 'LIVE' && (
              <Button 
                onClick={handleEndEvent}
                className="bg-white border border-primary text-primary hover:bg-primary/5 font-black uppercase tracking-[0.2em] text-[10px] rounded-sm h-14 px-8 transition-all"
                disabled={actionLoading}
              >
                Terminate Session
              </Button>
            )}
            <Link href={`/events/${event.id}`}>
              <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-sm h-14 px-10 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]">
                <Zap className="w-4 h-4 mr-3" />
                Launch Live Theatre
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-10 rounded-sm border-none bg-red-50 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-bold uppercase tracking-widest text-[10px]">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Current Items in Event */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Assigned Lots ({event.products.length})
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sequenced Inventory</p>
            </div>
            
            <div className="space-y-4">
              {event.products.length === 0 ? (
                <Card className="bg-white border-2 border-slate-100 border-dashed p-20 text-center rounded-sm">
                  <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No lots synchronized for this session</p>
                </Card>
              ) : (
                event.products.map((ep, index) => (
                  <Card key={ep.id} className="bg-white border-none rounded-sm overflow-hidden flex items-center p-4 shadow-sm hover:shadow-md transition-all group relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-primary transition-colors" />
                    
                    <div className="w-20 h-20 bg-slate-50 rounded-sm overflow-hidden flex-shrink-0 border border-slate-100">
                      {ep.product.image ? (
                        <img src={ep.product.image} alt={ep.product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 ml-6 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-primary uppercase">Lot {ep.order}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {ep.product.id.substring(0, 8)}</span>
                          </div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate pr-4">{ep.product.title}</h3>
                        </div>
                        <Badge className="bg-slate-50 text-slate-400 border-none rounded-full px-2 text-[7px] font-black uppercase">
                          {ep.product.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-md font-black text-slate-800 tracking-tighter">{formatCurrency(ep.product.startingPrice)}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-sm px-3 font-black uppercase tracking-widest text-[9px] transition-all"
                          onClick={() => handleRemoveProduct(ep.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Release
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Add More Products */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Available Portfolio
              </h2>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[9px] rounded-sm px-4 h-9 shadow-md transition-all">
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Rapid Registry
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-none rounded-sm shadow-2xl p-0 overflow-hidden max-w-lg">
                  <div className="h-1.5 bg-primary w-full" />
                  <DialogHeader className="p-8 border-b border-slate-50">
                    <DialogTitle className="text-lg font-black text-slate-800 uppercase tracking-tight">Onboard New Asset</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAndAdd} className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Identity *</label>
                       <Input 
                         required
                         value={newProduct.title}
                         onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                         className="bg-slate-50 border-none rounded-sm h-12 text-sm font-bold uppercase tracking-tight focus-visible:ring-1 focus-visible:ring-primary" 
                         placeholder="e.g. PLATINUM SERIES MOTOR"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Narrative *</label>
                       <textarea 
                         required
                         value={newProduct.description}
                         onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                         className="w-full bg-slate-50 border-none rounded-sm p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] transition-all resize-none" 
                         placeholder="Technical specifications and condition report..."
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation (RWF) *</label>
                         <Input 
                           required
                           type="number"
                           value={newProduct.startingPrice}
                           onChange={e => setNewProduct({...newProduct, startingPrice: e.target.value})}
                           className="bg-slate-50 border-none rounded-sm h-12 text-lg font-black tracking-tighter focus-visible:ring-1 focus-visible:ring-primary" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification *</label>
                         <select 
                           required
                           value={newProduct.categoryId}
                           onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                           className="w-full bg-slate-50 border-none rounded-sm h-12 px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                         >
                            <option value="">SELECT TYPE</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                            ))}
                         </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Authentication Port</label>
                       <div className="bg-slate-50 border border-slate-100 rounded-sm p-4">
                         <ImageUpload 
                           value={newProduct.image}
                           onChange={url => setNewProduct({...newProduct, image: url})}
                           onError={err => setError(err)}
                           className="h-32"
                         />
                       </div>
                    </div>
                    <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-50">
                      <Button type="button" variant="outline" className="flex-1 rounded-sm border-slate-200 font-black uppercase tracking-widest text-[10px] h-14" onClick={() => setIsModalOpen(false)}>
                        ABORT
                      </Button>
                      <Button type="submit" disabled={actionLoading} className="flex-[2] bg-primary text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-sm shadow-lg shadow-primary/20">
                        {actionLoading ? 'SYNCHRONIZING...' : 'AUTHORIZE & ASSIGN'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-white border-none rounded-sm shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <Input
                    placeholder="SEARCH PORTFOLIO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 bg-white border-none text-slate-800 placeholder:text-slate-300 rounded-sm h-12 font-black uppercase tracking-widest text-[9px] focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No available assets identified</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all group"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                             {product.image && <img src={product.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-700 uppercase tracking-tight text-[11px] group-hover:text-primary transition-colors">{product.title}</p>
                            <p className="text-sm font-black text-slate-900 pr-4">{formatCurrency(product.startingPrice)}</p>
                          </div>
                       </div>
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleAddProduct(product.id)}
                        className="bg-white border border-slate-200 text-slate-400 hover:bg-primary hover:border-primary hover:text-white rounded-sm font-black uppercase tracking-widest text-[8px] h-9 px-4 transition-all"
                      >
                        Assign To Lot
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
