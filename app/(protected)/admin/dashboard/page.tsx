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

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const buyerCount = users.filter((u) => u.userType === 'BUYER').length
  const sellerCount = users.filter((u) => u.userType === 'SELLER').length

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Platform management and analytics</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalUsers}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {buyerCount} buyers, {sellerCount} sellers
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Auctions</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalAuctions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-amber-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-700/50">
                      <th className="text-left p-4 text-slate-300 font-semibold">Name</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Email</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Type</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Joined</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                          <td className="p-4 text-white">{u.name}</td>
                          <td className="p-4 text-slate-300">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                u.userType === 'ADMIN'
                                  ? 'bg-red-900 text-red-200'
                                  : u.userType === 'SELLER'
                                    ? 'bg-blue-900 text-blue-200'
                                    : 'bg-green-900 text-green-200'
                              }`}
                            >
                              {u.userType}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-sm">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-slate-300 hover:text-white border-slate-600 text-xs bg-transparent"
                            >
                              View
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
          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Link href="/admin/categories/create" className="flex-1">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="bg-slate-800 border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        <p className="text-sm text-slate-400">{category.description || 'No description'}</p>
                      </div>
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="outline" size="sm" className="text-slate-300 hover:text-white border-slate-600 bg-transparent">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Moderation features coming soon</p>
              <p className="text-sm text-slate-500">
                This section will include product reviews, user reports, and content moderation tools.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
