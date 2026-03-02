import React from 'react'
import { Gavel, Star, CreditCard, ShieldCheck, Globe, TrendingUp, Users, Heart } from 'lucide-react'

const icons = [
  { label: 'LIVE EVENTS', icon: <Gavel className="h-6 w-6" /> },
  { label: 'TOP RATED', icon: <Star className="h-6 w-6" /> },
  { label: 'BID HISTORY', icon: <CreditCard className="h-6 w-6" /> },
  { label: 'ESCROW WINS', icon: <ShieldCheck className="h-6 w-6" /> },
  { label: 'INTERNATIONAL', icon: <Globe className="h-6 w-6" /> },
  { label: 'MARKET STATS', icon: <TrendingUp className="h-6 w-6" /> },
  { label: 'MY FRIENDS', icon: <Users className="h-6 w-6" /> },
  { label: 'WATCHLIST', icon: <Heart className="h-6 w-6" /> },
]

export const IconBar = () => {
  return (
    <div className="bg-[#D32F2F] text-white pt-10 pb-6 relative z-10 mt-[-40px]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {icons.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="transform transition-transform group-hover:scale-125 duration-300">
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center opacity-70 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
