'use client'

import React from 'react'
import { Gavel, Clock, ArrowRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Event {
  id: string
  title: string
  description?: string
  status: string
  image?: string
}

interface Product {
  id: string
  title: string
  description: string
  image?: string
  startingPrice: number
  categoryId?: string
}

interface LiveEventsSectionProps {
  events: Event[]
  products: Product[]
  categories: { id: string, name: string }[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  loading: boolean
  onNavigate: (type: 'event' | 'product', id: string) => void
}

export function LiveEventsSection({ 
  events, 
  products, 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  loading, 
  onNavigate 
}: LiveEventsSectionProps) {
  const [activeTab, setActiveTab] = React.useState<'events' | 'products'>('events')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 bg-[#F9F9F9] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
               <div className="h-0.5 w-12 bg-primary"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Market Registry</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter mb-10 uppercase italic">
              Active <span className="text-primary">Inventories</span>
            </h2>
            
            <div className="flex flex-wrap gap-8 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('events')}
                className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'events' ? 'text-primary' : 'text-slate-300 hover:text-slate-500'}`}
              >
                Operational Events
                {activeTab === 'events' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'products' ? 'text-primary' : 'text-slate-300 hover:text-slate-500'}`}
              >
                Asset Portfolio
                {activeTab === 'products' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary"></span>}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <Button variant="outline" className="border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-none h-14 px-8 hover:bg-slate-100 hidden md:flex items-center gap-2 transition-all">
                Synchronize Registry <ArrowRight className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Category Filter - Premium Scroller */}
        {activeTab === 'products' && (
          <div className="relative mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <Filter className="w-4 h-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Filter by Classification</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                      <ChevronLeft className="w-4 h-4" />
                   </button>
                   <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
             
             <div 
               ref={scrollRef}
               className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1"
             >
                <button 
                  onClick={() => onSelectCategory('all')}
                  className={`flex-shrink-0 px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-none border transition-all ${selectedCategory === 'all' ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white border-slate-100 text-slate-400 hover:border-primary hover:text-primary'}`}
                >
                  All Assets
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex-shrink-0 px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-none border transition-all ${selectedCategory === cat.id ? 'bg-primary border-primary text-white shadow-xl translate-y-[-2px]' : 'bg-white border-slate-100 text-slate-400 hover:border-primary hover:text-primary'}`}
                  >
                    {cat.name}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="animate-pulse space-y-6">
                <div className="aspect-[4/3] bg-slate-200 rounded-sm" />
                <div className="h-8 bg-slate-100 w-3/4 rounded-sm" />
                <div className="h-4 bg-slate-50 w-full rounded-sm" />
              </div>
            ))
          ) : activeTab === 'events' ? (
            events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="group cursor-pointer" onClick={() => onNavigate('event', event.id)}>
                   <div className="relative aspect-[4/3] mb-8 overflow-hidden rounded-sm bg-white shadow-2xl transition-all duration-700 hover:translate-y-[-10px]">
                      <img 
                        src={event.image || `https://picsum.photos/seed/${event.id}/800/600`} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2">Operational Access</span>
                         <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Enter The Theatre</h4>
                      </div>
                      <div className="absolute top-6 right-6 w-14 h-14 bg-primary flex items-center justify-center shadow-2xl rounded-sm">
                         <Gavel className="text-white h-6 w-6" />
                      </div>
                      {(event.status === 'ACTIVE' || event.status === 'LIVE') && (
                        <div className="absolute left-6 top-6 bg-primary text-white text-[9px] font-black px-5 py-2 uppercase tracking-[0.3em] shadow-lg animate-pulse">
                          Live Room
                        </div>
                      )}
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-px w-6 bg-slate-200 group-hover:bg-primary transition-all"></div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID: {event.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter group-hover:text-primary transition-colors italic leading-none">
                        {event.title}
                      </h3>
                      <p className="text-slate-500 font-bold text-[11px] line-clamp-2 uppercase tracking-[0.05em] leading-relaxed">
                        {event.description || 'Join the elite bidding circle for this exclusive event. Secure your assets in real-time.'}
                      </p>
                      <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-all flex items-center gap-3">
                         Analyze Details <ArrowRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-sm">
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">No operational events recorded.</p>
              </div>
            )
          ) : (
            products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="group cursor-pointer" onClick={() => onNavigate('product', product.id)}>
                   <div className="relative aspect-[4/3] mb-8 overflow-hidden rounded-sm bg-white shadow-2xl transition-all duration-700 hover:translate-y-[-10px]">
                      <img 
                        src={product.image || `https://picsum.photos/seed/${product.id}/800/600`} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0" 
                      />
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center border-l border-b border-white/20">
                         <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Lot</p>
                         <p className="text-xl font-black text-white leading-none italic">{product.id.slice(-2)}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reserve Target</span>
                            <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">rwf{product.startingPrice.toLocaleString()}</p>
                         </div>
                         <Button className="bg-slate-900 group-hover:bg-primary text-white rounded-none font-black uppercase tracking-widest text-[9px] h-11 px-6 transition-all shadow-xl">
                            Initiate Acquisition
                         </Button>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter group-hover:text-primary transition-colors italic leading-none">
                        {product.title}
                      </h3>
                      <p className="text-slate-500 font-bold text-[11px] line-clamp-2 uppercase tracking-[0.05em] leading-relaxed">
                        {product.description}
                      </p>
                   </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-sm">
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Registry entry not found for this classification.</p>
              </div>
            )
          )}
        </div>

      </div>
    </section>
  )
}
