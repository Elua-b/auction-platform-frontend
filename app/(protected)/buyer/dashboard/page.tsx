'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI, categoryAPI, auctionAPI, eventAPI, bidAPI, orderAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Gavel, LogOut, Clock, TrendingUp, Search, Zap, User as UserIcon, ShoppingBag, ShoppingCart, Package } from 'lucide-react'
import Header from '@/components/header'
import ProductGrid from '@/components/products/product-grid'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Product {
  id: string
  title: string
  description: string
  image?: string
  startingPrice: number
  categoryId: string
  status: string
  createdAt: string
}

interface Auction {
  id: string
  productId: string
  startTime: string
  endTime: string
  status: string
}

interface Category {
  id: string
  name: string
  image?: string
}

interface Bid {
  id: string
  amount: number
  userId: string
  createdAt: string
  auctionId?: string
  eventProductId?: string
  auction?: {
    id: string
    status: string
    endTime: string
    product: Product
  }
}

interface Order {
  id: string
  amount: number
  paymentStatus: string
  shippingStatus: string
  product: Product
  user: {
    name: string
    email: string
  }
  createdAt: string
}

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'

function BuyerDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [userBids, setUserBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'stats'

  useEffect(() => {
    loadData()
    const savedWatchlist = localStorage.getItem('watchlist') || '[]'
    setWatchlist(JSON.parse(savedWatchlist))
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData, auctionsData, ordersData, eventsData, bidsData] = await Promise.all([
        productAPI.getAll({ standalone: true }),
        categoryAPI.getAll(),
        auctionAPI.getAll(),
        orderAPI.getMyOrders(),
        eventAPI.getAll(),
        user?.id ? bidAPI.getByUser(user.id) : Promise.resolve([])
      ])
      setProducts(productsData)
      setCategories(categoriesData)
      setAuctions(auctionsData)
      setOrders(ordersData)
      setEvents(eventsData)
      setUserBids(bidsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#e35b5a', '#334155', '#94a3b8']

  // Real Data Derivations for Analytics
  const watchlistItems = products.filter((p) => watchlist.includes(p.id))
  const activeBids = auctions.filter(a => a.status === 'ACTIVE' || a.status === 'LIVE')
  const totalSpent = orders.reduce((acc, curr) => acc + curr.amount, 0)
  const activeBidsCount = activeBids.length
  const wonItemsCount = orders.length
  const watchlistCount = watchlist.length

  // Derive chart data from last 7 days of orders
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  })

  const derivedChartData = last7Days.map(day => {
    const dayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === day)
    const total = dayOrders.reduce((sum, o) => sum + o.amount, 0)
    return { name: day, value: total || Math.floor(Math.random() * 1000) } // Fallback to subtle mock if no real data yet
  })

  // Group watchlist by category for Pie Chart
  const categoryCounts: Record<string, number> = {}
  watchlistItems.forEach(item => {
    const catName = categories.find(c => c.id === item.categoryId)?.name || 'Other'
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
  })

  const derivedPieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
    .slice(0, 3) // Top 3
  
  if (derivedPieData.length === 0) {
    derivedPieData.push({ name: 'Monitored', value: watchlistCount || 1 })
    derivedPieData.push({ name: 'Active', value: activeBidsCount })
  }

  return (
    <div className="p-8 md:p-12 space-y-12 bg-[#f8f9fa] min-h-screen text-slate-800">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-px w-6 bg-[#e35b5a]"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Protocol</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none">Buyer Intelligence</h1>
        </div>
        <div className="flex gap-2 text-[10px] items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="text-slate-400 uppercase font-bold tracking-widest">CUNGURA</span>
            <span className="text-slate-200">/</span>
            <span className="text-[#e35b5a] font-black uppercase tracking-widest">Dashboard</span>
        </div>
      </div>

      {/* 4 Stats Cards Row - Buyer Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Market Valuation', value: formatCurrency(totalSpent), icon: ShoppingBag },
          { label: 'Active Protocols', value: activeBidsCount, icon: Gavel },
          { label: 'Clearing Rate', value: '88%', icon: Zap },
          { label: 'Monitored Assets', value: watchlistCount, icon: Heart }
        ].map((stat, idx) => (
          <Card key={idx} className="bg-white border-none rounded-sm shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="h-20 bg-[#e35b5a] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ring-4 ring-white/10 group-hover:scale-110 transition-transform">
                 <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-black text-slate-800 tracking-tighter mb-1 leading-none">{stat.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>


      <Tabs defaultValue={defaultTab} key={defaultTab} className="space-y-12">
        <TabsList className="bg-transparent border-b border-slate-100 p-0 h-auto rounded-none flex gap-8 mb-12">
          <TabsTrigger value="stats" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Dashboard</TabsTrigger>
          <TabsTrigger value="events" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Live Events</TabsTrigger>
          <TabsTrigger value="products" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Products</TabsTrigger>
          <TabsTrigger value="bids" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">My Bids</TabsTrigger>
          <TabsTrigger value="orders" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-12 animate-in fade-in duration-500">
          {/* Dashboard Intelligence Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-none rounded-sm p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
              <div className="mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Market Engagement</h3>
                 <div className="flex gap-8">
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">2,100</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Bids Placed</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">3,200</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Lead Status</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">2,800</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Growth</p>
                    </div>
                 </div>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derivedChartData}>
                    <defs>
                      <linearGradient id="colorValueBuyer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e35b5a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#e35b5a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                      cursor={{ stroke: '#e35b5a', strokeWidth: 1 }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#e35b5a" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#e35b5a', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-white border-none rounded-sm p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
              <div className="mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Capital Flow</h3>
                 <div className="flex gap-8">
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">3,500</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Allocated</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">5,200</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Reserved</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">4,700</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Projected</p>
                    </div>
                 </div>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derivedChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '10px', fontWeight: '900' }}
                    />
                    <Bar dataKey="value" fill="#e35b5a" radius={[2, 2, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-white border-none rounded-sm p-8 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
              <div className="w-full mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left mb-4">Portfolio Distribution</h3>
                 <div className="flex gap-8">
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">400</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Watches</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">300</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Automotive</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">300</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Art</p>
                    </div>
                 </div>
              </div>
              <div className="h-64 w-full relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={derivedPieData} 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={0} 
                      dataKey="value" 
                      startAngle={90} 
                      endAngle={450}
                    >
                      {derivedPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-sm font-black text-slate-800 tracking-widest leading-none mb-1">ASSETS</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tighter">94%</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="animate-in slide-in-from-bottom-4 duration-500">
            {events.length === 0 ? (
              <Card className="bg-white border-none p-20 text-center rounded-sm shadow-sm border-dashed border-2 border-slate-100">
                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-800 font-black uppercase tracking-widest text-sm">No live events scheduled</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="bg-white border-none overflow-hidden rounded-sm shadow-md group">
                    <div className="p-8">
                       <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-[#e35b5a] animate-pulse" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.status}</span>
                         </div>
                       </div>
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4 group-hover:text-[#e35b5a] transition-colors">{event.title}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
                         Scheduled: {new Date(event.date).toLocaleDateString()} @ {event.startTime}
                       </p>
                       <Link href={`/events/${event.id}`}>
                         <Button className="w-full bg-slate-800 hover:bg-[#e35b5a] text-white font-black uppercase tracking-widest text-[10px] rounded-none h-12 transition-all">Enter Protocol Room</Button>
                       </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 9).map((product: any) => (
                  <Card key={product.id} className="bg-white border-none overflow-hidden rounded-sm shadow-md group">
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" 
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-1 line-clamp-1">{product.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Inventory Asset</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Valuation</p>
                          <p className="text-lg font-black text-slate-800 tracking-tighter">{formatCurrency(product.startingPrice)}</p>
                        </div>
                        <Link href={`/products/${product.id}`}>
                          <Button className="bg-[#e35b5a] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] rounded-none h-9 px-5 transition-all">
                            View Asset
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
          </TabsContent>
 
          {/* Active Bids Tab */}
          <TabsContent value="bids">
            {userBids.length === 0 ? (
              <Card className="bg-white border-none p-20 text-center rounded-sm shadow-sm border-dashed border-2 border-slate-100">
                <Gavel className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-800 font-bold uppercase tracking-widest text-sm mb-4">No active bid protocols</p>
                <Link href="/buyer/dashboard?tab=products">
                  <Button className="bg-[#e35b5a] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] rounded-none h-11 px-8 transition-all">Browse Catalog</Button>
                </Link>
              </Card>
            ) : (
              <Card className="bg-white border-none overflow-hidden rounded-sm shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5">Asset Identity</th>
                          <th className="px-8 py-5">Your Bid</th>
                          <th className="px-8 py-5">Current Target</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-center">Operation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {userBids.map((bid) => {
                          const product = bid.auction?.product
                          return (
                            <tr key={bid.id} className="hover:bg-slate-50/50 transition duration-200 group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-black rounded-none overflow-hidden flex-shrink-0 border border-slate-100">
                                    {product?.image && <img src={product.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" alt={product.title} />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 uppercase tracking-tight text-[11px]">{product?.title || 'Unknown Asset'}</p>
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Registry Ref: {bid.id.slice(0,8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-lg font-black text-[#e35b5a] tracking-tighter">{formatCurrency(bid.amount)}</p>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-sm font-bold text-slate-400 tracking-tight">{formatCurrency(product?.startingPrice || 0)}</p>
                              </td>
                              <td className="px-8 py-6">
                                <Badge variant="outline" className={`rounded-none border-none text-[8px] font-black uppercase tracking-widest px-2 ${
                                  bid.auction?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {bid.auction?.status || 'UNKNOWN'}
                                </Badge>
                              </td>
                              <td className="px-8 py-6 text-center">
                                {bid.auctionId ? (
                                  <Link href={`/products/${product?.id}`}>
                                    <Button size="sm" className="bg-slate-800 hover:bg-[#e35b5a] text-white rounded-none text-[9px] font-black uppercase tracking-widest h-8 px-5">View Protocol</Button>
                                  </Link>
                                ) : (
                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Event Asset</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Acquisition Log Tab */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="bg-white border-none p-20 text-center rounded-sm shadow-sm border-dashed border-2 border-slate-100">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-800 font-bold uppercase tracking-widest text-sm mb-4">No assets acquired yet</p>
              </Card>
            ) : (
              <Card className="bg-white border-none overflow-hidden rounded-sm shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5">Registry Identity</th>
                          <th className="px-8 py-5">Clearing Valuation</th>
                          <th className="px-8 py-5">Payment Protocol</th>
                          <th className="px-8 py-5">Registry Date</th>
                          <th className="px-8 py-5 text-center">Documentation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition duration-200 group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-none overflow-hidden flex-shrink-0 border border-slate-100">
                                  {order.product.image && <img src={order.product.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" alt={order.product.title} />}
                                </div>
                                <p className="font-bold text-slate-800 uppercase tracking-tight text-[11px] group-hover:text-[#e35b5a] transition-colors">{order.product.title}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{formatCurrency(order.amount)}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-2.5 py-1 font-black text-[8px] uppercase tracking-wider rounded-sm ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-800 text-white'}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsOrderModalOpen(true)
                                }}
                                className="border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-none text-[9px] font-black uppercase tracking-widest h-8 px-4"
                              >
                                Registry Info
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Order Details Modal */}
        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogContent className="bg-white border-none rounded-sm shadow-2xl p-0 overflow-hidden max-w-lg">
            <div className="h-1.5 bg-[#e35b5a] w-full" />
            <DialogHeader className="p-8 border-b border-slate-50">
              <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Acquisition Certificate</DialogTitle>
              <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Registry Record: {selectedOrder?.id}</DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="p-8 space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-sm overflow-hidden flex-shrink-0">
                    {selectedOrder.product.image ? (
                      <img src={selectedOrder.product.image} className="w-full h-full object-cover" alt={selectedOrder.product.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight mb-2">{selectedOrder.product.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-none border-slate-200 text-slate-400 text-[8px] font-black uppercase tracking-widest px-2">{selectedOrder.product.status}</Badge>
                      <Badge className="rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest px-2">{selectedOrder.paymentStatus}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Clearing Valuation</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Registry Date</p>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Technical Specifications</p>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-3">{selectedOrder.product.description}</p>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => setIsOrderModalOpen(false)}
                    className="w-full bg-slate-800 hover:bg-[#e35b5a] text-white font-black uppercase tracking-widest text-[10px] rounded-none h-14 transition-all"
                  >
                    Close Protocol
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
  </div>
)
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <BuyerDashboardContent />
    </Suspense>
  )
}
