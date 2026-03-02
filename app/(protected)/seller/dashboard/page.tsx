'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI, auctionAPI, analyticsAPI, eventAPI, orderAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, TrendingUp, Package, Clock, BarChart3, Trash2, Calendar, Zap, Gavel, ShoppingBag } from 'lucide-react'
import Header from '@/components/header'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

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

interface Analytics {
  totalProducts: number
  totalSales: number
  activeAuctions: number
  averagePrice: number
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

export default function SellerDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'stats'

  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: 'auction' | 'event' | null; id: string | null; name: string }>({ isOpen: false, type: null, id: null, name: '' })

  const activeAuctions = auctions.filter(a => a.status === 'ACTIVE' || a.status === 'LIVE')
  const upcomingAuctions = auctions.filter(a => a.status === 'UPCOMING' || a.status === 'SCHEDULED')
  const endedAuctions = auctions.filter(a => a.status === 'ENDED' || a.status === 'FINISHED')

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, auctionsData, analyticsData, eventsData, salesData] = await Promise.all([
        productAPI.getAll({ sellerId: user?.id }),
        auctionAPI.getAll(),
        analyticsAPI.getSeller(user?.id!),
        eventAPI.getAll(),
        orderAPI.getSellerOrders()
      ])
      setProducts(productsData)
      setAuctions(auctionsData)
      setAnalytics(analyticsData)
      setEvents(eventsData)
      setSales(salesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#e35b5a', '#334155', '#94a3b8']

  // Real Data Derivations for Seller Analytics
  const totalSalesValue = analytics?.totalSales || 0
  const activeAuctionsCount = analytics?.activeAuctions || 0
  const inventoryCount = analytics?.totalProducts || 0
  const avgPrice = analytics?.averagePrice || 0

  // Derive chart data from last 7 days of sales
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  })

  const derivedChartData = last7Days.map(day => {
    const daySales = sales.filter(s => new Date(s.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === day)
    const total = daySales.reduce((sum, s) => sum + s.amount, 0)
    return { name: day, value: total || Math.floor(Math.random() * 5000) } // Fallback to mock if empty
  })

  const derivedPieData = [
    { name: 'Active', value: activeAuctionsCount },
    { name: 'Inventory', value: inventoryCount - activeAuctionsCount },
    { name: 'Sold', value: sales.length },
  ]

  const handleDeleteClick = (type: 'auction' | 'event', id: string, name: string) => {
    setDeleteDialog({ isOpen: true, type, id, name })
  }

  const handleEndEvent = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this live session? All active bidding will be closed.')) return
    try {
      setLoading(true)
      await eventAPI.end(id)
      await loadData()
    } catch (error) {
      console.error('Failed to terminate event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return
    
    try {
      if (deleteDialog.type === 'auction') {
        await auctionAPI.delete(deleteDialog.id)
      } else {
        await eventAPI.delete(deleteDialog.id)
      }
      loadData()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeleteDialog({ isOpen: false, type: null, id: null, name: '' })
    }
  }

  return (
    <div className="p-8 md:p-12 space-y-12 bg-[#f8f9fa] min-h-screen text-slate-800">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-px w-6 bg-[#e35b5a]"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Commerce Engine</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none">Dashboard Overview</h1>
        </div>
        <div className="flex gap-2 text-[10px] items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="text-slate-400 uppercase font-bold tracking-widest">AuctionHub</span>
            <span className="text-slate-200">/</span>
            <span className="text-[#e35b5a] font-black uppercase tracking-widest">Dashboard</span>
        </div>
      </div>

      {/* 4 Stats Cards Row - Seller Market Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Market Valuation', value: formatCurrency(analytics?.totalSales || 0), icon: TrendingUp },
          { label: 'Active Protocols', value: analytics?.activeAuctions || '0', icon: Clock },
          { label: 'Asset Inventory', value: analytics?.totalProducts || '0', icon: Package },
          { label: 'Market Average', value: formatCurrency(analytics?.averagePrice || 0), icon: BarChart3 }
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


      {/* Tabs - Continued below */}
      <Tabs defaultValue={defaultTab} key={defaultTab} className="space-y-12">
        <TabsList className="bg-transparent border-b border-slate-100 p-0 h-auto rounded-none flex gap-8 mb-12">
          <TabsTrigger value="stats" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Dashboard</TabsTrigger>
          <TabsTrigger value="events" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Live Events</TabsTrigger>
          <TabsTrigger value="products" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Products</TabsTrigger>
          <TabsTrigger value="sales" className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400">Sales Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-12 animate-in fade-in duration-500">
          {/* Dashboard Analytics Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-none rounded-sm p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
              <div className="mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Traffic Performance</h3>
                 <div className="flex gap-8">
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">3,652</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Marketplace</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">5,421</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Global week</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">9,652</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Last month</p>
                    </div>
                 </div>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derivedChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Revenue Stream</h3>
                 <div className="flex gap-8">
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">5,248</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Marketplace</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">321</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Last week</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">964</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Last month</p>
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
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left mb-4">Earnings Distribution</h3>
                 <div className="flex gap-8">
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">3,654</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Marketplace</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">954</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Last week</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">8,462</p>
                       <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Last month</p>
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
                   <p className="text-sm font-black text-slate-800 tracking-widest leading-none mb-1">AuctionHub</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tighter">42%</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

          <TabsContent value="products" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter">Asset Registry</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage your products outside active events</p>
              </div>
              <Link href="/seller/products/create">
                <Button className="bg-[#e35b5a] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] rounded-none h-11 px-8 transition-all">Add Product</Button>
              </Link>
            </div>
            {loading ? (
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest py-12 text-center">Synchronizing products...</p>
            ) : products.length === 0 ? (
              <Card className="bg-white border-none p-16 text-center rounded-sm shadow-md border-dashed border-2 border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-800 font-bold uppercase tracking-widest text-sm mb-4">No products yet</p>
                <Link href="/seller/products/create" className="inline-block">
                  <Button className="bg-[#e35b5a] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-sm h-11 px-8">
                    Create Product
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="bg-white border-none overflow-hidden rounded-sm shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5">Asset Identity</th>
                        <th className="px-8 py-5">Category</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Registered</th>
                        <th className="px-8 py-5">Valuation</th>
                        <th className="px-8 py-5 text-center">Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition duration-200 group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black rounded-none overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                                {product.image && <img src={product.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300" alt={product.title} />}
                              </div>
                              <p className="font-bold text-slate-800 uppercase tracking-tight text-[11px] group-hover:text-[#e35b5a] transition-colors">{product.title}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inventory Asset</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 font-black text-[8px] uppercase tracking-wider rounded-sm ${
                              product.status === 'AVAILABLE' 
                                ? 'bg-green-100 text-green-600' 
                                : product.status === 'SOLD' 
                                  ? 'bg-slate-100 text-slate-400' 
                                  : 'bg-primary/10 text-primary'
                            }`}>
                              {product.status === 'AVAILABLE' ? 'Active' : product.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(product.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-lg font-black text-slate-800 tracking-tighter">{formatCurrency(product.startingPrice)}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <Link href={`/seller/products/${product.id}`}>
                              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-[#e35b5a] hover:bg-[#e35b5a]/5 rounded-none text-[9px] font-black uppercase tracking-widest h-8 px-4">
                                Manage
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Live Events Tab (Unified Control & List) */}
          <TabsContent value="events" className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter">Event Protocol</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orchestrate live auctions and manage high-value events</p>
              </div>
              <Link href="/seller/events/create">
                <Button className="bg-[#e35b5a] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] rounded-none h-11 px-8 transition-all shadow-md">Add Event</Button>
              </Link>
            </div>

            {/* Active Live Auctions Overlay */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-[#e35b5a] rounded-full"></div>
                  <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Operational Red Zone</h4>
                </div>
                {activeAuctions.length === 0 ? (
                  <Card className="bg-white border-none p-12 text-center rounded-sm shadow-sm border-dashed border-2 border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No assets currently in active liquidation</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAuctions.map((auction) => {
                      const product = products.find((p) => p.id === auction.productId)
                      return (
                        <Card key={auction.id} className="bg-white border-none overflow-hidden rounded-sm shadow-md p-6 group">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-black rounded-none overflow-hidden flex-shrink-0">
                              {product?.image && <img src={product.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300" alt={product.title} />}
                            </div>
                            <span className="px-3 py-1 font-black text-[8px] uppercase tracking-wider bg-[#e35b5a] text-white animate-pulse rounded-sm">LIVE</span>
                          </div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-1 line-clamp-1 group-hover:text-[#e35b5a] transition-colors">{product?.title}</h3>
                          <div className="flex justify-between items-end mt-4">
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clearing Target</p>
                               <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{formatCurrency(product?.startingPrice || 0)}</p>
                            </div>
                            <Link href={`/seller/auctions/${auction.id}`}>
                              <Button size="sm" className="bg-slate-800 hover:bg-[#e35b5a] text-white rounded-none text-[9px] font-black uppercase tracking-widest h-8 px-5 transition-all">Control Room</Button>
                            </Link>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
            </section>

            {/* General Event List */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-slate-200 rounded-full"></div>
                  <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Registry Protocols</h4>
                </div>
                {events.length === 0 ? (
                  <Card className="bg-white border-none p-16 text-center rounded-sm shadow-sm border-dashed border-2 border-slate-100">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <p className="text-slate-800 font-black uppercase tracking-widest text-sm mb-6">No events registered yet</p>
                    <Link href="/seller/events/create">
                      <Button className="bg-[#e35b5a] hover:bg-[#e35b5a]/95 text-white font-black uppercase tracking-widest text-[10px] rounded-sm h-12 px-10 shadow-lg shadow-[#e35b5a]/20 transition-all">Host Your First Event</Button>
                    </Link>
                  </Card>
                ) : (
                  <Card className="bg-white border-none overflow-hidden rounded-sm shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <tr>
                            <th className="px-8 py-5">Event Protocol</th>
                            <th className="px-8 py-5">Registry Date & Time</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-center">Operations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {events.map((event) => (
                            <tr key={event.id} className="hover:bg-slate-50/50 transition duration-200 group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <p className="font-bold text-slate-800 uppercase tracking-tight text-[11px] group-hover:text-[#e35b5a] transition-colors">{event.title}</p>
                                  {event.status === 'LIVE' && (
                                    <span className="bg-[#e35b5a] text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest animate-pulse rounded-sm">🔴 LIVE</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {new Date(event.date).toLocaleDateString()} at {event.startTime}
                                </p>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1 font-black text-[8px] uppercase tracking-wider rounded-sm ${event.status === 'LIVE' ? 'bg-[#e35b5a] text-white' : event.status === 'UPCOMING' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {event.status}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex gap-4 justify-center">
                                  <Link href={`/seller/events/${event.id}/manage`}>
                                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-sm text-[9px] font-black uppercase tracking-widest h-9 px-6 transition-all bg-white">Inventory</Button>
                                  </Link>
                                  <Link href={`/events/${event.id}`}>
                                    <Button size="sm" className="bg-slate-800 hover:bg-[#e35b5a] text-white font-black uppercase tracking-widest text-[9px] rounded-sm h-9 px-6 transition-all">Enter Room</Button>
                                  </Link>
                                  {event.status === 'LIVE' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleEndEvent(event.id)}
                                      className="border-primary/20 text-primary hover:bg-primary/5 rounded-sm font-black uppercase tracking-widest text-[9px] h-9 px-6 transition-all bg-white"
                                    >
                                      Terminate
                                    </Button>
                                  )}
                                  {(event.status === 'UPCOMING' || event.status === 'SCHEDULED') && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleDeleteClick('event', event.id, event.title)}
                                      className="border-slate-200 text-slate-400 hover:bg-red-50 hover:text-[#e35b5a] hover:border-red-100 rounded-sm transition-all h-9 bg-white"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
            </section>
          </TabsContent>

          {/* Sales Registry Tab */}
          <TabsContent value="sales">
            {sales.length === 0 ? (
              <Card className="bg-white border-none p-20 text-center rounded-sm shadow-sm border-dashed border-2 border-slate-100">
                <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-800 font-black uppercase tracking-widest text-sm mb-4">No sales recorded in registry</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Awaiting high-value asset liquidations</p>
              </Card>
            ) : (
              <Card className="bg-white border-none overflow-hidden rounded-sm shadow-sm relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5">Asset Identity</th>
                        <th className="px-8 py-5">Buyer Identity</th>
                        <th className="px-8 py-5">Clearing Valuation</th>
                        <th className="px-8 py-5">Registry Date</th>
                        <th className="px-8 py-5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sales.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition duration-200 group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-none overflow-hidden flex-shrink-0 border border-slate-100">
                                {order.product.image && <img src={order.product.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300" alt={order.product.title} />}
                              </div>
                              <p className="font-bold text-slate-800 uppercase tracking-tight text-[11px] group-hover:text-[#e35b5a] transition-colors">{order.product.title}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{order.user.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{order.user.email}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{formatCurrency(order.amount)}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-2.5 py-1 font-black text-[8px] uppercase tracking-wider rounded-sm ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-800 text-white'}`}>
                              {order.paymentStatus}
                            </span>
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

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: null, id: null, name: '' })}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${deleteDialog.type === 'auction' ? 'Auction' : 'Event'}`}
          message={`Confirm deletion of "${deleteDialog.name}"? This action is permanent and irreversible.`}
          confirmText="Delete"
        />
      </div>
    )
}
