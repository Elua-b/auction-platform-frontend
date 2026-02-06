'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { eventAPI, bidAPI, productAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, TrendingUp, Users, ArrowLeft, Zap, Package } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { socket } from '@/lib/socket'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  status: string
  products?: string[]
}

interface EventProduct {
  id: string
  productId: string
  order: number
  product: {
    id: string
    title: string
    description: string
    image?: string
    startingPrice: number
    status: string
  }
}

interface Bid {
  id: string
  amount: number
  userId: string
  createdAt: string
  user?: { name: string }
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const router = useRouter()
  const { user, logout } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [eventProducts, setEventProducts] = useState<EventProduct[]>([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [currentBids, setCurrentBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [managing, setManaging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentEventProduct, setCurrentEventProduct] = useState<string | null>(null)
  const [lotDuration, setLotDuration] = useState('3') // Default 3 mins
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [winnerData, setWinnerData] = useState<any>(null)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  useEffect(() => {
    socket.connect()

    const handleEventUpdate = (update: any) => {
      if (update.type === 'EVENT_STARTED') {
        setEvent(prev => prev ? { ...prev, status: update.status } : null)
      } else if (update.type === 'PRODUCT_ACTIVATED') {
        setCurrentEventProduct(update.eventProductId)
        setWinnerData(null) // Clear any previous winner
        
        // Handle countdown
        if (update.endsAt) {
          const end = new Date(update.endsAt).getTime()
          const now = Date.now()
          setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)))
        }
        setCurrentBids([])
      } else if (update.type === 'PRODUCT_ENDED') {
        if (update.winner) {
          setWinnerData(update.winner)
        } else {
          setSuccess('Product ended without winner')
          setTimeout(() => setSuccess(null), 5000)
        }
        setCurrentEventProduct(null)
        setTimeLeft(null)
      } else if (update.type === 'EVENT_ENDED') {
        setEvent(prev => prev ? { ...prev, status: 'COMPLETED' } : null)
        setSuccess('Event has been completed by the seller')
      }
    }

    const handleLiveBid = (bid: Bid) => {
      setCurrentBids(prev => {
        if (prev.some(b => b.id === bid.id)) return prev
        return [bid, ...prev]
      })
    }

    socket.on('eventUpdate', handleEventUpdate)
    socket.on('liveBidPlaced', handleLiveBid)

    socket.on('liveBidPlaced', handleLiveBid)

    return () => {
      socket.off('eventUpdate', handleEventUpdate)
      socket.off('liveBidPlaced', handleLiveBid)
    }
  }, []) // Removed eventProducts dependency

  // Sync currentProductIndex with currentEventProduct
  useEffect(() => {
    if (currentEventProduct && eventProducts.length > 0) {
      const index = eventProducts.findIndex(p => p.id === currentEventProduct)
      if (index !== -1) {
        setCurrentProductIndex(index)
      }
    }
  }, [currentEventProduct, eventProducts])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (eventId) {
      socket.emit('joinEvent', eventId)
      return () => {
        socket.emit('leaveEvent', eventId)
      }
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const eventData = await eventAPI.getById(eventId)
      setEvent(eventData)

      const products = eventData.products || []
      setEventProducts(products)
      
      if (products.length > 0) {
        // Try to find currently active product (one with endsAt in the future)
        const activeProduct = products.find((p: any) => p.endsAt && new Date(p.endsAt) > new Date())
        if (activeProduct) {
          const index = products.findIndex((p: any) => p.id === activeProduct.id)
          setCurrentProductIndex(index)
          setCurrentEventProduct(activeProduct.id)
          
          // Set time left
          const end = new Date(activeProduct.endsAt).getTime()
          const now = Date.now()
          setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)))
          
