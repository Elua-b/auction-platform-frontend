'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Gavel, 
  Calendar, 
  Settings, 
  LogOut, 
  User, 
  Heart, 
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  user: {
    name: string
    email: string
    userType: string
  } | null
  onLogout: () => void
}

export default function DashboardSidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const AuctionHubRed = '#e35b5a'

  const isActive = (path: string) => pathname === path

  const buyerLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/buyer/dashboard' },
    { label: 'Live Events', icon: Calendar, href: '/buyer/dashboard?tab=events' },
    { label: 'Products', icon: Package, href: '/buyer/dashboard?tab=products' },
    { label: 'My Bids', icon: Gavel, href: '/buyer/dashboard?tab=bids' },
    { label: 'Orders', icon: ShoppingBag, href: '/buyer/dashboard?tab=orders' },
  ]
 
  const sellerLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/seller/dashboard' },
    { label: 'Live Events', icon: Calendar, href: '/seller/dashboard?tab=events' },
    { label: 'Products', icon: PlusCircle, href: '/seller/dashboard?tab=products' },
    { label: 'Sales Registry', icon: ShoppingBag, href: '/seller/dashboard?tab=sales' },
  ]
 
  const links = user?.userType === 'SELLER' ? sellerLinks : buyerLinks

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col z-40 hidden lg:flex shadow-sm">
      {/* Brand Header */}
      <div className="p-8 pb-10 flex justify-center">
        <Link href="/" className="flex flex-col items-center group">
          <span className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tighter transition-colors italic">CUNGURA</span>
          <div className="h-1 w-8 bg-slate-100 mt-1 group-hover:bg-[#e35b5a] transition-all" />
        </Link>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded-full shadow-inner relative overflow-hidden ring-4 ring-slate-50">
            {/* If user has image use it, otherwise icon */}
            <User className="w-8 h-8 text-slate-300" />
            <div className="absolute inset-0 bg-slate-800/5 group-hover:bg-transparent transition-colors" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{user?.name || 'Authorized Personnel'}</p>
          <div className="flex items-center justify-center">
            <div className="bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-8 space-y-0.5 overflow-y-auto mt-4">
        {links.map((link) => {
          const active = isActive(link.href)
          return (
            <Link key={link.href} href={link.href}>
              <div className={`
                flex items-center justify-between px-6 py-3 transition-all duration-200 group relative
                ${active 
                  ? 'text-slate-800' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}
              `}>
                <div className="flex items-center gap-4">
                  <link.icon className={`w-4 h-4 transition-colors ${active ? 'text-[#e35b5a]' : 'group-hover:text-slate-600'}`} />
                  <span className={`text-[11px] font-bold tracking-wide ${active ? 'font-black' : ''}`}>{link.label}</span>
                </div>
                {active && (
                  <div className="absolute right-4 w-4 h-4 bg-[#e35b5a] rounded-sm flex items-center justify-center shadow-lg shadow-[#e35b5a]/20">
                    <PlusCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            </Link>
          )
        })}

        <div className="pt-8 px-6">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Operations</p>
           <div className="space-y-2">
             {user?.userType === 'SELLER' ? (
                <>
                  <Link href="/seller/products/create" className="block">
                    <Button className="w-full bg-[#e35b5a] hover:bg-[#e35b5a]/90 text-white rounded-sm h-10 font-black uppercase tracking-widest text-[9px] gap-2 transition-all shadow-sm">
                      <PlusCircle className="w-3.5 h-3.5" />
                      Create Asset
                    </Button>
                  </Link>
                </>
             ) : (
                <Link href="/browse" className="block">
                  <Button className="w-full border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-800 rounded-sm h-10 font-black uppercase tracking-widest text-[9px] gap-2 transition-all variant-outline bg-white border">
                    <LogOut className="w-3.5 h-3.5 rotate-180" />
                    Browse Hub
                  </Button>
                </Link>
             )}
           </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-slate-50 bg-slate-50/30">
        <Button 
          onClick={onLogout}
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-[#e35b5a] hover:bg-[#e35b5a]/5 rounded-sm font-black uppercase tracking-widest text-[9px] gap-3 h-10 group transition-all"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
