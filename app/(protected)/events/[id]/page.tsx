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
import { AlertCircle, Clock, TrendingUp, Users, ArrowLeft, Zap, Package, Settings, Terminal, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { socket } from '@/lib/socket'
import { formatDistanceToNow } from 'date-fns'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  status: string
  products?: string[]
  createdBy?: string
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
    <div className="min-h-screen bg-background text-white">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-12">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <Link href="/events">
              <Button variant="outline" className="text-white border-border hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-widest text-[10px] h-10 px-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Experiences
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{event.title}</h1>
              <div className="flex items-center gap-4">
                <Badge className={`${event.status === 'LIVE' ? 'bg-primary animate-pulse' : 'bg-white text-black'} text-white rounded-none font-black uppercase tracking-widest text-[8px] px-3`}>
                  {event.status === 'LIVE' ? 'LIVE THEATRE ACTIVE' : 'UPCOMING PHASE'}
                </Badge>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[8px] flex items-center gap-2">
                   <Calendar className="w-3 h-3 text-primary" /> {new Date(event.date).toLocaleDateString()} <span className="text-border">|</span> <Clock className="w-3 h-3 text-primary" /> {event.startTime}
                </p>
              </div>
            </div>
          </div>
          
          {user?.id === event.createdBy && (
            <Link href={`/seller/events/${event.id}/manage`}>
              <Button className="bg-white hover:bg-white/90 text-black font-black uppercase tracking-widest text-xs rounded-none h-16 px-10 shadow-xl transition-all hover:scale-105 active:scale-95">
                <Settings className="w-5 h-5 mr-3" />
                Theatre Operations
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-10 rounded-none border-primary bg-primary/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-black uppercase tracking-widest text-[10px]">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Stage: Current Lot */}
          <div className="lg:col-span-8 space-y-12">
            {currentProduct ? (
              <Card className="bg-card border-border rounded-none overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-t-8 border-t-primary">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-[500px] bg-black relative group overflow-hidden">
                    {currentProduct.product.image ? (
                      <img src={currentProduct.product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={currentProduct.product.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-muted-foreground/10" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 bg-primary text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 shadow-xl">
                      LOT {currentProductIndex + 1} OF {eventProducts.length}
                    </div>
                    {currentEventProduct === currentProduct.id && (
                      <div className="absolute bottom-6 left-6 right-6">
                          <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 rounded-none font-black uppercase tracking-widest text-[8px] mb-2">
                            ACTIVE ACQUISITION PHASE
                          </Badge>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{currentProduct.product.title}</h2>
                      </div>
                    )}
                  </div>

                  <div className="p-10 flex flex-col justify-between">
                    <div className="space-y-8">
                       <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">Live Bid Value</p>
                          <p className="text-6xl font-black text-white tracking-tighter">{formatCurrency(highestBid)}</p>
                          <div className="flex items-center gap-2 mt-4 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3 fill-primary" />
                            <span>Real-time Dynamic Sync</span>
                          </div>
                       </div>

                       {currentEventProduct === currentProduct.id && timeLeft !== null && (
                         <div className="space-y-4">
                            <div className="flex justify-between items-center bg-black p-4 border border-border">
                               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">PHASE TERMINATION</span>
                               <span className={`text-2xl font-black tracking-tighter ${timeLeft < 30 ? 'text-primary animate-pulse' : 'text-white'}`}>
                                 {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                               </span>
                            </div>
                         </div>
                       )}

                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Asset Strategy</p>
                          <p className="text-sm font-medium text-white leading-loose line-clamp-4">{currentProduct.product.description}</p>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-border space-y-6">
                       {currentEventProduct === currentProduct.id && currentBids.length > 0 && currentBids[0].userId === user?.id && (
                          <div className="p-4 bg-primary/10 border border-primary text-center">
                             <p className="text-primary font-black uppercase tracking-widest text-[10px]">CURRENTLY UNDER YOUR CONTROL</p>
                          </div>
                       )}
                       
                       {event.status === 'LIVE' && currentEventProduct === currentProduct.id ? (
                        <form onSubmit={handlePlaceBid} className="space-y-6">
                           <div className="relative">
                             <Input
                               type="number"
                               min={highestBid + 1}
                               step="1"
                               placeholder={`MIN: ${highestBid + 1}`}
                               value={bidAmount}
                               onChange={(e) => setBidAmount(e.target.value)}
                               className="bg-black border-border rounded-none h-16 text-2xl font-black tracking-tighter px-6 transition-all focus:border-primary pr-20"
                             />
                             <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">RWF</div>
                           </div>
                           <Button 
                             type="submit" 
                             disabled={placing || !bidAmount}
                             className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-none h-16 shadow-2xl transition-all"
                           >
                             {placing ? 'AUTHORIZING...' : 'COMMIT SECURE BID'}
                           </Button>
                        </form>
                       ) : (
                         <div className="p-6 bg-black border border-border text-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic leading-loose">
                               {event.status === 'LIVE' ? 'PENDING OPERATOR AUTHORIZATION' : 'ACCESS PENDING SYSTEM INITIALIZATION'}
                            </p>
                         </div>
                       )}

                       <div className="flex gap-4">
                        <Button
                          onClick={previousProduct}
                          disabled={currentProductIndex === 0}
                          variant="outline"
                          className="flex-1 text-white border-border hover:bg-white hover:text-black rounded-none font-black uppercase tracking-widest text-[9px] h-12 transition-all"
                        >
                          ← PREVIOUS
                        </Button>
                        <Button
                          onClick={nextProduct}
                          disabled={currentProductIndex === eventProducts.length - 1}
                          variant="outline"
                          className={`flex-1 ${success && !success.includes('Winner:') ? 'bg-primary text-white border-primary' : 'text-white border-border'} hover:bg-white hover:text-black rounded-none font-black uppercase tracking-widest text-[9px] h-12 transition-all`}
                        >
                           NEXT →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-card border-border p-24 text-center rounded-none shadow-2xl border-dashed">
                <Zap className="w-20 h-20 text-muted-foreground/10 mx-auto mb-8 animate-pulse" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Theatre Suspended</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] max-w-md mx-auto leading-loose">Waiting for the operator to initialize the next asset acquisition phase.</p>
              </Card>
            )}

            {/* Event Timeline (Lot List) */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Acquisition Pipeline</h2>
                  <div className="h-px bg-white/10 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {eventProducts.map((ep, idx) => {
                  const isActive = currentEventProduct === ep.id;
                  const isSold = ep.product.status === 'SOLD';
                  return (
                    <Card key={ep.id} onClick={() => setCurrentProductIndex(idx)} className={`bg-card border-border rounded-none overflow-hidden transition-all duration-500 group relative cursor-pointer ${isActive ? 'ring-2 ring-primary border-primary' : idx === currentProductIndex ? 'border-white' : 'hover:border-white/50'}`}>
                      <div className="h-48 bg-black relative overflow-hidden">
                        {ep.product.image ? (
                          <img src={ep.product.image} className={`w-full h-full object-cover transition-all duration-700 ${!isActive && idx !== currentProductIndex ? 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100' : ''}`} alt={ep.product.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/10" />
                          </div>
                        )}
                        <div className={`absolute top-0 left-0 px-4 py-2 font-black text-[10px] shadow-xl ${isActive ? 'bg-primary text-white' : 'bg-black text-muted-foreground'}`}>
                          LOT: {ep.order}
                        </div>
                        {isSold && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                             <Badge className="bg-white text-black rounded-none px-6 py-2 font-black uppercase tracking-widest text-[10px]">ACQUIRED</Badge>
                          </div>
                        )}
                        {isActive && (
                           <div className="absolute top-2 right-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                           </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-black text-white uppercase tracking-tighter text-sm mb-4 truncate group-hover:text-primary transition-colors">{ep.product.title}</h3>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Starting Valuation</p>
                            <p className="text-lg font-black text-white tracking-tighter">{formatCurrency(ep.product.startingPrice)}</p>
                          </div>
                          {isActive ? (
                            <Button className="bg-primary text-white h-10 px-6 rounded-none font-black uppercase tracking-widest text-[9px] animate-pulse">
                               LIVE
                            </Button>
                          ) : (
                            <Badge variant="outline" className="rounded-none border-border text-muted-foreground/40 font-black uppercase tracking-widest text-[8px] h-8 px-4">
                               PENDING
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar: Log & Controls */}
          <div className="lg:col-span-4 space-y-10">
            {/* Operator Controls */}
            {user?.userType === 'SELLER' && (
              <Card className="bg-card border-border p-8 rounded-none shadow-2xl relative overflow-hidden border-t-4 border-t-white">
                <div className="flex items-center gap-3 mb-8">
                  <Terminal className="w-5 h-5 text-white" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Theatre Operations</h3>
                </div>
                
                <div className="space-y-6">
                  {event.status === 'SCHEDULED' && (
                    <Button 
                      onClick={handleStartEvent} 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-16 rounded-none shadow-xl transition-all"
                      disabled={managing}
                    >
                      INITIALIZE EVENT
                    </Button>
                  )}

                  {event.status === 'LIVE' && currentProduct && (
                    <div className="space-y-4">
                      {currentEventProduct !== currentProduct.id ? (
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">PHASE DURATION (MINS)</label>
                              <Input 
                                type="number" 
                                value={lotDuration} 
                                onChange={(e) => setLotDuration(e.target.value)}
                                className="bg-black border-border rounded-none h-12 text-white font-black text-lg"
                                min="1"
                              />
                           </div>
                           <Button 
                             onClick={() => handleActivateProduct(currentProduct.id)} 
                             className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-16 rounded-none transition-all"
                             disabled={managing}
                           >
                             AUTHORIZE LOT
                           </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleEndProduct(currentProduct.id)} 
                          className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-16 rounded-none transition-all"
                          disabled={managing}
                        >
                          TERMINATE PHASE
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {event.status === 'LIVE' && (
                      <Button 
                        variant="outline" 
                        className="w-full border-primary/20 text-primary/60 hover:bg-primary hover:text-white rounded-none font-black uppercase tracking-widest text-[9px] h-14 transition-all"
                        onClick={handleEndEvent}
                        disabled={managing}
                      >
                        TERMINATE SESSION
                      </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Synchronization Log (Bid History) */}
            <Card className="bg-card border-border rounded-none shadow-2xl flex flex-col max-h-[800px]">
              <div className="p-8 border-b border-border bg-black/20 flex items-center justify-between">
                <div>
                   <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Dynamic Sync Log</h3>
                   <p className="text-primary text-[8px] font-black uppercase tracking-widest mt-1">Live Feed Active</p>
                </div>
                <div className="w-10 h-10 rounded-none bg-black border border-border flex items-center justify-center font-black text-sm">{currentBids.length}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {currentBids.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No active data streams...</p>
                  </div>
                ) : (
                  currentBids.map((bid, index) => (
                    <div key={bid.id} className={`flex items-center justify-between p-5 bg-black/40 border-l-2 transition-all group ${index === 0 ? 'border-primary bg-white/5' : 'border-transparent'}`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-8 h-8 flex items-center justify-center font-black text-[10px] rounded-none border ${index === 0 ? 'bg-primary border-primary text-white' : 'bg-black border-border text-muted-foreground'}`}>
                              {currentBids.length - index}
                           </div>
                           <div>
                              <p className="text-white font-black uppercase tracking-widest text-[9px] group-hover:text-primary transition-colors">{bid.user?.name || 'ANONYMOUS ENTITY'}</p>
                              <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-1">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true }).toUpperCase()}</p>
                           </div>
                        </div>
                        <p className={`font-black tracking-tighter text-lg ${index === 0 ? 'text-primary' : 'text-white'}`}>{formatCurrency(bid.amount)}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
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
