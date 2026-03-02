'use client'

import React from 'react'

const PARTNERS = [
  { name: 'Cartal', logo: 'https://via.placeholder.com/150x50?text=Cartal' },
  { name: 'Design Studio', logo: 'https://via.placeholder.com/150x50?text=DESIGN+STUDIO' },
  { name: 'Cooperate', logo: 'https://via.placeholder.com/150x50?text=COOPERATE' },
  { name: 'Minimal', logo: 'https://via.placeholder.com/150x50?text=MINIMAL' },
  { name: 'Minim', logo: 'https://via.placeholder.com/150x50?text=MINIM' },
  { name: 'Sunshi', logo: 'https://via.placeholder.com/150x50?text=SUNSHI' },
]

export function PartnersSection() {
  return (
    <section className="py-20 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-black text-[#1A1A1A] mb-16 uppercase tracking-tighter">
          Our Trustworthy Partners
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
          {PARTNERS.map((partner, idx) => (
            <div key={idx} className="flex justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
