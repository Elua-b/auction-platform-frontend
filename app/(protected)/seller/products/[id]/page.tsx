'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productAPI, categoryAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Package, Gavel, Calendar, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { auctionAPI } from '@/lib/api'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function SellerProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auction State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [auctionTimes, setAuctionTimes] = useState({
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productAPI.getById(productId)
      setProduct(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productAPI.delete(productId)
      router.push('/seller/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to delete product')
    }
  }

  const handleStartAuction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      await auctionAPI.create({
        productId,
        startTime: new Date(auctionTimes.startTime),
        endTime: new Date(auctionTimes.endTime)
      })
      setIsModalOpen(false)
      loadProduct()
    } catch (err: any) {
      setError(err.message || 'Failed to start auction')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading product details...</div>

  if (!product) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
    <p>Product not found</p>
    <Button onClick={() => router.back()}>Go Back</Button>
  </div>

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/seller/dashboard')} className="text-slate-400 hover:text-white p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Product Details</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-700 text-slate-300">
               <Edit className="w-4 h-4 mr-2" />
               Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={product.status !== 'AVAILABLE'}>
               <Trash2 className="w-4 h-4 mr-2" />
               Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Product Image & Basic Info */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                 <div className="h-96 bg-slate-900 flex items-center justify-center">
                    {product.image ? (
                       <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
                    ) : (
                       <Package className="w-20 h-20 text-slate-700" />
                    )}
                 </div>
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <Badge className="mb-2 bg-amber-500/10 text-amber-500 border-amber-500/20">{product.category.name}</Badge>
                          <h2 className="text-2xl font-bold text-white">{product.title}</h2>
                       </div>
                       <Badge variant={product.status === 'AVAILABLE' ? 'secondary' : 'default'} className="uppercase">
                          {product.status}
                       </Badge>
                    </div>
                    <p className="text-slate-400 whitespace-pre-wrap">{product.description}</p>
                 </div>
              </Card>

              {/* Status Section */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Bidding History / Status
                 </h3>
                 <div className="space-y-4">
                    {product.status === 'AVAILABLE' ? (
                       <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                          <p className="text-slate-400 mb-4">This product is available but not currently in any auction.</p>
                          <div className="flex gap-2 justify-center">
                             <Link href={`/seller/events`}>
                                <Button className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/20">Add to Event</Button>
                             </Link>
                             
                             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                   <Button className="bg-amber-500 text-black font-medium">Create Timed Auction</Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                                   <DialogHeader>
                                      <DialogTitle>Start Timed Online Auction</DialogTitle>
                                   </DialogHeader>
                                   <form onSubmit={handleStartAuction} className="space-y-4 pt-4">
                                      <div className="space-y-2">
                                         <label className="text-sm text-slate-400">Start Time</label>
                                         <Input 
                                           required
                                           type="datetime-local" 
                                           className="bg-slate-800 border-slate-700" 
                                           value={auctionTimes.startTime}
                                           onChange={e => setAuctionTimes({...auctionTimes, startTime: e.target.value})}
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-sm text-slate-400">End Time</label>
                                         <Input 
                                           required
                                           type="datetime-local" 
                                           className="bg-slate-800 border-slate-700"
                                           value={auctionTimes.endTime}
                                           onChange={e => setAuctionTimes({...auctionTimes, endTime: e.target.value})}
                                         />
                                      </div>
                                      <DialogFooter>
                                         <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                         <Button type="submit" disabled={actionLoading} className="bg-amber-500 text-black">
                                            {actionLoading ? 'Creating...' : 'Launch Auction'}
                                         </Button>
                                      </DialogFooter>
                                   </form>
                                </DialogContent>
                             </Dialog>
                          </div>
                       </div>
                    ) : (
                       <p className="text-slate-500 italic">Historical data or current bidding would appear here.</p>
                    )}
                 </div>
              </Card>
           </div>

           {/* Right: Pricing & Meta */}
           <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700 p-6">
                 <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Pricing</p>
                 <div className="space-y-4">
                    <div>
                       <p className="text-xs text-slate-500 mb-1">Starting Price</p>
                       <p className="text-3xl font-black text-amber-500">{formatCurrency(product.startingPrice)}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-500 mb-1">Current Price</p>
                       <p className="text-2xl font-bold text-slate-300">{formatCurrency(product.currentPrice || product.startingPrice)}</p>
                    </div>
                 </div>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-6">
                 <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Engagement</p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-400 flex items-center gap-2">
                          <Gavel className="w-4 h-4" /> Bids
                       </span>
                       <span className="text-white font-bold">0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Created
                       </span>
                       <span className="text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </main>
    </div>
  )
}
