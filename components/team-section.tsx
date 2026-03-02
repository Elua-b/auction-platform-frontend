'use client'

import React from 'react'

interface TeamMember {
  name: string
  role: string
  image: string
}

interface TeamSectionProps {
  members: TeamMember[]
}

export function TeamSection({ members }: TeamSectionProps) {
  return (
    <section className="py-24 bg-[#FDFDFD]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-black text-[#1A1A1A] mb-16 uppercase tracking-tighter">
          The Team Behind the Business
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {members.map((member, idx) => (
            <div key={idx} className="group">
              <div className="relative mb-6 overflow-hidden rounded-[40px] rounded-tl-none bg-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_40px_80px_-20px_rgba(211,47,47,0.2)] transition-all duration-700">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-auto aspect-[4/5] object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 group-hover:text-[#D32F2F] transition-colors uppercase tracking-tight">
                {member.name}
              </h3>
              <p className="text-xs font-black text-[#D32F2F] uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
