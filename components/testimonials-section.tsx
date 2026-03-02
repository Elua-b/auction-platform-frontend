'use client'

import React from 'react'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          {/* Left Text */}
          <div className="lg:w-1/3">
            <span className="text-[#D32F2F] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
              Find out Now
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-8 uppercase tracking-tighter leading-[0.9]">
              What Our Bidders Are Saying
            </h2>
            <Button variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-10 py-7 text-[10px] font-black uppercase tracking-widest rounded-none bg-transparent">
              Start Bidding
            </Button>
          </div>

          {/* Right Carousel Card */}
          <div className="flex-1 w-full relative">
            <div className="bg-white p-12 lg:p-20 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.1)] rounded-[60px] rounded-tl-none border border-gray-50 relative">
              <div className="absolute top-10 left-10 text-gray-100 -z-10">
                <Quote className="h-40 w-40" />
              </div>
              
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-8 uppercase tracking-tight">
                  Winning Rare Items Was Simple
                </h3>
                <p className="text-gray-500 italic text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
                  "AutoBid completely changed how I source high-end inventory. The real-time bidding is flawless, 
                  and the transparent history gave me total confidence in my purchase. It's the most exciting 
                  way to buy high-value assets!"
                </p>

                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=George" 
                      alt="George Orwell" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-[#1A1A1A] uppercase tracking-tight">George Orwell</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arizona, AZ</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col gap-4">
                <button className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-[#D32F2F] hover:text-white transition-all group">
                  <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                <button className="w-12 h-12 bg-[#D32F2F] shadow-xl rounded-full flex items-center justify-center hover:bg-[#B71C1C] text-white transition-all">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
