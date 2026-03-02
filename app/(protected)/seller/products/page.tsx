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
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-7xl space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-6">
            <Button 
                variant="outline" 
                onClick={() => router.push('/seller/dashboard')} 
                className="w-fit border-slate-200 text-slate-400 hover:bg-white hover:text-slate-800 rounded-sm h-10 px-4 font-black uppercase tracking-widest text-[9px] transition-all bg-white shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Infrastructure Dashboard
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Protocol: Active</span>
                 <div className="h-px w-8 bg-slate-200"></div>
              </div>
              <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter leading-none">Inventory Control</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Strategic management of your high-value asset portfolio</p>
            </div>
          </div>
          <Link href="/seller/products/create">
            <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-sm h-14 px-10 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]">
              <Plus className="w-4 h-4 mr-3" />
              Onboard New Asset
            </Button>
          </Link>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Secure Feed...</p>
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-white border-none p-24 text-center rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100" />
            <Package className="w-16 h-16 text-slate-50 mx-auto mb-8" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">No assets in current registry</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 max-w-xs mx-auto leading-relaxed">Your portfolio is currently unauthorized. Initialize a new asset to begin your auction series.</p>
            <Link href="/seller/products/create">
              <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-[10px] rounded-sm h-16 px-12 transition-all shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5 mr-3" />
                Initialize First Asset
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="bg-white border-none overflow-hidden rounded-sm shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100" />
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Condition & Specs</th>
                    <th className="px-8 py-6 text-primary">Initial Release</th>
                    <th className="px-8 py-6 text-slate-800">Current Value</th>
                    <th className="px-8 py-6">Lifecycle</th>
                    <th className="px-8 py-6">Registry Date</th>
                    <th className="px-8 py-6 text-center">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-sm overflow-hidden flex-shrink-0 group-hover:border-primary/20 transition-colors">
                            {product.image ? (
                                <img src={product.image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt={product.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-slate-200" />
                                </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 uppercase tracking-tight text-[13px] group-hover:text-primary transition-colors leading-none mb-1">{product.title}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {product.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] line-clamp-2 leading-relaxed">{product.description}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-primary tracking-tight">{formatCurrency(product.startingPrice)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-800 tracking-tight">{formatCurrency(product.currentPrice)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 font-black text-[8px] uppercase tracking-widest border-none ${
                            product.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 
                            product.status === 'SOLD' ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-primary'
                        }`}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(product.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link href={`/seller/products/${product.id}`}>
                            <Button size="sm" variant="outline" className="border-slate-200 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-sm font-black uppercase tracking-widest text-[9px] h-9 px-4 transition-all bg-white">
                              Configure
                            </Button>
                          </Link>
                          {product.status === 'AVAILABLE' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteClick(product.id, product.title)}
                              className="border-red-100 text-primary hover:bg-red-50 hover:border-red-200 rounded-sm h-9 w-9 p-0 transition-all bg-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          title="DEAUTHORIZE ASSET"
          message={`Are you sure you want to permanently remove "${deleteDialog.productName.toUpperCase()}" from the secure database? This action is irreversible.`}
          confirmText="EXECUTE DELETION"
          variant="danger"
        />
      </main>
    </div>
  )
}
