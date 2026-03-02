'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { userAPI, analyticsAPI, categoryAPI, productAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, BarChart3, Package, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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

interface User {
  id: string
  name: string
  email: string
  userType: 'BUYER' | 'SELLER' | 'ADMIN'
  createdAt: string
}

interface PlatformAnalytics {
  totalUsers: number
  totalProducts: number
  totalAuctions: number
  totalRevenue: number
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.userType !== 'ADMIN') {
      router.push('/')
    } else {
      loadData()
    }
  }, [user, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, analyticsData, categoriesData] = await Promise.all([
        userAPI.getAll(),
        analyticsAPI.getPlatform(),
        categoryAPI.getAll(),
      ])
      setUsers(usersData)
      setAnalytics(analyticsData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Failed to load admin data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = [
    { name: 'Mon', value: 4500 },
    { name: 'Tue', value: 5200 },
    { name: 'Wed', value: 4800 },
    { name: 'Thu', value: 6100 },
    { name: 'Fri', value: 5900 },
    { name: 'Sat', value: 7200 },
    { name: 'Sun', value: 6800 },
  ]

  const pieData = [
    { name: 'Admin', value: 10 },
    { name: 'Sellers', value: 150 },
    { name: 'Buyers', value: 840 },
  ]

  const buyerCount = users.filter((u) => u.userType === 'BUYER').length
  const sellerCount = users.filter((u) => u.userType === 'SELLER').length

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12 text-slate-800">
      <main className="mx-auto max-w-7xl space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <div className="h-px w-6 bg-[#e35b5a]"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Institutional Protocol</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none">Admin Control</h1>
          </div>
          <div className="flex gap-2 text-[10px] items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <span className="text-slate-400 uppercase font-bold tracking-widest">AuctionHub</span>
              <span className="text-slate-200">/</span>
              <span className="text-[#e35b5a] font-black uppercase tracking-widest">Global Control</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-100 text-primary rounded-sm shadow-sm p-6 mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-[10px] font-black uppercase tracking-widest ml-2">{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards - "AuctionHub" Precision Red Header Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Users', value: analytics?.totalUsers || '0', sub: `${buyerCount}B / ${sellerCount}S`, icon: Users },
            { label: 'Global Inventory', value: analytics?.totalProducts || '0', sub: 'Indexed Assets', icon: Package },
            { label: 'Active Theatre', value: analytics?.totalAuctions || '0', sub: 'Bidding Nodes', icon: BarChart3 },
            { label: 'Platform Yield', value: formatCurrency(analytics?.totalRevenue || 0), sub: 'Gross Volume', icon: BarChart3 }
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
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-[#e35b5a] opacity-80">{stat.sub}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section - Shared Admin Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-white border-none rounded-sm p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
            <div className="mb-8">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Flow Performance</h3>
               <div className="flex gap-8">
                  <div>
                     <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">12,652</p>
                     <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">API Calls</p>
                  </div>
                  <div>
                     <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">99.9%</p>
                     <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Uptime</p>
                  </div>
               </div>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '10px', fontWeight: '900' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#e35b5a" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#e35b5a', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-white border-none rounded-sm p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
            <div className="mb-8">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Economic Index</h3>
               <p className="text-2xl font-black leading-none text-slate-800 tracking-tighter">Optimized</p>
               <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-2">Market Stability</p>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left mb-4">User Demographics</h3>
            </div>
            <div className="h-64 w-full relative mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={0} 
                    dataKey="value" 
                    startAngle={90} 
                    endAngle={450}
                  >
                    <Cell fill="#e35b5a" />
                    <Cell fill="#334155" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-sm font-black text-slate-800 tracking-widest leading-none mb-1">UNITS</p>
                 <p className="text-3xl font-black text-slate-800 tracking-tighter">{users.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-10">
          <TabsList className="bg-transparent border-b border-slate-200 p-0 h-auto rounded-none flex gap-8">
            <TabsTrigger 
              value="users" 
              className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400 hover:text-slate-600"
            >
              Registry ({users.length})
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400 hover:text-slate-600"
            >
              Taxonomy ({categories.length})
            </TabsTrigger>
            <TabsTrigger 
              value="moderation" 
              className="bg-transparent px-0 py-3 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:border-b-2 data-[state=active]:border-[#e35b5a] data-[state=active]:text-[#e35b5a] rounded-none shadow-none text-slate-400 hover:text-slate-600"
            >
              Moderation
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="focus-visible:outline-none">
            <Card className="bg-white border-none overflow-hidden rounded-sm shadow-sm relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-50" />
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="text-left p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                        <th className="text-left p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Communication</th>
                        <th className="text-left p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                        <th className="text-left p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Date</th>
                        <th className="text-center p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                        <tr>
                            <td colSpan={5} className="p-24 text-center">
                                <div className="w-10 h-10 border-4 border-[#e35b5a] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Registry...</p>
                            </td>
                        </tr>
                        ) : users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-24 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic leading-none">No records matching query.</p>
                            </td>
                        </tr>
                        ) : (
                        users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-8">
                                <p className="font-black text-slate-800 text-[13px] uppercase tracking-tight group-hover:text-[#e35b5a] transition-colors leading-none mb-1">{u.name}</p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {u.id.substring(0, 8)}</p>
                            </td>
                            <td className="p-8">
                                <p className="text-slate-400 text-xs font-bold leading-none">{u.email}</p>
                            </td>
                            <td className="p-8">
                                <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 font-black text-[8px] uppercase tracking-widest border-none ${
                                    u.userType === 'ADMIN' ? 'bg-red-50 text-[#e35b5a]' : 
                                    u.userType === 'SELLER' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {u.userType}
                                </Badge>
                            </td>
                            <td className="p-8">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                {new Date(u.createdAt).toLocaleDateString()}
                                </p>
                            </td>
                            <td className="p-8 text-center">
                                <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-sm text-[10px] font-black uppercase tracking-widest px-6 h-9 transition-all bg-white"
                                >
                                Configure
                                </Button>
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </div>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="focus-visible:outline-none space-y-10">
            <div className="max-w-xs">
                <Link href="/admin/categories/create">
                  <Button className="w-full bg-[#e35b5a] hover:bg-[#e35b5a]/95 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-sm h-14 px-10 shadow-lg shadow-[#e35b5a]/20 transition-all hover:translate-y-[-2px]">
                    <Plus className="w-4 h-4 mr-3" />
                    Expand Taxonomy
                  </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
                <Card key={category.id} className="bg-white border-none p-8 rounded-sm shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-[#e35b5a] transition-colors" />
                <div className="flex flex-col gap-8">
                    <div>
                        <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter group-hover:text-[#e35b5a] transition-colors leading-none mb-3">{category.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{category.description || 'Global Platform Category'}</p>
                    </div>
                    <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-sm text-[9px] font-black uppercase tracking-widest h-10 transition-all bg-white">
                        Modify Protocol
                        </Button>
                    </Link>
                </div>
                </Card>
            ))}
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="focus-visible:outline-none">
            <Card className="bg-white border-none p-24 text-center rounded-sm shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100" />
              <div className="w-16 h-16 bg-slate-50 text-slate-200 mx-auto mb-8 flex items-center justify-center rounded-full">
                  <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-slate-800 font-black uppercase tracking-tighter text-xl mb-4 leading-none">Moderation Engine Offline</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                Platform governance modules are in developmental phase. This will include product reviews, user reports, and institutional content moderation tools.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
