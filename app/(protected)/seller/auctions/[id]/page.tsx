'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { auctionAPI, bidAPI, productAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, TrendingUp, Users, Package, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { socket } from '@/lib/socket'

export default function SellerAuctionManagePage() {
  const params = useParams()
  const auctionId = params.id as string
  const router = useRouter()
  const { user } = useAuth()
  
  const [auction, setAuction] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [winnerData, setWinnerData] = useState<any>(null)

  useEffect(() => {
    if (auctionId) {
      loadData()
      
      socket.connect()
      socket.emit('joinAuction', auctionId)

      socket.on('bidPlaced', (newBid: any) => {
        // Ensure the bid has a createdAt timestamp
        const bidWithTimestamp = {
          ...newBid,
          createdAt: newBid.createdAt || new Date().toISOString()
        }
        
        setBids(prev => {
          if (prev.some(b => b.id === newBid.id)) return prev
          return [bidWithTimestamp, ...prev]
        })
        // Update current price in auction state locally
        setAuction((prev: any) => prev ? {
           ...prev,
           product: { ...prev.product, currentPrice: newBid.amount }
        } : null)
      })

      socket.on('auctionEnded', (data: any) => {
        setWinnerData(data.winner)
        setAuction((prev: any) => prev ? { ...prev, status: 'ENDED' } : null)
      })

      return () => {
        socket.emit('leaveAuction', auctionId)
        socket.off('bidPlaced')
        socket.off('auctionEnded')
        socket.disconnect()
      }
    }
  }, [auctionId])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await auctionAPI.getById(auctionId)
      setAuction(data)
      
      const bidsData = await bidAPI.getByAuction(auctionId)
      setBids(bidsData)
    } catch (err: any) {
      setError(err.message || 'Failed to load auction data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white">Synchronizing Theatre Data...</div>

  if (!auction) return <div className="p-16 text-center space-y-8">
    <p className="text-white font-black uppercase tracking-widest">Theatre not found in registry</p>
    <Button onClick={() => router.back()} className="bg-primary hover:bg-primary/90 rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-10">Go Back</Button>
  </div>

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-7xl space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex flex-col gap-6">
            <Button 
                variant="outline" 
                onClick={() => router.push('/seller/dashboard')} 
                className="w-fit border-slate-200 text-slate-400 hover:bg-white hover:text-slate-800 rounded-sm h-10 px-4 font-black uppercase tracking-widest text-[9px] transition-all bg-white shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Strategic Dashboard
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none animate-pulse">Live Sync Active</span>
                 <div className="h-px w-8 bg-slate-200"></div>
              </div>
              <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter leading-none">Bidding Theatre</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Real-time oversight of asset acquisition cycle</p>
            </div>
          </div>
          <Badge className={`${auction.status === 'ACTIVE' ? 'bg-primary' : 'bg-slate-200 text-slate-600'} rounded-full font-black uppercase tracking-widest text-[9px] px-8 py-3 border-none shadow-lg shadow-primary/10`}>
             {auction.status === 'ACTIVE' ? '🔴 LIVE THEATRE' : 'UPCOMING PHASE'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Detailed Info */}
           <div className="lg:col-span-8 space-y-12">
              <Card className="bg-white border-none p-10 rounded-sm shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                 <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-32 h-32 bg-slate-50 rounded-sm overflow-hidden flex-shrink-0 border border-slate-100 p-1">
                       {auction.product.image ? (
                         <img src={auction.product.image} className="w-full h-full object-cover grayscale opacity-80" alt={auction.product.title} />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-100" />
                         </div>
                       )}
                    </div>
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Asset Identity</p>
                       <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">{auction.product.title}</h2>
                       <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8">{auction.product.description || 'Exclusive asset liquidation session.'}</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <Clock className="w-3 h-3 text-primary" /> Commencement
                             </div>
                             <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{new Date(auction.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <Clock className="w-3 h-3 text-primary" /> Termination
                             </div>
                             <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{new Date(auction.endTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* Bidding History Table */}
              <Card className="bg-white border-none rounded-sm shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                       <div className="flex items-center gap-3">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em]">Synchronization Log</h3>
                       </div>
                       <p className="text-primary text-[8px] font-black uppercase tracking-widest mt-2">Active Telemetry Stream</p>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Global Entries</p>
                          <p className="text-lg font-black text-slate-800 tracking-tighter">{bids.length}</p>
                       </div>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">
                          <tr>
                             <th className="px-10 py-5">Authority</th>
                             <th className="px-10 py-5 text-slate-800">Valuation</th>
                             <th className="px-10 py-5">System Time</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {bids.length === 0 ? (
                             <tr>
                                <td colSpan={3} className="px-10 py-20 text-center">
                                   <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] italic">No active data streams detected...</p>
                                </td>
                             </tr>
                          ) : (
                             bids.map((bid, index) => (
                                <tr key={bid.id} className={`group hover:bg-slate-50/50 transition-all ${index === 0 ? 'bg-red-50/30' : ''}`}>
                                   <td className="px-10 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[9px] text-slate-300 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                            {bids.length - index}
                                         </div>
                                         <div>
                                            <p className="text-slate-800 font-black uppercase tracking-widest text-[11px] leading-none mb-1">{bid.user.name}</p>
                                            <p className="text-[8px] font-black text-slate-300">USER_REF: {bid.userId.substring(0, 8)}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-10 py-6 text-xl font-black text-slate-800 tracking-tighter group-hover:text-primary transition-colors">{formatCurrency(bid.amount)}</td>
                                   <td className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true }).toUpperCase()}
                                   </td>
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>

           {/* Quick Stats Sidebar */}
           <div className="lg:col-span-4 space-y-10">
              <Card className="bg-white border-none p-10 rounded-sm shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 text-center">Current Asset Valuation</p>
                 <div className="bg-slate-900 border-none p-10 text-center space-y-4 rounded-sm shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                    <p className="text-5xl font-black text-white tracking-tighter relative z-10">{formatCurrency(auction.product.currentPrice || auction.product.startingPrice)}</p>
                    <div className="px-3 py-1 bg-primary/20 text-primary font-black uppercase tracking-widest text-[8px] inline-block mx-auto rounded-full relative z-10 animate-pulse">
                       Real-time Dynamic Sync
                    </div>
                 </div>
                 <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Threshold</p>
                    <p className="text-lg font-black text-slate-800 tracking-tighter">{formatCurrency(auction.product.startingPrice)}</p>
                 </div>
              </Card>

              <Card className="bg-white border-none p-10 rounded-sm shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
                 <h4 className="text-[10px] font-black text-slate-800 mb-10 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Users className="w-4 h-4 text-primary" />
                    Bidding Metrics
                 </h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-sm border border-slate-100">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unique Entities</span>
                       <span className="text-slate-800 font-black text-xl">{new Set(bids.map(b => b.userId)).size}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-sm border border-slate-100">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Value Appreciation</span>
                       <span className="text-primary font-black text-xl tracking-tighter">
                          +{auction.product.startingPrice > 0 ? ((auction.product.currentPrice - auction.product.startingPrice) / auction.product.startingPrice * 100).toFixed(1) : '0.0'}%
                       </span>
                    </div>
                 </div>
              </Card>

              <div className="flex flex-col gap-4 pt-4">
                 <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] h-16 rounded-sm shadow-md transition-all hover:translate-y-[-2px]" disabled={auction.status === 'ENDED'}>
                    Extend Duration
                 </Button>
                 <Button variant="outline" className="w-full border-slate-200 text-slate-400 hover:bg-red-50 hover:text-primary hover:border-red-100 rounded-sm font-black uppercase tracking-widest text-[9px] h-14 transition-all bg-white" disabled={auction.status === 'ENDED'}>
                    Terminate Session
                 </Button>
              </div>
           </div>
        </div>
      </main>

      {/* Terminal Overlay (Winner) */}
      {winnerData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn p-4">
          <div className="bg-white border-none p-12 rounded-sm shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary animate-pulse"></div>
            <div className="w-20 h-20 bg-red-50 text-primary mx-auto mb-8 flex items-center justify-center rounded-full animate-bounce">
                <Zap className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter">ACQUISITION COMPLETE</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Official Synchronization Result</p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-sm p-8 mb-10 text-left space-y-8">
               <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AUTHORITY</span>
                  <span className="text-slate-800 font-black uppercase tracking-tight text-xl">{winnerData.name}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FINAL VALUATION</span>
                  <span className="text-4xl font-black text-primary tracking-tighter leading-none">{formatCurrency(winnerData.amount)}</span>
               </div>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 italic leading-relaxed">
               An official acquisition order has been registered in the system. Fulfillment protocols are now active.
            </p>
            
            <Button 
              onClick={() => setWinnerData(null)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] h-16 rounded-sm transition-all shadow-lg"
            >
              ACKNOWLEDGE & RETURN
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
