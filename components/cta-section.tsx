import React from 'react'
import { Button } from '@/components/ui/button'

export const CTASection = () => {
  return (
    <section className="relative py-28 overflow-hidden bg-[#1A1A1A]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D32F2F] opacity-10 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-[#D32F2F] opacity-5 blur-[120px]"></div>
      <div className="absolute inset-0 bg-diagonal-split opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Ready to host your own <br />
              <span className="text-[#D32F2F]">Global Auction Event?</span>
            </h2>
            <p className="text-white/60 text-lg font-medium">
              Join the elite league of sellers. We provide all the tools you need to reach <br className="hidden md:block" />
              millions of bidders with security and transparency.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-md px-12 py-8 font-black text-base shadow-2xl shadow-red-900/20 transition-all hover:scale-105">
              Get Started Now
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-md px-12 py-8 font-black text-base transition-all">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
