import React from 'react'
import { ChevronDown } from 'lucide-react'

const filters = [
  { label: 'Teach me the Basics' },
  { label: 'Coding and Computing' },
  { label: 'Staying Safe Online' },
]

export const SecondaryNav = () => {
  return (
    <div className="bg-[#2D3135] text-white py-4 hidden md:block">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {filters.map((filter, idx) => (
            <div key={idx} className="flex items-center gap-4 cursor-pointer hover:text-[#D32F2F] transition-colors group">
              <span className="text-sm font-bold tracking-tight">{filter.label}</span>
              <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:text-[#D32F2F]" />
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center bg-white h-10 px-4">
              <select className="text-[#1A1A1A] text-sm font-bold bg-transparent outline-none pr-8">
                 <option>All Auction Categories</option>
                 <option>Vehicles</option>
                 <option>Real Estate</option>
                 <option>Electronics</option>
              </select>
           </div>
           <button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-black px-8 h-10 uppercase tracking-widest transition-all">
              Filter
           </button>
        </div>
      </div>
    </div>
  )
}
