import React from 'react'
import { Gavel, ShieldCheck, Globe, Star } from 'lucide-react'

export const AboutSection = ({ aboutImage }: { aboutImage: string }) => {
  return (
    <section className="py-32 bg-white overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-20 lg:mb-0 relative">
            <div className="relative">
              {/* Image with unique border-radius */}
              <div className="rounded-tr-[120px] rounded-bl-[120px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] relative z-10 w-4/5 border-8 border-white">
                <img src={aboutImage} alt="Secure Auction Bidding" className="w-full h-auto object-cover aspect-[4/5]" />
              </div>
              
              {/* Feature Box with unique design */}
              <div className="absolute -bottom-12 right-0 w-3/5 bg-[#1A1A1A] text-white rounded-[40px] shadow-2xl z-20 p-10 transform translate-x-4 border-l-8 border-[#D32F2F]">
                 <div className="flex flex-col gap-2">
                    <div className="text-[#D32F2F] text-6xl font-black leading-none mb-2">10k+</div>
                    <div className="text-white/80 font-extrabold text-sm uppercase tracking-widest leading-relaxed">
                       Verified Global <br />
                       Bidding Events
                    </div>
                 </div>
              </div>

              {/* Unique red accented backdrop */}
              <div className="absolute -top-10 -left-10 w-full h-full bg-[#D32F2F]/5 rounded-full blur-3xl z-0"></div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 px-4">
            <div className="max-w-2xl lg:ml-auto">
              <h5 className="text-[#D32F2F] font-extrabold text-xs uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <span className="w-12 h-[2px] bg-[#D32F2F]"></span> THE AUCTION STANDARD
              </h5>
              <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] mb-10 leading-[1.1] tracking-tight">
                Trust & Security in <br />
                Every <span className="text-[#D32F2F]">Winning Bid</span>
              </h2>
              <p className="text-gray-500 text-lg mb-12 leading-relaxed font-medium">
                Our platform sets the global benchmark for auction reliability. We combine advanced real-time synchronization with rigorous seller verification to ensure every event is fair, fast, and secure.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                {[
                  { title: 'Global Reach', desc: 'Connect with premium buyers and sellers worldwide.', icon: <Globe className="h-6 w-6" /> },
                  { title: 'Verified Lots', desc: 'Every product is authenticated before the event.', icon: <Star className="h-6 w-6" /> },
                  { title: 'Instant Bidding', desc: 'Zero-latency bidding for competitive events.', icon: <Gavel className="h-6 w-6" /> },
                  { title: 'Secure Escrow', desc: 'Payments are held until satisfaction is confirmed.', icon: <ShieldCheck className="h-6 w-6" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#D32F2F] group-hover:text-white transition-all text-[#D32F2F] shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                        <h4 className="text-[#1A1A1A] font-black text-base mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-10 pt-10 border-t border-gray-100">
                <div className="flex items-center gap-2">
                   {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#D32F2F] text-[#D32F2F]" />
                   ))}
                   <span className="ml-2 font-black text-[#1A1A1A]">4.9 / 5.0 Rating</span>
                </div>
                <div className="h-10 w-[2px] bg-gray-100 hidden sm:block"></div>
                <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                   Trusted by over <br />
                   <span className="text-[#1A1A1A]">50k+ Auctioneers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
