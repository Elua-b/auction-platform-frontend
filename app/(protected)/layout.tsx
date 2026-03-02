'use client'

import React, { useEffect, useState } from "react"
import { useAuth } from '@/lib/auth-context'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardSidebar from "@/components/dashboard-sidebar"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname || '/')}`)
    }
  }, [isAuthenticated, loading, pathname, router])

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Synchronizing Authority...</p>
      </div>
    </div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-slate-800 selection:bg-[#e35b5a] selection:text-white">
      {/* Desktop Sidebar */}
      <DashboardSidebar user={user} onLogout={logout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
           <Link href="/" className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tighter">AutoBid</span>
              <span className="text-[8px] uppercase tracking-[0.4em] text-[#e35b5a] font-black">AuctionHub</span>
           </Link>
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-800 hover:bg-slate-50"
           >
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </Button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20">
            <div className="p-6">
               <DashboardSidebar user={user} onLogout={logout} />
               {/* Note: We'll need to adjust DashboardSidebar to not have h-screen/sticky classes when in overlay, 
                   or just create a simplified version for mobile. For now, let's keep it simple. */}
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
