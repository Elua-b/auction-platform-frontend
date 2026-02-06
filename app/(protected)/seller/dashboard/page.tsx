'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI, auctionAPI, analyticsAPI, eventAPI, orderAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, TrendingUp, Package, Clock, BarChart3, Trash2 } from 'lucide-react'
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

export default function SellerDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: 'auction' | 'event' | null; id: string | null; name: string }>({ isOpen: false, type: null, id: null, name: '' })

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

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleDeleteClick = (type: 'auction' | 'event', id: string, name: string) => {
    setDeleteDialog({ isOpen: true, type, id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return
    
    try {
      if (deleteDialog.type === 'auction') {
        await auctionAPI.delete(deleteDialog.id)
      } else if (deleteDialog.type === 'event') {
        await eventAPI.delete(deleteDialog.id)
      }
      await loadData() // Reload all data after deletion
    } catch (error: any) {
      alert(error.message || `Failed to delete ${deleteDialog.type}`)
    }
  }

  const sellerAuctions = auctions.filter((a) => {
    const product = products.find((p) => p.id === a.productId)
    return product !== undefined
  })

  const activeAuctions = sellerAuctions.filter((a) => a.status === 'ACTIVE')
  const upcomingAuctions = sellerAuctions.filter((a) => a.status === 'UPCOMING')
  const endedAuctions = sellerAuctions.filter((a) => a.status === 'ENDED')

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Seller Dashboard</h1>
            <p className="text-slate-400">Manage your products and auctions</p>
          </div>
          <div className="flex gap-4">
            <Link href="/seller/events/create">
              <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Host Event
              </Button>
            </Link>
            <Link href="/seller/products/create">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Auctions</p>
                  <p className="text-2xl font-bold text-white">{analytics.activeAuctions}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalSales)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Price</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.averagePrice)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="active">Active Auctions</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="events">Live Events</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
            <TabsTrigger value="sales">Sales & Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : products.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No products yet</p>
                <Link href="/seller/products/create">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Product
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Starting Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                                {product.image && <img src={product.image} className="w-full h-full object-cover" alt={product.title} />}
                              </div>
                              <p className="font-semibold text-white">{product.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-400 max-w-xs line-clamp-2">{product.description}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-lg font-bold text-amber-500">{formatCurrency(product.startingPrice)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={product.status === 'AVAILABLE' ? 'bg-green-600' : product.status === 'SOLD' ? 'bg-slate-600' : 'bg-blue-600'}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-400">{new Date(product.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/seller/products/${product.id}`}>
                              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
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

          {/* Active Auctions Tab */}
          <TabsContent value="active">
            {activeAuctions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No active auctions</p>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Start Time</th>
                        <th className="px-6 py-4">End Time</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {activeAuctions.map((auction) => {
                        const product = products.find((p) => p.id === auction.productId)
                        return (
                          <tr key={auction.id} className="hover:bg-slate-700/50 transition">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-white">{product?.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-400">{new Date(auction.startTime).toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-400">{new Date(auction.endTime).toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-green-600 animate-pulse">ACTIVE</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/seller/auctions/${auction.id}`}>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                                  Manage
                                </Button>
                              </Link>
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

          {/* Upcoming Auctions Tab */}
          <TabsContent value="upcoming">
            {upcomingAuctions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No upcoming auctions</p>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Scheduled Start</th>
                        <th className="px-6 py-4">Scheduled End</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {upcomingAuctions.map((auction) => {
                        const product = products.find((p) => p.id === auction.productId)
                        return (
                          <tr key={auction.id} className="hover:bg-slate-700/50 transition">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-white">{product?.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-400">{new Date(auction.startTime).toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-400">{new Date(auction.endTime).toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-blue-600">UPCOMING</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/seller/auctions/${auction.id}`}>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                                  Manage
                                </Button>
                              </Link>
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

          {/* Live Events Tab */}
          <TabsContent value="events">
            {events.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No events scheduled yet</p>
                <Link href="/seller/events/create">
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">Host Your First Event</Button>
                </Link>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Event Title</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{event.title}</p>
                              {event.status === 'LIVE' && (
                                <Badge className="bg-red-600 animate-pulse text-[10px] h-4">🔴 LIVE</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-400">
                              {new Date(event.date).toLocaleDateString()} at {event.startTime}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={event.status === 'LIVE' ? 'bg-red-600' : event.status === 'UPCOMING' ? 'bg-blue-600' : 'bg-slate-600'}>
                              {event.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link href={`/seller/events/${event.id}/manage`}>
                                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">Manage Items</Button>
                              </Link>
                              <Link href={`/events/${event.id}`}>
                                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">Enter Room</Button>
                              </Link>
                              {(event.status === 'UPCOMING' || event.status === 'SCHEDULED') && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteClick('event', event.id, event.title)}
                                  className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
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
          </TabsContent>

          <TabsContent value="ended">
            {endedAuctions.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No ended auctions</p>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Ended Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {endedAuctions.map((auction) => {
                        const product = products.find((p) => p.id === auction.productId)
                        return (
                          <tr key={auction.id} className="hover:bg-slate-700/50 transition">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-white">{product?.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-400">{new Date(auction.endTime).toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-slate-600">ENDED</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/seller/auctions/${auction.id}`}>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                                  View
                                </Button>
                              </Link>
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

          <TabsContent value="sales">
            {sales.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No sales yet. Keep hosting events and auctions!</p>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Buyer</th>
                        <th className="px-6 py-4">Sale Amount</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Order Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {sales.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                                {order.product.image && <img src={order.product.image} className="w-full h-full object-cover" alt={order.product.title} />}
                              </div>
                              <p className="font-semibold text-white">{order.product.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-white">{order.user.name}</p>
                              <p className="text-xs text-slate-400">{order.user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xl font-bold text-amber-500">{formatCurrency(order.amount)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={order.paymentStatus === 'PAID' ? 'bg-green-600' : 'bg-amber-600'}>
                              {order.paymentStatus}
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

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: null, id: null, name: '' })}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${deleteDialog.type === 'auction' ? 'Auction' : 'Event'}`}
          message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </main>
    </div>
  )
}
