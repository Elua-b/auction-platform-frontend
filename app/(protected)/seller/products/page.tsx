'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { productAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Package, ArrowLeft, Trash2 } from 'lucide-react'
import Header from '@/components/header'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  title: string
  description: string
  image?: string
  startingPrice: number
  currentPrice: number
  categoryId: string
  status: string
  createdAt: string
}

export default function SellerProductsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({ isOpen: false, productId: null, productName: '' })

  useEffect(() => {
    if (user?.id) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await productAPI.getAll({ sellerId: user?.id })
      setProducts(productsData)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteDialog({ isOpen: true, productId, productName })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.productId) return
    
    try {
      await productAPI.delete(deleteDialog.productId)
      await loadProducts() // Reload products after deletion
    } catch (error: any) {
      alert(error.message || 'Failed to delete product')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/seller/dashboard')} className="text-slate-400 hover:text-white p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Products</h1>
              <p className="text-slate-400">Manage all your products in one place</p>
            </div>
          </div>
          <Link href="/seller/products/create">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </Link>
        </div>

        {/* Products Table */}
        {loading ? (
          <p className="text-slate-400">Loading products...</p>
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
                    <th className="px-6 py-4">Current Price</th>
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
                        <p className="text-lg font-bold text-green-500">{formatCurrency(product.currentPrice)}</p>
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
                        <div className="flex gap-2">
                          <Link href={`/seller/products/${product.id}`}>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                              Manage
                            </Button>
                          </Link>
                          {product.status === 'AVAILABLE' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteClick(product.id, product.title)}
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

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, productId: null, productName: '' })}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </main>
    </div>
  )
}
