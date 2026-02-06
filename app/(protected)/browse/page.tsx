'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/header'
import { useAuth } from '@/lib/auth-context'
import { eventAPI, auctionAPI, categoryAPI, productAPI } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Zap, Search, Filter, Gavel, Timer } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  status: string
}

interface Auction {
  id: string
  productId: string
  product: {
    id: string
    title: string
    description: string
    image?: string
    startingPrice: number
  }
  startTime: string
  endTime: string
  status: string
}

interface Category {
  id: string
  name: string
}

export default function BrowsePage() {
  const { user, logout } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'TIMED'>('ALL')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsData, auctionsData, categoriesData] = await Promise.all([
        eventAPI.getAll(),
        auctionAPI.getAll('ACTIVE'),
        categoryAPI.getAll(),
      ])
      setEvents(eventsData.filter((e: Event) => e.status !== 'COMPLETED'))
      setAuctions(auctionsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load browse data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAuctions = auctions.filter(a => 
    a.product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={logout} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Browse Auctions</h1>
            <p className="text-slate-400">Discover live events and timed auctions</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button 
            variant={filter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilter('ALL')}
            className={filter === 'ALL' ? 'bg-amber-500 text-black' : 'border-slate-700 text-slate-400'}
          >
            All Auctions
          </Button>
          <Button 
            variant={filter === 'LIVE' ? 'default' : 'outline'}
            onClick={() => setFilter('LIVE')}
            className={filter === 'LIVE' ? 'bg-red-600 text-white' : 'border-slate-700 text-slate-400'}
          >
            <Zap className="w-4 h-4 mr-2" />
            Live Events
          </Button>
          <Button 
            variant={filter === 'TIMED' ? 'default' : 'outline'}
            onClick={() => setFilter('TIMED')}
            className={filter === 'TIMED' ? 'bg-blue-600 text-white' : 'border-slate-700 text-slate-400'}
          >
            <Timer className="w-4 h-4 mr-2" />
            Timed Bidding
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-slate-400">Loading auctions...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Live Events Section */}
            {(filter === 'ALL' || filter === 'LIVE') && filteredEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-2xl font-bold text-white">Live Events</h2>
                  <Badge className="bg-red-600 animate-pulse">LIVE NOW</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(event => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-amber-500 transition-all group">
                        <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4">
                          <div className="flex justify-between items-center mb-2">
                            <Badge className="bg-black/20 text-white border-white/20 uppercase tracking-wider text-[10px]">Event Room</Badge>
                            <Zap className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <h3 className="text-xl font-bold text-white group-hover:scale-105 transition-transform">{event.title}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <p className="text-slate-400 text-sm line-clamp-2">{event.description || 'Join this live auction event to bid on exclusive items.'}</p>
                          <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-700 pt-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>{event.startTime}</span>
                            </div>
                          </div>
                          <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold group-hover:bg-amber-500 group-hover:text-black transition-colors">
                            Enter Live Room
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Timed Auctions Section */}
            {(filter === 'ALL' || filter === 'TIMED') && filteredAuctions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-2xl font-bold text-white">Timed Online Auctions</h2>
                  <Badge className="bg-blue-600">DIRECT BIDDING</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAuctions.map(auction => (
                    <Link key={auction.id} href={`/auction/${auction.productId}`}>
                      <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden hover:border-blue-500 transition-all group">
                        <div className="relative h-48 bg-slate-900 overflow-hidden">
                          {auction.product.image ? (
                            <img src={auction.product.image} alt={auction.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Gavel className="w-12 h-12 text-slate-700" />
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-blue-600">ONLINE</Badge>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <div className="flex items-center gap-1 text-white text-[10px] uppercase font-bold">
                              <Timer className="w-3 h-3 text-blue-400" />
                              <span>Ends {formatDistanceToNow(new Date(auction.endTime), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition">{auction.product.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2">{auction.product.description}</p>
                          <div className="pt-2 border-t border-slate-700">
                             <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Bid</p>
                             <p className="text-xl font-black text-amber-500">{formatCurrency(auction.product.startingPrice)}</p>
                          </div>
                          <Button className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 text-xs font-bold transition-all">
                            Place Bid
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredEvents.length === 0 && filteredAuctions.length === 0 && (
              <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                <Search className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Auctions Found</h2>
                <p className="text-slate-500 max-w-md mx-auto">We couldn't find any auctions matching "{searchTerm}". Try another search term or check back later.</p>
                <Button variant="link" className="text-amber-500 mt-4" onClick={() => setSearchTerm('')}>Clear Search</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
