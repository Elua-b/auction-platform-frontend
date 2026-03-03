'use client'

import React from 'react'
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, Clock } from 'lucide-react'

export function AutoBidFooter() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-20 pb-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          {/* Logo & Support */}
          <div>
            <div className="flex flex-col mb-10 group cursor-pointer">
              <span className="text-4xl font-black text-white leading-tight uppercase tracking-tighter">CUNGURA</span>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Customer support</h4>
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-300 leading-relaxed">
                0788420128<br/>
                  0788420128<br/>
                  bugingoeloi@gmail.com<br/>
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-2 block">(Monday - Friday 08:00 - 18:00)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Latest Items */}
          <div>
            <h4 className="text-lg font-black text-white mb-8 uppercase tracking-tight">
              Latest Items
            </h4>
            <ul className="space-y-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              {['iPhone 15 Pro', 'MacBook M3', 'Rolex Submariner', 'Tesla Model 3', 'PlayStation 5', 'DJI Mavic 3'].map((item) => (
                <li key={item} className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors">
                  <span className="text-gray-600 font-black">»</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* AutoBid Info */}
          <div>
            <h4 className="text-lg font-black text-white mb-8 uppercase tracking-tight">
              Platform
            </h4>
            <ul className="space-y-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              {['Browse', 'Live Events', 'How to Bid', 'FAQ', 'Pricing'].map((item) => (
                <li key={item} className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors">
                  <span className="text-gray-600 font-black">»</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Information */}
          <div>
            <h4 className="text-lg font-black text-white mb-8 uppercase tracking-tight">
              Account
            </h4>
            <ul className="space-y-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10">
              {['My Dashboard', 'Bid History', 'Seller Portal', 'Contact'].map((item) => (
                <li key={item} className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors">
                  <span className="text-gray-600 font-black">»</span> {item}
                </li>
              ))}
            </ul>
            
            <div className="flex gap-4 items-center">
              <Facebook className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900/50 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
          <p>© 2026 AuctionHub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
