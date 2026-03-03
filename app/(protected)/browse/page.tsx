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
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-7xl space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Market Discovery</span>
               <div className="h-px w-8 bg-slate-200"></div>
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter leading-none">Global Portfolio</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Explore curated collections and live timed auctions</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <Input
                placeholder="SEARCH REGISTRY..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-white border-none text-slate-800 placeholder:text-slate-200 rounded-sm h-14 font-black uppercase tracking-widest text-[10px] focus-visible:ring-1 focus-visible:ring-primary shadow-sm transition-all"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-400 hover:bg-white hover:text-slate-800 rounded-sm h-14 px-8 font-black uppercase tracking-widest text-[10px] transition-all bg-white shadow-sm">
              <Filter className="w-4 h-4 mr-3" />
              Configure Filter
            </Button>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Inventory', icon: null },
            { id: 'LIVE', label: 'Live Theatres', icon: Zap },
            { id: 'TIMED', label: 'Timed Bidding', icon: Timer },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all relative ${filter === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
              </div>
              {filter === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Optimizing Global Feed...</p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Live Events Section */}
            {(filter === 'ALL' || filter === 'LIVE') && filteredEvents.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em] whitespace-nowrap">Live Entry Open</h2>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map(event => (
                    <Link key={event.id} href={`/events/${event.id}`} className="group h-full">
                      <Card className="bg-white border-none overflow-hidden rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                        <div className="bg-slate-900 p-8 h-40 flex flex-col justify-end relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                           <div className="flex justify-between items-center mb-4 relative z-10">
                              <Badge className="bg-primary/20 text-primary border-none rounded-full px-2 text-[7px] font-black uppercase tracking-widest">Active session</Badge>
                              <Zap className="w-4 h-4 text-primary animate-pulse" />
                           </div>
                           <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:scale-[1.02] transition-transform duration-500 leading-tight relative z-10">{event.title}</h3>
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{event.description || 'Exclusive curated collection auction. Real-time bidding enabled.'}</p>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{event.startTime}</span>
                              </div>
                            </div>
                            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-sm h-14 shadow-md transition-all group-hover:translate-y-[-2px]">
                              Enter Live Theatre
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Timed Auctions Section */}
            {(filter === 'ALL' || filter === 'TIMED') && filteredAuctions.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Direct Acquisitions</h2>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredAuctions.map(auction => (
                    <Link key={auction.id} href={`/products/${auction.productId}`} className="group h-full">
                      <Card className="h-full bg-white border-none overflow-hidden rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col relative">
                        <div className="relative h-52 bg-slate-50 overflow-hidden border-b border-slate-50">
                          {auction.product.image ? (
                            <img src={auction.product.image} alt={auction.product.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Gavel className="w-10 h-10 text-slate-100" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                             <Badge className="bg-white/90 backdrop-blur shadow-sm text-slate-800 text-[7px] font-black uppercase rounded-full px-2 py-1 border-none tracking-widest">TIMED</Badge>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/40 to-transparent p-4">
                            <div className="flex items-center gap-2 text-white text-[9px] font-black uppercase tracking-widest">
                              <Timer className="w-3.5 h-3.5 text-primary animate-pulse" />
                              <span className="bg-slate-900/80 px-2 py-1 rounded-sm">Ends {formatDistanceToNow(new Date(auction.endTime), { addSuffix: true }).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col flex-grow">
                          <h3 className="font-black text-slate-800 uppercase tracking-tight text-[15px] leading-tight group-hover:text-primary transition-colors mb-2">{auction.product.title}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-2 leading-relaxed mb-6">{auction.product.description}</p>
                          
                          <div className="mt-auto">
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between mb-4">
                               <div>
                                 <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Valuation Status</p>
                                 <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{formatCurrency(auction.product.startingPrice)}</p>
                               </div>
                               <div className="w-8 h-8 rounded-sm bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                 <Gavel className="w-4 h-4" />
                               </div>
                            </div>
                            <Button className="w-full bg-white border border-slate-200 text-slate-800 hover:bg-primary hover:border-primary hover:text-white font-black uppercase tracking-widest text-[9px] rounded-sm h-12 transition-all">
                              Place Secure Bid
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredEvents.length === 0 && filteredAuctions.length === 0 && (
              <div className="text-center py-32 bg-white border-2 border-slate-100 border-dashed rounded-sm">
                <Search className="w-16 h-16 text-slate-50 mx-auto mb-6" />
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">No Asset Matches Identified</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">The requested parameters did not yield any registry results. Refine your discovery criteria.</p>
                <Button variant="link" className="text-primary mt-8 font-black uppercase tracking-widest text-[10px]" onClick={() => setSearchTerm('')}>Reset Parameters</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
