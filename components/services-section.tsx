import React from 'react'
import { ArrowRight, Gavel, Timer, ShieldCheck, UserCheck, Bell, BarChart3 } from 'lucide-react'

const features = [
  {
    title: 'Live Bidding Rooms',
    description: 'Experience the thrill of real-time auctions with instant bid synchronization and live updates.',
    icon: <Gavel className="h-10 w-10 text-[#D32F2F]" />,
  },
  {
    title: 'Timed Auctions',
    description: 'Participate in extended biddings with automatic timers and fair closing rules.',
    icon: <Timer className="h-10 w-10 text-[#D32F2F]" />,
  },
  {
    title: 'Secure Escrow',
    description: 'We safeguard your funds until you receive and verify the products you won.',
    icon: <ShieldCheck className="h-10 w-10 text-[#D32F2F]" />,
  },
  {
    title: 'Verified Participants',
    description: 'All buyers and sellers undergo strict background checks for a safe environment.',
    icon: <UserCheck className="h-10 w-10 text-[#D32F2F]" />,
  },
  {
    title: 'Smart Notifications',
    description: 'Never miss an outbid or event start with our real-time notification engine.',
    icon: <Bell className="h-10 w-10 text-[#D32F2F]" />,
  },
  {
    title: 'Seller Analytics',
    description: 'Comprehensive insights for sellers to track event performance and bidding behavior.',
    icon: <BarChart3 className="h-10 w-10 text-[#D32F2F]" />,
  },
]

export const ServicesSection = () => {
  return (
    <section className="py-32 bg-[#FAFAFA] relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-100 rounded-full blur-[100px] z-0 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D32F2F]/5 rounded-full blur-[100px] z-0 opacity-50"></div>

      <div className="container mx-auto px-4 text-center mb-24 relative z-10">
        <h5 className="text-[#D32F2F] font-extrabold text-xs uppercase tracking-[0.4em] mb-6 inline-flex items-center gap-3">
          <span className="w-12 h-[2px] bg-[#D32F2F]"></span> PLATFORM FEATURES
        </h5>
        <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tight">
          Tools for Professional <br />
          <span className="text-[#D32F2F]">Bidding & Selling</span>
        </h2>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-12 rounded-[32px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 group border border-gray-50 flex flex-col items-center text-center transform hover:-translate-y-2">
              <div className="mb-10 p-6 rounded-3xl bg-gray-50 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500">
                {React.cloneElement(feature.icon as React.ReactElement, {
                  className: `h-10 w-10 group-hover:text-[#D32F2F] transition-colors`
                })}
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 group-hover:text-[#D32F2F] transition-colors">{feature.title}</h3>
              <p className="text-gray-400 font-medium mb-10 leading-relaxed text-base">
                {feature.description}
              </p>
              <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#D32F2F] transition-colors">
                Explore More
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
