'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productAPI, categoryAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Package, Gavel, Calendar, Clock, TrendingUp } from 'lucide-react'
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
  const { user } = useAuth()
  
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

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Synchronizing Asset Parameters...</p>
    </div>
  )
  
  if (!product) return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center space-y-8 p-16">
      <div className="p-10 bg-white border-2 border-slate-100 border-dashed rounded-sm text-center">
        <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
        <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Asset not identified in registry</p>
      </div>
      <Button onClick={() => router.push('/seller/dashboard')} className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-lg transition-all">
        <ArrowLeft className="w-4 h-4 mr-3" />
        Return to Command Center
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12 lg:p-16">
      <main className="mx-auto max-w-7xl space-y-16">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/seller/dashboard')} 
              className="text-slate-400 border-slate-200 hover:bg-white hover:text-primary rounded-sm font-black uppercase tracking-widest text-[10px] h-12 px-6 bg-white shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Registry
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Internal Registry Asset</p>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Asset Intelligence</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-slate-200 text-slate-400 hover:bg-white hover:text-primary rounded-sm font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-white shadow-sm transition-all">
               <Edit className="w-4 h-4 mr-2" />
               Modify Records
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={product.status !== 'AVAILABLE'}
              className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-sm h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]"
            >
               <Trash2 className="w-4 h-4 mr-2" />
               Decommission
            </Button>
          </div>
      </div>

        {error && (
          <div className="mb-10 p-4 bg-primary/10 border border-primary text-center">
             <p className="text-primary font-black uppercase tracking-widest text-[10px]">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left: Product Image & Basic Info */}
           <div className="lg:col-span-8 space-y-12">
               <Card className="bg-white border-none rounded-sm overflow-hidden shadow-xl relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-primary z-10" />
                  <div className="h-[400px] bg-slate-50 relative group overflow-hidden border-b border-slate-100">
                     {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-all duration-700" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Package className="w-20 h-20 text-slate-100" />
                        </div>
                     )}
                     <div className="absolute bottom-0 left-0 bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] py-3 px-6">
                        {product.category?.name || 'ASSET CLASSIFICATION'}
                     </div>
                  </div>
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-50">
                       <div>
                          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">{product.title}</h2>
                          <div className="flex items-center gap-3">
                             <div className={`w-2.5 h-2.5 rounded-full ${product.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-primary'}`}></div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.status}</p>
                          </div>
                       </div>
                       <div className="px-4 py-1.5 bg-slate-50 rounded-full">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Official Registry Entry</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Asset Specification Details</p>
                       <p className="text-md font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                    </div>
                  </div>
               </Card>

              {/* Status Section */}
               <Card className="bg-white border-none p-10 rounded-sm shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-50"></div>
                  <h3 className="text-[10px] font-black text-slate-800 mb-10 uppercase tracking-widest flex items-center gap-3 border-b border-slate-50 pb-4">
                     <Clock className="w-4 h-4 text-primary" />
                     Orchestration Parameters
                  </h3>
                  <div className="space-y-8">
                    {product.status === 'AVAILABLE' ? (
                       <div className="bg-slate-50 p-8 rounded-sm border border-slate-100 text-center space-y-10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose max-w-lg mx-auto">
                            This asset is currently residing in the secure repository and is authorized for deployment to active events or private bidding halls.
                          </p>
                          <div className="flex flex-col md:flex-row gap-4 justify-center">
                             <Link href={`/seller/dashboard?tab=events`} className="flex-1">
                                <Button variant="outline" className="w-full bg-white text-slate-600 border-slate-200 hover:text-primary rounded-sm font-black uppercase tracking-widest text-[10px] h-14 transition-all">
                                  Assign to Event
                                </Button>
                             </Link>
                             
                             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                   <Button className="flex-1 bg-slate-800 text-white hover:bg-slate-900 rounded-sm font-black uppercase tracking-widest text-[10px] h-14 shadow-md transition-all">
                                      Rapid Synchronization
                                   </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white border-none rounded-sm shadow-2xl p-0 overflow-hidden max-w-lg">
                                   <div className="h-1.5 bg-primary w-full" />
                                   <DialogHeader className="p-10 border-b border-slate-50">
                                      <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Operation Init</DialogTitle>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Temporal Window Configuration</p>
                                   </DialogHeader>
                                   <form onSubmit={handleStartAuction} className="p-10 space-y-8">
                                      <div className="space-y-3">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Commencement Timestamp
                                         </label>
                                         <Input 
                                           required
                                           type="datetime-local" 
                                           className="bg-slate-50 border-none rounded-sm h-12 text-slate-800 font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all" 
                                           value={auctionTimes.startTime}
                                           onChange={e => setAuctionTimes({...auctionTimes, startTime: e.target.value})}
                                         />
                                      </div>
                                      <div className="space-y-3">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Termination Timestamp
                                         </label>
                                         <Input 
                                           required
                                           type="datetime-local" 
                                           className="bg-slate-50 border-none rounded-sm h-12 text-slate-800 font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all"
                                           value={auctionTimes.endTime}
                                           onChange={e => setAuctionTimes({...auctionTimes, endTime: e.target.value})}
                                         />
                                      </div>
                                      <DialogFooter className="pt-8 flex flex-col md:flex-row gap-4 border-t border-slate-50">
                                         <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-sm font-black uppercase tracking-widest text-[10px] h-14 border-slate-200 text-slate-400 hover:bg-slate-50">
                                            Cancel
                                         </Button>
                                         <Button type="submit" disabled={actionLoading} className="flex-1 bg-primary text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-sm shadow-lg shadow-primary/20">
                                            {actionLoading ? 'SYCHRONIZING...' : 'AUTHORIZE ACTIVATION'}
                                         </Button>
                                      </DialogFooter>
                                   </form>
                                </DialogContent>
                             </Dialog>
                          </div>
                       </div>
                    ) : (
                       <div className="p-10 bg-slate-50 border border-slate-100 rounded-sm text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-loose">
                             Asset is currently locked in an active acquisition protocol. Transaction streams will be finalized upon phase completion.
                          </p>
                       </div>
                    )}
                  </div>
               </Card>
           </div>

           {/* Right: Pricing & Meta */}
           <div className="lg:col-span-4 space-y-10">
               <Card className="bg-white border-none p-8 rounded-sm shadow-xl border-t-4 border-t-primary">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Valuation Metrics</p>
                  <div className="space-y-6">
                     <div className="p-5 bg-slate-50 rounded-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Base Threshold</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(product.startingPrice)}</p>
                     </div>
                     <div className="p-5 border-2 border-primary/10 bg-red-50/30 rounded-sm">
                        <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-2">Market Valuation</p>
                        <p className="text-3xl font-black text-primary tracking-tight">{formatCurrency(product.currentPrice || product.startingPrice)}</p>
                        <div className="flex items-center gap-2 mt-3 text-primary text-[8px] font-black uppercase ">
                           <TrendingUp className="w-3 h-3" />
                           <span>Registry Appreciation Active</span>
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="bg-white border-none p-8 rounded-sm shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                     <Gavel className="w-32 h-32 text-slate-900" />
                  </div>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-10">Meta-Data Registry</p>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Gavel className="w-3.5 h-3.5 text-primary" /> Active Bids
                        </span>
                        <span className="text-slate-800 font-black text-lg">0</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Calendar className="w-3.5 h-3.5 text-primary" /> Entry Date
                        </span>
                        <span className="text-slate-800 font-black text-[10px] uppercase">{new Date(product.createdAt).toLocaleDateString()}</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Package className="w-3.5 h-3.5 text-primary" /> Serial Key
                        </span>
                        <span className="text-slate-800 font-mono text-[9px]">{productId.substring(0, 16).toUpperCase()}</span>
                     </div>
                  </div>
               </Card>
           </div>
        </div>
      </main>
    </div>
  )
}
