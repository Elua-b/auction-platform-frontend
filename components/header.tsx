'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Gavel, LogOut, LayoutDashboard } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: 'BUYER' | 'SELLER' | 'ADMIN'
  avatar?: string
  createdAt: string
}

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Gavel className="w-6 h-6 text-amber-500 group-hover:scale-110 transition" />
            <span className="text-xl font-bold text-white">AuctionHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-slate-300">
            {user && (
              <>
                <Link href={`/${user.userType.toLowerCase()}/dashboard`} className="hover:text-white transition">
                  Dashboard
                </Link>
                {user.userType === 'SELLER' && (
                  <Link href="/seller/products" className="hover:text-white transition">
                    My Products
                  </Link>
                )}
                <Link href="/browse" className="hover:text-white transition">
                  Browse
                </Link>
                <Link href="/events" className="hover:text-white transition">
                  Live Events
                </Link>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.userType}</p>
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
