'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle } from 'lucide-react'

interface HeroSectionAutoBidProps {
  heroImage: string
}

export function HeroSectionAutoBid({ heroImage }: HeroSectionAutoBidProps) {
  return (
    <section className="relative h-[90vh] min-h-[700px] w-full overflow-hidden bg-slate-900">
      {/* Background Image with Advanced Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative mx-auto flex h-full items-center px-4 md:px-8">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-3">
             <div className="h-px w-12 bg-primary"></div>
             <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Global Liquidation Engine</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85] italic">
            Elite <br />
            <span className="text-primary">Theatre</span> <br />
            Auctions
          </h1>
          
          <p className="max-w-xl text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-300 leading-relaxed">
            Witness the convergence of high-value assets and serious acquisition protocols. <br />
            The definitive platform for institutional-grade liquidations.
          </p>
          
          <div className="flex flex-col gap-6 sm:flex-row pt-4">
            <Button className="bg-primary hover:bg-white hover:text-primary text-white px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] rounded-none shadow-[0_20px_50px_rgba(227,91,90,0.3)] transition-all flex items-center gap-4">
              Enter The Arena
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="text-white hover:text-primary px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] rounded-none bg-transparent flex items-center gap-4 group">
              <PlayCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              How It Operates
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10 mt-12">
             {[
               { label: 'Active Protocols', val: '24' },
               { label: 'Asset Liquidity', val: '$85M+' },
               { label: 'Verified Agents', val: '12K' },
               { label: 'Success Rate', val: '98%' }
             ].map((stat, i) => (
               <div key={i} className="space-y-1">
                  <p className="text-xl font-black text-white tracking-tighter italic">{stat.val}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center gap-4">
         <div className="w-px h-24 bg-gradient-to-b from-primary to-transparent"></div>
         <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 rotate-90 origin-left translate-x-1.5 translate-y-12">Scroll</span>
      </div>
    </section>
  )
}