          // Load bids for this product
          loadBids(activeProduct.id)
        } else {
          setCurrentProductIndex(0)
        }
      }
    } catch (err) {
      setError('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const loadBids = async (eventProductId: string) => {
    try {
      const bids = await bidAPI.getByEventProduct(eventProductId)
      setCurrentBids(bids)
    } catch (err) {
      console.error('Failed to load bids:', err)
    }
  }

  const loadBidsForProduct = async (productId: string) => {
    // Mock bids for demo
    const mockBids = [
      {
        id: '1',
        amount: 500,
        userId: 'user-2',
        createdAt: new Date(Date.now() - 30000).toISOString(),
        user: { name: 'John D.' },
      },
      {
        id: '2',
        amount: 400,
        userId: 'user-3',
        createdAt: new Date(Date.now() - 60000).toISOString(),
        user: { name: 'Sarah M.' },
      },
      {
        id: '3',
        amount: 300,
        userId: 'user-4',
        createdAt: new Date(Date.now() - 90000).toISOString(),
        user: { name: 'Mike L.' },
      },
    ]
    setCurrentBids(mockBids)
  }

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bidAmount || !event || !eventProducts[currentProductIndex]) return

    const amount = parseFloat(bidAmount)
    const currentProduct = eventProducts[currentProductIndex]
    const highestBidValue = currentBids.length > 0 ? Math.max(...currentBids.map((b) => b.amount)) : currentProduct.product.startingPrice

    if (amount <= highestBidValue) {
      setError(`Bid must be higher than ${formatCurrency(highestBidValue)}`)
      return
    }

    setPlacing(true)
    setError(null)

    try {
      await bidAPI.place({
        amount,
        eventProductId: currentProduct.id,
      })
      setBidAmount('')
    } catch (err: any) {
      setError(err.message || 'Failed to place bid')
    } finally {
      setPlacing(false)
    }
  }

  const handleStartEvent = async () => {
    try {
      setManaging(true)
      await eventAPI.start(eventId)
    } catch (err: any) {
      setError(err.message || 'Failed to start event')
    } finally {
      setManaging(false)
    }
  }

  const handleEndEvent = async () => {
    if (!confirm('Are you sure you want to end this event? This will close all active bidding.')) return
    try {
      setManaging(true)
      await eventAPI.end(eventId)
    } catch (err: any) {
      setError(err.message || 'Failed to end event')
    } finally {
      setManaging(false)
    }
  }

  const handleActivateProduct = async (eventProductId: string) => {
    try {
      setManaging(true)
      const duration = parseInt(lotDuration) || 3
      await eventAPI.activateProduct(eventId, eventProductId, duration)
      // We don't need to manually set states here as the socket broadcast will do it
    } catch (err: any) {
      setError(err.message || 'Failed to activate product')
    } finally {
      setManaging(false)
    }
  }

  const handleEndProduct = async (eventProductId: string) => {
    try {
      setManaging(true)
      await eventAPI.endProduct(eventId, eventProductId)
    } catch (err: any) {
      setError(err.message || 'Failed to end product')
    } finally {
      setManaging(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const nextProduct = () => {
    if (currentProductIndex < eventProducts.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1)
      setSuccess(null)
      setError(null)
    }
  }

  const previousProduct = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1)
      setSuccess(null)
      setError(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-slate-400">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-slate-400">Event not found</p>
        </div>
      </div>
    )
  }

  const currentProduct = eventProducts[currentProductIndex]
  const highestBid = currentBids.length > 0 ? Math.max(...currentBids.map((b) => b.amount)) : currentProduct?.product?.startingPrice || 0

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/events">
          <Button variant="outline" className="mb-6 text-slate-300 hover:text-white border-slate-600 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
              {event.description && <p className="text-slate-400 mb-2">{event.description}</p>}
              <div className="flex gap-4 text-sm text-slate-400">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>🕐 {event.startTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.userType === 'SELLER' && (
                <div className="flex gap-2">
                  <Link href={`/seller/events/${event.id}/manage`}>
                    <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black bg-transparent">
                      Manage Items
                    </Button>
                  </Link>
                  {event.status === 'LIVE' && (
                    <Button 
                      onClick={handleEndEvent} 
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 font-semibold"
                      disabled={managing}
                    >
                      End Event
                    </Button>
                  )}
                </div>
              )}
              <Badge
                className={`${
                  event.status === 'LIVE'
                    ? 'bg-green-600 hover:bg-green-700 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {event.status === 'LIVE' ? '🔴 LIVE' : 'UPCOMING'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Auction Area */}
          <div className="lg:col-span-2 space-y-6">
            {eventProducts.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No items in this event yet</h2>
                <p className="text-slate-400 mb-6">Waiting for the host to add properties to this auction collection.</p>
                {user?.userType === 'SELLER' && (
                  <Link href={`/seller/events/${eventId}/manage`}>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                      Manage Event Items
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <>
                {/* Current Product */}
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Lot {currentProductIndex + 1} of {eventProducts.length}</span>
                  <span className="text-sm">Live Event</span>
                </div>
                <h2 className="text-3xl font-bold">{currentProduct.product.title}</h2>
              </div>

              {/* Product Image Area */}
              <div className="h-96 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                {currentProduct.product.image ? (
                  <img src={currentProduct.product.image} alt={currentProduct.product.title} className="w-full h-full object-cover" />
                ) : (
                  <Zap className="w-24 h-24 text-amber-500 opacity-50" />
                )}
                
                {/* Seller Controls Over Image */}
                {user?.userType === 'SELLER' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex gap-4">
                      {event.status === 'SCHEDULED' && (
                        <Button onClick={handleStartEvent} className="bg-green-600 hover:bg-green-700">Start Event</Button>
                      )}
                      {event.status === 'LIVE' && currentEventProduct !== currentProduct.id && (
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/20">
                            <span className="text-xs text-white">Duration:</span>
                            <Input 
                              type="number" 
                              value={lotDuration} 
                              onChange={(e) => setLotDuration(e.target.value)}
                              className="w-16 h-8 bg-slate-900 border-slate-700 text-xs"
                              min="1"
                            />
                            <span className="text-xs text-white">mins</span>
                          </div>
                          <Button onClick={() => handleActivateProduct(currentProduct.id)} className="bg-amber-500 text-black hover:bg-amber-600">Play Product</Button>
                        </div>
                      )}
                      {event.status === 'LIVE' && currentEventProduct === currentProduct.id && (
                        <Button onClick={() => handleEndProduct(currentProduct.id)} className="bg-red-600 hover:bg-red-700">Stop (End Lot)</Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-6 border-t border-slate-700">
                <div className="flex gap-4">
                  <Button
                    onClick={previousProduct}
                    disabled={currentProductIndex === 0}
                    variant="outline"
                    className="flex-1 text-slate-300 hover:text-white border-slate-600 bg-transparent"
                  >
                    ← Previous Lot
                  </Button>
                  <Button
                    onClick={nextProduct}
                    disabled={currentProductIndex === eventProducts.length - 1}
                    variant="outline"
                    className={`flex-1 ${success && !success.includes('Winner:') && currentProductIndex < eventProducts.length - 1 ? 'bg-amber-500 text-black border-amber-500 animate-bounce' : 'text-slate-300 border-slate-600 bg-transparent'} hover:text-white`}
                  >
                    {success && !success.includes('Winner:') && currentProductIndex < eventProducts.length - 1 ? 'Go to Next Lot →' : 'Next Lot →'}
                  </Button>
                </div>
              </div>
            </Card>
           </>
          )}
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm">Current Bid</p>
                {currentEventProduct !== currentProduct?.id && (
                   <Badge variant="outline" className="border-slate-700 text-slate-500 uppercase">Waiting</Badge>
                )}
              </div>
              <p className="text-4xl font-bold text-amber-500 mb-4">{formatCurrency(highestBid)}</p>

              {currentEventProduct === currentProduct?.id && currentBids.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Led by</p>
                  <p className="text-white font-semibold">{currentBids[0].user?.name}</p>
                </div>
              )}

              {currentEventProduct === currentProduct?.id && timeLeft !== null && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">Time Remaining</p>
                    <p className={`text-xl font-mono font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${(timeLeft / 180) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {event.status === 'LIVE' && currentEventProduct !== currentProduct?.id && (
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
                   <p className="text-xs text-slate-500 italic">This lot is currently in preview. Waiting for the host to start bidding.</p>
                </div>
              )}
            </Card>

            {/* Bidding Form */}
            {event.status === 'LIVE' && currentEventProduct === currentProduct.id && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Place Your Bid</h3>

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

                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bid Amount
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
                    <p className="text-xs text-slate-400 mt-1">Minimum: {formatCurrency(highestBid + 1)}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={placing || !bidAmount}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    {placing ? 'Placing Bid...' : 'Place Bid Now'}
                  </Button>
                </form>
              </Card>
            )}

            {/* Live Bid Feed */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Live Bids
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {currentBids.length === 0 ? (
                  <p className="text-slate-400 text-sm">No bids yet. Be the first!</p>
                ) : (
                  currentBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{bid.user?.name}</p>
                          <p className="text-xs text-slate-400">Just now</p>
                        </div>
                        <p className="text-lg font-bold text-amber-500">{formatCurrency(bid.amount)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Lot Collection / Sidebar List */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Collection Lots
              </h3>
              <div className="space-y-3">
                {eventProducts.map((ep, index) => (
                  <div key={ep.id} className={`flex items-center justify-between p-3 rounded-lg border transition ${
                    currentEventProduct === ep.id ? 'bg-amber-500/10 border-amber-500' : 
                    ep.product.status === 'SOLD' ? 'bg-green-500/5 border-green-500/30 opacity-60' :
                    ep.product.status === 'AUCTIONED' ? 'bg-slate-800 border-slate-700 opacity-60' :
                    'bg-slate-900/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                      <span className={`text-sm ${currentEventProduct === ep.id ? 'text-amber-500 font-bold' : 'text-white'}`}>
                        {ep.product.title}
                      </span>
                    </div>
                    <Badge className={`${
                      currentEventProduct === ep.id ? 'bg-amber-500 text-black animate-pulse' : 
                      ep.product.status === 'SOLD' ? 'bg-green-600' :
                      ep.product.status === 'AUCTIONED' ? 'bg-gray-600' :
                      'bg-slate-700 text-slate-300'
                    } text-[10px] h-5`}>
                      {currentEventProduct === ep.id ? 'LIVE' : ep.product.status === 'SOLD' ? 'SOLD' : ep.product.status === 'AUCTIONED' ? 'ENDED' : 'UPCOMING'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Total Bids</span>
                  <span className="text-white font-bold">{currentBids.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Bidders</span>
                  <span className="text-white font-bold">{new Set(currentBids.map((b) => b.userId)).size}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Winner Overlay */}
      {winnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border-2 border-amber-500 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-scaleIn">
            <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold text-white mb-2">
               {winnerData.userId === user?.id ? "Congratulations!" : "Item Sold!"}
            </h2>
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <p className="text-slate-400 text-sm mb-1">Highest Bidder</p>
              <p className="text-2xl font-bold text-white mb-4">{winnerData.name}</p>
              <p className="text-slate-400 text-sm mb-1">Final Price</p>
              <p className="text-3xl font-black text-amber-500">{formatCurrency(winnerData.amount)}</p>
            </div>
            {winnerData.userId === user?.id && (
               <p className="text-green-500 font-bold mb-6 animate-pulse">You WON this property!</p>
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
