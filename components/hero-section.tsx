import React from 'react'

export const HeroSection = ({ heroImage }: { heroImage: string }) => {
  return (
    <section className="relative overflow-hidden pt-12">
      {/* Westpac Curved Red Background */}
      <div className="absolute inset-x-0 top-0 h-[85%] bg-[#D32F2F] bg-curved z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap items-center">
          <div className="w-full lg:w-3/5 py-20 lg:py-32 pr-0 lg:pr-20">
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1] mb-8 tracking-tight">
              Auctions for <br />
              Personal
            </h1>
            <p className="text-white/80 text-lg md:text-2xl mb-12 max-w-2xl leading-relaxed font-medium">
              Boost your winnings with our range of bidding opportunities focusing on key collection areas. Search, browse, or filter the list by category.
            </p>
          </div>
          
          <div className="w-full lg:w-2/5 relative mt-[-100px] lg:mt-0 pb-20 lg:pb-0">
            <div className="relative z-10 rounded-full overflow-hidden w-full aspect-square border-[15px] border-white shadow-3xl">
              <img src={heroImage} alt="Premium Bidding Experience" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
