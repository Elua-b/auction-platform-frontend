'use client'

import Link from 'next/link'
import { Search, Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 leading-none uppercase tracking-tighter group-hover:text-primary transition-colors italic">AuctionHub</span>
              <div className="h-0.5 w-8 bg-primary mt-1 opacity-50 group-hover:w-full transition-all" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              The Stage
            </Link>
            <Link href="/browse" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all">
              Inventory
            </Link>
            <Link href="/events" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all">
              Live Theatre
            </Link>
            {isAuthenticated && (
              <Link href={user?.userType === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all">
                Control Center
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-transparent focus-visible:ring-0">
                    <div className="hidden md:block text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 leading-none mb-1">{user?.name}</p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary leading-none opacity-70">{user?.userType}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center group-hover:border-primary transition-all">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-none shadow-2xl rounded-sm p-2 mt-2">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Account Registry</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem asChild>
                    <Link href={user?.userType === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'} className="text-[10px] font-black uppercase tracking-widest p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-all rounded-none">
                      Command Center
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-[10px] font-black uppercase tracking-widest p-3 flex items-center gap-3 text-primary cursor-pointer hover:bg-red-50 focus:bg-red-50 transition-all rounded-none">
                    <LogOut className="w-4 h-4" />
                    Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all px-4">
                  Sign In
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-primary hover:bg-slate-800 text-white rounded-sm px-8 font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20 transition-all">
                    Register Port
                  </Button>
                </Link>
              </div>
            )}
            
            <button className="lg:hidden text-slate-800">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
