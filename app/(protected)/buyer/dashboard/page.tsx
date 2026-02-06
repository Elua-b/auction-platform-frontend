'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI, categoryAPI, auctionAPI, eventAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Gavel, LogOut, Clock, TrendingUp, Search, Zap } from 'lucide-react'
import Header from '@/components/header'
import ProductGrid from '@/components/products/product-grid'
import { Badge } from '@/components/ui/badge'
import { orderAPI } from '@/lib/api'
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

interface Category {
  id: string
  name: string
  image?: string
}

interface Order {
  id: string
  amount: number
  paymentStatus: string
  shippingStatus: string
  product: Product
  createdAt: string
}

export default function BuyerDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [watchlist, setWatchlist] = useState<string[]>([])

  useEffect(() => {
    loadData()
    const savedWatchlist = localStorage.getItem('watchlist') || '[]'
    setWatchlist(JSON.parse(savedWatchlist))
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData, auctionsData, ordersData, eventsData] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        auctionAPI.getAll(),
        orderAPI.getMyOrders(),
        eventAPI.getAll(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
      setAuctions(auctionsData)
      setOrders(ordersData)
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const toggleWatchlist = (productId: string) => {
    const updated = watchlist.includes(productId)
      ? watchlist.filter((id) => id !== productId)
      : [...watchlist, productId]
    setWatchlist(updated)
    localStorage.setItem('watchlist', JSON.stringify(updated))
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get all product IDs that are in events
  const eventProductIds = new Set(
    events.flatMap(event => 
      event.products?.map((ep: any) => ep.productId) || []
    )
  )

  // Separate products into event and non-event products
  const standaloneProducts = filteredProducts.filter(p => !eventProductIds.has(p.id))
  const eventProducts = filteredProducts.filter(p => eventProductIds.has(p.id))

  const activeAuctions = auctions.filter((a) => a.status === 'ACTIVE')
  const upcomingAuctions = auctions.filter((a) => a.status === 'UPCOMING')

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown'
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
          <p className="text-slate-400">Explore and bid on amazing items</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Auctions</p>
                <p className="text-2xl font-bold text-white">{activeAuctions.length}</p>
              </div>
              <Gavel className="w-8 h-8 text-amber-500" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Upcoming Auctions</p>
                <p className="text-2xl font-bold text-white">{upcomingAuctions.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Link href="/events" className="md:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6 hover:border-amber-500 transition cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Live Events</p>
                  <p className="text-2xl font-bold text-white">Join Room</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
            </Card>
          </Link>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Watchlist</p>
                <p className="text-2xl font-bold text-white">{watchlist.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('')}
                className={selectedCategory === '' ? 'bg-amber-500 text-black hover:bg-amber-600' : ''}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-amber-500 text-black hover:bg-amber-600' : ''}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="events">Event Products</TabsTrigger>
            <TabsTrigger value="active">Active Auctions</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="won">Won Items</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ProductGrid
              products={standaloneProducts}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              auctions={auctions}
              getCategoryName={getCategoryName}
            />
          </TabsContent>

          <TabsContent value="events">
            <ProductGrid
              products={eventProducts}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              auctions={auctions}
              getCategoryName={getCategoryName}
            />
          </TabsContent>

          <TabsContent value="active">
            <ProductGrid
              products={filteredProducts.filter((p) => {
                const auction = auctions.find((a) => a.productId === p.id)
                return auction && auction.status === 'ACTIVE'
              })}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              auctions={auctions}
              getCategoryName={getCategoryName}
            />
          </TabsContent>

          <TabsContent value="upcoming">
            <ProductGrid
              products={filteredProducts.filter((p) => {
                const auction = auctions.find((a) => a.productId === p.id)
                return auction && auction.status === 'UPCOMING'
              })}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              auctions={auctions}
              getCategoryName={getCategoryName}
            />
          </TabsContent>

          <TabsContent value="watchlist">
            <ProductGrid
              products={filteredProducts.filter((p) => watchlist.includes(p.id))}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              auctions={auctions}
              getCategoryName={getCategoryName}
            />
          </TabsContent>

          <TabsContent value="won">
            {orders.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">You haven't won any items yet.</p>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Shipping</th>
                        <th className="px-6 py-4">Order Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                                {order.product.image && <img src={order.product.image} className="w-full h-full object-cover" alt={order.product.title} />}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{order.product.title}</p>
                                <p className="text-xs text-slate-400 line-clamp-1">{order.product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-lg font-bold text-amber-500">{formatCurrency(order.amount)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={order.paymentStatus === 'PAID' ? 'bg-green-600' : 'bg-amber-600'}>
                              {order.paymentStatus}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {order.shippingStatus.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
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

        {loading && <p className="text-center text-slate-400">Loading...</p>}
      </main>
    </div>
  )
}
