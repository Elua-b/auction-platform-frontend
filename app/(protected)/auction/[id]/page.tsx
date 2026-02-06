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
import { AlertCircle, Clock, TrendingUp, Heart, Share2, ArrowLeft, Zap, Calendar } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/buyer/dashboard">
          <Button variant="outline" className="mb-6 text-slate-300 hover:text-white bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden sticky top-20 shadow-2xl">
              <div className="h-80 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center p-4">
                {product.image ? (
                  <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="text-slate-500">
                    <Zap className="w-16 h-16 opacity-20" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <Button
                  onClick={toggleWatchlist}
                  variant="outline"
                  className="w-full text-slate-300 hover:text-white border-slate-600 bg-transparent"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>

                <Button variant="outline" className="w-full text-slate-300 hover:text-white border-slate-600 bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </Card>
          </div>

          {/* Product Details and Bidding */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Status */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{product.title}</h1>
                {auction && (
                  <Badge
                    className={`${
                      auction.status === 'ACTIVE'
                        ? 'bg-green-600 hover:bg-green-700 animate-pulse'
                        : auction.status === 'UPCOMING'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {auction.status === 'ACTIVE' ? '🔴 LIVE' : auction.status}
                  </Badge>
                )}
              </div>
              
              {auction?.status === 'ACTIVE' && bids.length > 0 && bids[0].userId === user?.id && (
                <Badge className="bg-amber-500 text-black font-bold h-8 px-4 text-xs animate-bounce">
                  CURRENTLY WINNING
                </Badge>
              )}
            </div>

            {/* Description */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
              <p className="text-slate-300">{product.description}</p>
            </Card>

            {/* Auction Info */}
            {auction && (
              <Card className="bg-slate-800 border-slate-700 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Current Bid</p>
                    <p className="text-4xl font-bold text-amber-500">{formatCurrency(highestBid)}</p>
                  </div>
                  <Badge variant="outline" className="h-fit px-4 border-amber-500/50 text-amber-500">
                    {auction.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                   <div className="space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Start Bidding</p>
                      <div className="flex items-center gap-2 text-white font-medium">
                         <Calendar className="w-4 h-4 text-blue-500" />
                         {new Date(auction.startTime).toLocaleString()}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">End Bidding</p>
                      <div className="flex items-center gap-2 text-white font-medium">
                         <Clock className="w-4 h-4 text-red-500" />
                         {new Date(auction.endTime).toLocaleString()}
                      </div>
                   </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <p className="text-slate-400 text-sm mb-2">Countdown</p>
                  <p className={`text-3xl font-black ${timeRemaining.includes('Starts') ? 'text-blue-400' : 'text-white'}`}>
                    {timeRemaining}
                  </p>
                  {auctionMessage && (
                    <p className="mt-2 text-amber-500/80 text-sm italic font-medium">
                      {auctionMessage}
                    </p>
                  )}
                </div>

                {bids.length > 0 && (
                  <div className="border-t border-slate-700 pt-4 flex justify-between items-center text-sm">
                    <span className="text-slate-400">Total Bids</span>
                    <span className="text-white font-bold px-3 py-1 bg-slate-900 rounded-full">{bids.length}</span>
                  </div>
                )}
              </Card>
            )}

            {/* Bidding Form */}
            {auction && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Place Your Bid</h2>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-green-900 border-green-700">
                    <AlertDescription className="text-green-200">{success}</AlertDescription>
                  </Alert>
                )}

                {auction.status === 'ACTIVE' ? (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bid Amount (Minimum: {formatCurrency(highestBid + 1)})
                      </label>
                      <Input
                        type="number"
                        min={highestBid + 1}
                        step="1"
                        placeholder={`${(highestBid + 1)}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={placing || !bidAmount}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg"
                    >
                      {placing ? 'Placing Bid...' : 'Place Bid'}
                    </Button>
                  </form>
                ) : (
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm italic">
                      {auction.status === 'UPCOMING' 
                        ? 'Bidding will open once the start time is reached.' 
                        : 'This auction has ended and is no longer accepting bids.'}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Bid History */}
            {bids.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Bid History</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...bids].reverse().map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div>
                        <p className="text-white font-medium">{bid.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(bid.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-amber-500">{formatCurrency(bid.amount)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Winner Overlay */}
      {winnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border-2 border-amber-500 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-scaleIn">
            <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold text-white mb-2">
               {winnerData.id === user?.id ? "Congratulations!" : "Auction Ended!"}
            </h2>
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <p className="text-slate-400 text-sm mb-1">Highest Bidder</p>
              <p className="text-2xl font-bold text-white mb-4">{winnerData.name}</p>
              <p className="text-slate-400 text-sm mb-1">Final Price</p>
              <p className="text-3xl font-black text-amber-500">{formatCurrency(winnerData.amount)}</p>
            </div>
            {winnerData.id === user?.id && (
               <p className="text-green-500 font-bold mb-6 animate-pulse">You WON this auction!</p>
            )}
            <Button 
              onClick={() => setWinnerData(null)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
