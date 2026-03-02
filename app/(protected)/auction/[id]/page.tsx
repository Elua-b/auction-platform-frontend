'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI, auctionAPI, bidAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, TrendingUp, Heart, Share2, ArrowLeft, Zap, Calendar, Timer } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { socket } from '@/lib/socket'

interface Product {
  id: string
  title: string
  description: string
  image?: string
  startingPrice: number
  categoryId: string
  status: string
}

interface Auction {
  id: string
  productId: string
  startTime: string
  endTime: string
  status: string
}

interface Bid {
  id: string
  amount: number
  userId: string
  createdAt: string
  user?: { name: string }
}

export default function AuctionDetailsPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()
  const { user, logout } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [auctionMessage, setAuctionMessage] = useState<string>('')
  const [winnerData, setWinnerData] = useState<any>(null)

  useEffect(() => {
    socket.connect()
    
    socket.on('connect', () => {
      console.log('Connected to socket server')
    })

    const handleNewBid = (newBid: Bid) => {
      setBids(prevBids => {
        // Avoid duplicate bids if any
        if (prevBids.some(b => b.id === newBid.id)) return prevBids;
        return [newBid, ...prevBids]; // Place at start of list for history
      });
    }

    socket.on('bidPlaced', handleNewBid);

    const handleAuctionEnded = (data: any) => {
      setWinnerData(data.winner)
      setAuction(prev => prev ? { ...prev, status: 'ENDED' } : null)
    }

    const handleAuctionStatusChanged = (data: any) => {
      setAuction(prev => prev ? { ...prev, status: data.status } : null)
      // Clear any error messages when auction becomes active
      if (data.status === 'ACTIVE') {
        setError(null)
        setAuctionMessage('')
      }
    }

    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('auctionStatusChanged', handleAuctionStatusChanged);

    return () => {
      socket.off('bidPlaced', handleNewBid);
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('auctionStatusChanged', handleAuctionStatusChanged);
      socket.disconnect();
    }
  }, [])

  useEffect(() => {
    if (auction) {
      socket.emit('joinAuction', auction.id);
      return () => {
        socket.emit('leaveAuction', auction.id);
      }
    }
  }, [auction])

  useEffect(() => {
    loadData()
    const savedWatchlist = localStorage.getItem('watchlist') || '[]'
    setWatchlist(JSON.parse(savedWatchlist))
  }, [productId])

  useEffect(() => {
    if (!auction) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const start = new Date(auction.startTime).getTime()
      const end = new Date(auction.endTime).getTime()
      
      let targetTime = end
      let label = 'Ends in'
      
      if (now < start) {
        targetTime = start
        label = 'Starts in'
        setAuctionMessage('Bidding has not started yet')
      } else if (now > end) {
        setTimeRemaining('Auction Ended')
        setAuctionMessage('Bidding has closed')
        return
      } else {
        setAuctionMessage('')
      }

      const diff = targetTime - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      let timeStr = ''
      if (days > 0) {
        timeStr = `${days}d ${hours}h ${label === 'Starts in' ? 'to start' : 'remaining'}`
      } else if (hours > 0) {
        timeStr = `${hours}h ${minutes}m ${label === 'Starts in' ? 'to start' : 'remaining'}`
      } else {
        timeStr = `${minutes}m ${seconds}s ${label === 'Starts in' ? 'to start' : 'remaining'}`
      }
      
      setTimeRemaining(timeStr)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [auction])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productData, auctionsData] = await Promise.all([
        productAPI.getById(productId),
        auctionAPI.getAll(),
      ])

      setProduct(productData)
      const relatedAuction = auctionsData.find((a: Auction) => a.productId === productId)
      setAuction(relatedAuction)

      if (relatedAuction) {
        const bidsData = await bidAPI.getByAuction(relatedAuction.id)
        setBids(bidsData)
      }
    } catch (err) {
      setError('Failed to load auction details')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auction || !bidAmount) return

    if (auction.status !== 'ACTIVE') {
      setError('Bidding is only allowed during the active period.')
      return
    }

    const amount = parseFloat(bidAmount)
    const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : product!.startingPrice

    if (amount <= highestBid) {
      setError(`Bid must be higher than ${formatCurrency(highestBid)}`)
      return
    }

    setPlacing(true)
    setError(null)

    try {
      await bidAPI.place({
        amount,
        auctionId: auction.id,
      })
      setSuccess('Bid placed successfully!')
      setBidAmount('')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid')
    } finally {
      setPlacing(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const toggleWatchlist = () => {
    if (!product) return
    const updated = watchlist.includes(product.id)
      ? watchlist.filter((id) => id !== product.id)
      : [...watchlist, product.id]
    setWatchlist(updated)
    localStorage.setItem('watchlist', JSON.stringify(updated))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-slate-400">Product not found</p>
        </div>
      </div>
    )
  }

  const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : product.startingPrice
  const isWishlisted = watchlist.includes(product.id)

  return (
    <div className="min-h-screen bg-background text-white">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/buyer/dashboard">
            <Button variant="outline" className="text-white border-border hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-widest text-[10px] h-10 px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Control Center
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Asset Visuals */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border overflow-hidden sticky top-24 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-none">
              <div className="h-[450px] bg-black flex items-center justify-center p-8 border-b border-border relative overflow-hidden group">
                {product.image ? (
                  <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="text-muted-foreground/10">
                    <Zap className="w-32 h-32" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6">
                   <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-2">High-Resolution Reference</p>
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter">{product.title}</h2>
                </div>
              </div>

              <div className="p-8 grid grid-cols-2 gap-4">
                <Button
                  onClick={toggleWatchlist}
                  variant="outline"
                  className="w-full text-white border-border hover:bg-white hover:text-black rounded-none font-black uppercase tracking-widest text-[9px] h-12 transition-all"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
                  {isWishlisted ? 'IN COLLECTIONS' : 'SAVE TO LIST'}
                </Button>

                <Button variant="outline" className="w-full text-white border-border hover:bg-white hover:text-black rounded-none font-black uppercase tracking-widest text-[9px] h-12 transition-all">
                  <Share2 className="w-4 h-4 mr-2" />
                  BROADCAST
                </Button>
              </div>
            </Card>
          </div>

          {/* Acquisition Interface */}
          <div className="lg:col-span-2 space-y-10">
            {/* Asset Identity */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary animate-pulse"></div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Asset Ref: {product.id.slice(0,8).toUpperCase()}</p>
                 </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight">{product.title}</h1>
                
                {auction && (
                  <div className="flex gap-3">
                    <Badge
                      className={`rounded-none px-4 py-1.5 font-black uppercase tracking-widest text-[9px] ${
                        auction.status === 'ACTIVE'
                          ? 'bg-primary text-white animate-pulse'
                          : auction.status === 'UPCOMING'
                            ? 'bg-white text-black'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {auction.status === 'ACTIVE' ? 'LIVE NOW' : auction.status}
                    </Badge>
                    <Badge variant="outline" className="rounded-none px-4 border-border text-muted-foreground uppercase tracking-widest text-[9px] font-black">
                       Timed Direct Acquisition
                    </Badge>
                  </div>
                )}
              </div>
              
              {auction?.status === 'ACTIVE' && bids.length > 0 && bids[0].userId === user?.id && (
                <div className="bg-primary/10 border border-primary p-4 rounded-none animate-bounce">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">CURRENTLY UNDER YOUR CONTROL</p>
                </div>
              )}
            </div>

            {/* Asset Narrative */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Strategic Profile</h2>
              <p className="text-lg font-medium text-white leading-relaxed max-w-3xl">{product.description}</p>
            </div>

            {/* Acquisition Data */}
            {auction && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
                <Card className="md:col-span-7 bg-card border-border p-10 rounded-none shadow-2xl relative overflow-hidden border-l-4 border-l-primary flex flex-col justify-between min-h-[300px]">
                  <div className="absolute top-0 right-0 p-4">
                     <TrendingUp className="w-12 h-12 text-white/5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">Current Valuation</p>
                    <p className="text-7xl font-black text-white tracking-tighter mb-2">{formatCurrency(highestBid)}</p>
                     <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Zap className="w-3 h-3 fill-primary" />
                        <span>Real-time Dynamic Pricing</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/5">
                     <div className="space-y-1">
                        <p className="text-muted-foreground text-[8px] uppercase font-black tracking-[0.3em]">Lifecycle Start</p>
                        <div className="flex items-center gap-3 text-white font-black uppercase tracking-tighter text-sm">
                           <Calendar className="w-3 h-3 text-primary" />
                           {new Date(auction.startTime).toLocaleString()}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground text-[8px] uppercase font-black tracking-[0.3em]">Termination Phase</p>
                        <div className="flex items-center gap-3 text-white font-black uppercase tracking-tighter text-sm">
                           <Clock className="w-3 h-3 text-primary" />
                           {new Date(auction.endTime).toLocaleString()}
                        </div>
                     </div>
                  </div>
                </Card>

                <Card className="md:col-span-5 bg-black border-border p-10 rounded-none flex flex-col items-center justify-center text-center shadow-inner">
                  <Timer className="w-10 h-10 text-primary mb-6 animate-pulse" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">PHASE TERMINATION</p>
                  <p className={`text-3xl font-black tracking-tighter uppercase ${timeRemaining.includes('Starts') ? 'text-white' : 'text-primary'}`}>
                    {timeRemaining}
                  </p>
                  {auctionMessage && (
                    <p className="mt-4 text-white/40 text-[9px] font-black uppercase tracking-widest">
                      // {auctionMessage}
                    </p>
                  )}
                  {bids.length > 0 && (
                    <div className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-4">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SECURE BIDS</span>
                      <span className="text-white font-black text-sm">{bids.length}</span>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Bidding Control Panel */}
            {auction && (
              <Card className="bg-card border-border p-10 rounded-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-px bg-primary flex-1"></div>
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-4">Authorized Bidding Theatre</h2>
                    <div className="h-px bg-primary flex-1"></div>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-8 rounded-none border-primary bg-primary/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-black uppercase tracking-widest text-[10px]">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-8 bg-white border-white rounded-none">
                    <AlertDescription className="text-black font-black uppercase tracking-widest text-[10px]">{success}</AlertDescription>
                  </Alert>
                )}

                {auction.status === 'ACTIVE' ? (
                  <form onSubmit={handlePlaceBid} className="space-y-10">
                    <div className="relative">
                      <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                        Capital Deployment (MIN: {formatCurrency(highestBid + 1)})
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={highestBid + 1}
                          step="1"
                          placeholder={`${(highestBid + 1)}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="bg-black border-border rounded-none h-20 text-4xl font-black tracking-tighter px-8 text-white focus:border-primary transition-all pr-32"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                           <p className="text-[10px] font-black text-muted-foreground">RWF</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={placing || !bidAmount}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-none h-20 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {placing ? 'AUTHORIZING TRANSACTION...' : 'COMMIT SECURE BID'}
                    </Button>
                  </form>
                ) : (
                  <div className="p-10 bg-black border border-white/5 rounded-none text-center">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic">
                      // {auction.status === 'UPCOMING' 
                        ? 'ACCESS PENDING SYSTEM INITIALIZATION' 
                        : 'DIRECT ACQUISITION PHASE TERMINATED'}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Synchronization Log (Bid History) */}
            {bids.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] pr-4">Transaction History</h2>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                  {[...bids].reverse().map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-6 bg-card border border-border group hover:border-white transition-all rounded-none ${index === 0 ? 'border-primary shadow-lg shadow-primary/5' : ''}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 flex items-center justify-center font-black rounded-none border ${index === 0 ? 'bg-primary border-primary text-white' : 'bg-black border-border text-muted-foreground'}`}>
                           {bids.length - index}
                        </div>
                        <div>
                          <p className="text-white font-black uppercase tracking-widest text-[10px] group-hover:text-primary transition-colors">{bid.user?.name || 'ANONYMOUS ENTITY'}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
                            {formatDistanceToNow(new Date(bid.createdAt), {
                              addSuffix: true,
                            }).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <p className={`text-xl font-black tracking-tighter ${index === 0 ? 'text-primary' : 'text-white'}`}>{formatCurrency(bid.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Terminal Overlay (Winner) */}
      {winnerData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn p-4">
          <div className="bg-card border-4 border-primary p-12 rounded-none shadow-[0_0_100px_rgba(255,0,0,0.2)] max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
            <Zap className="w-20 h-20 text-primary mx-auto mb-8 animate-bounce" />
            <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">
               {winnerData.id === user?.id ? "ACQUIRED" : "PHASE ENDED"}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-10">Official Synchronization Result</p>
            
            <div className="bg-black border border-border p-8 mb-10 text-left space-y-6">
               <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">AUTHORITY</span>
                  <span className="text-white font-black uppercase tracking-tighter text-lg">{winnerData.name}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">FINAL VALUATION</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(winnerData.amount)}</span>
               </div>
            </div>

            {winnerData.id === user?.id && (
               <div className="mb-10 p-4 bg-primary/20 border border-primary animate-pulse">
                  <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">// SUCCESS: ASSET CONTROL TRANSFERRED</p>
               </div>
            )}
            
            <Button 
              onClick={() => setWinnerData(null)}
              className="w-full bg-primary hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-xs h-16 rounded-none transition-all"
            >
              ACKNOWLEDGE & PROCEED
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
