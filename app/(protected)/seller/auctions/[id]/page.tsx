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
  const { user, logout } = useAuth()
  
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading auction details...</div>

  if (!auction) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
    <p>Auction not found</p>
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
            <div>
               <h1 className="text-3xl font-bold text-white">Manage Auction</h1>
               <p className="text-slate-400 text-sm">Monitoring bidding for {auction.product.title}</p>
            </div>
          </div>
          <Badge className={`${auction.status === 'ACTIVE' ? 'bg-green-600' : 'bg-blue-600'}`}>
             {auction.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Info */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-800 border-slate-700 p-6">
                 <div className="flex gap-6">
                    <div className="w-24 h-24 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                       {auction.product.image && <img src={auction.product.image} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white mb-2">{auction.product.title}</h2>
                       <p className="text-sm text-slate-400 line-clamp-2">{auction.product.description}</p>
                       <div className="flex items-center gap-4 mt-4">
                          <div className="text-xs text-slate-300 flex items-center gap-1">
                             <Clock className="w-3 h-3 text-amber-500" />
                             Started: {new Date(auction.startTime).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-300 flex items-center gap-1">
                             <Clock className="w-3 h-3 text-red-500" />
                             Ends: {new Date(auction.endTime).toLocaleString()}
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* Bidding History Table */}
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-amber-500" />
                       Bid History
                    </h3>
                    <Badge variant="secondary">{bids.length} Total Bids</Badge>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                          <tr>
                             <th className="px-6 py-3">Bidder</th>
                             <th className="px-6 py-3">Amount</th>
                             <th className="px-6 py-3">Time</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-700">
                          {bids.length === 0 ? (
                             <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No bids yet</td>
                             </tr>
                          ) : (
                             bids.map((bid) => (
                                <tr key={bid.id} className="text-sm">
                                   <td className="px-6 py-4 text-white font-medium">{bid.user.name}</td>
                                   <td className="px-6 py-4 text-amber-500 font-bold">{formatCurrency(bid.amount)}</td>
                                   <td className="px-6 py-4 text-slate-400">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</td>
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>

           {/* Quick Stats Sidebar */}
           <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                 <p className="text-slate-400 text-xs uppercase font-bold mb-2">Highest Bid</p>
                 <p className="text-4xl font-black text-amber-500">{formatCurrency(auction.product.currentPrice || auction.product.startingPrice)}</p>
                 <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-500">Starting at {formatCurrency(auction.product.startingPrice)}</p>
                 </div>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-6">
                 <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Participation
                 </h4>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-400">Unique Bidders</span>
                       <span className="text-white font-bold">{new Set(bids.map(b => b.userId)).size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-400">Price Increase</span>
                       <span className="text-green-500 font-bold">
                          {((auction.product.currentPrice - auction.product.startingPrice) / auction.product.startingPrice * 100).toFixed(1)}%
                       </span>
                    </div>
                 </div>
              </Card>

              <div className="flex flex-col gap-3">
                 <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white" disabled={auction.status === 'ENDED'}>
                    Extend Duration
                 </Button>
                 <Button variant="destructive" className="w-full" disabled={auction.status === 'ENDED'}>
                    Cancel Auction
                 </Button>
              </div>
           </div>
        </div>
      </main>

      {/* Winner Overlay for Seller */}
      {winnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border-2 border-amber-500 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-scaleIn">
            <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold text-white mb-2">Auction Completed!</h2>
            <p className="text-slate-400 mb-6 font-medium">Your item has been sold.</p>
            
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <p className="text-slate-400 text-sm mb-1">Final Buyer</p>
              <p className="text-2xl font-bold text-white mb-4">{winnerData.name}</p>
              <p className="text-slate-400 text-sm mb-1">Sale Price</p>
              <p className="text-3xl font-black text-amber-500">{formatCurrency(winnerData.amount)}</p>
            </div>
            
            <p className="text-slate-500 text-sm mb-6 italic">An order has been created. You can fulfill it from your dashboard.</p>
            
            <Button 
              onClick={() => setWinnerData(null)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12"
            >
              Continue Monitoring
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
