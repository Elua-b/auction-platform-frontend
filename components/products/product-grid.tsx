'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Clock, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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

interface ProductGridProps {
  products: Product[]
  watchlist: string[]
  onToggleWatchlist: (productId: string) => void
  auctions: Auction[]
  getCategoryName: (categoryId: string) => string
}

export default function ProductGrid({
  products,
  watchlist,
  onToggleWatchlist,
  auctions,
  getCategoryName,
}: ProductGridProps) {
  const router = useRouter()
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const auction = auctions.find((a) => a.productId === product.id)
        const isWishlisted = watchlist.includes(product.id)

        return (
          <Link key={product.id} href={`/auction/${product.id}`}>
            <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden hover:border-amber-500 transition-all duration-300 cursor-pointer group">
              {/* Image */}
              <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-amber-500 opacity-50" />
                  </div>
                )}

                {/* Status Badge */}
                {auction && (
                  <Badge
                    className={`absolute top-2 right-2 ${
                      auction.status === 'ACTIVE'
                        ? 'bg-green-600 hover:bg-green-700'
                        : auction.status === 'UPCOMING'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {auction.status}
                  </Badge>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleWatchlist(product.id)
                  }}
                  className="absolute top-2 left-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Category */}
                <Badge variant="secondary" className="text-xs">
                  {getCategoryName(product.categoryId)}
                </Badge>

                {/* Title */}
                <h3 className="font-semibold text-white group-hover:text-amber-500 transition text-sm line-clamp-2">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>

                {/* Timing Info */}
                {auction && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      Ends{' '}
                      {formatDistanceToNow(new Date(auction.endTime), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400">Starting Price</p>
                  <p className="text-lg font-bold text-amber-500">{formatCurrency(product.startingPrice)}</p>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(`/auction/${product.id}`)
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm mt-2"
                >
                  {auction?.status === 'ACTIVE' ? 'Bid Now' : 'View Details'}
                </Button>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
