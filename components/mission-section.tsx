'use client'

import React from 'react'

interface MissionSectionProps {
  missionImage: string
}

export function MissionSection({ missionImage }: MissionSectionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Mission Text */}
          <div className="flex-1">
            <h2 className="text-4xl font-black text-[#1A1A1A] mb-8 leading-tight uppercase tracking-tighter">
              The Premier Digital <br/> Auction Marketplace
            </h2>
            <div className="space-y-6 text-gray-500 leading-relaxed max-w-2xl">
              <p>
                AutoBid is where passion for exceptional items meets the efficiency of modern technology. 
                We provide a transparent, secure, and exhilarating platform for enthusiasts and collectors to 
                find and win their next dream acquisition.
              </p>
              <p>
                From rare collectibles to high-value assets, our curated auctions ensure that every 
                transaction is more than just a purchase — it's an experience built on trust and 
                unbeatable excitement.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center gap-8">
              <div className="flex items-center gap-4">
                <span className="text-7xl font-black text-[#D32F2F]">50k+</span>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">Items</span>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Auctioned</span>
                </div>
              </div>
              <p className="max-w-[200px] text-xs font-semibold text-gray-400 leading-relaxed uppercase tracking-tighter">
                Our global platform delivers a seamless bidding experience for collectors worldwide.
              </p>
            </div>
          </div>

          {/* Mission Image */}
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-[60px] rounded-tl-none overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
              <img 
                src={missionImage} 
                alt="Our Team Collaborating" 
                className="w-full h-auto object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-50 -z-10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
