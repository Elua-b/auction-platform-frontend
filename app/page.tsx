'use client'

import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { eventAPI, productAPI, auctionAPI } from '@/lib/api'

// AutoBid Components
import { TopBar } from '@/components/top-bar'
import Header from '@/components/header'
import { HeroSectionAutoBid } from '@/components/hero-section-autobid'
import { MissionSection } from '@/components/mission-section'
import { PartnersSection } from '@/components/partners-section'
import { LiveEventsSection } from '@/components/live-events-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { AutoBidFooter } from '@/components/autobid-footer'
import { categoryAPI } from '@/lib/api'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  status: string
  image?: string
}

interface Product {
  id: string
  title: string
  description: string
  image?: string
  startingPrice: number
  status: string
  categoryId?: string
}

interface Auction {
  id: string
  productId: string
  startTime: string
  endTime: string
  status: string
}

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const [events, setEvents] = useState<Event[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [eventsData, productsData, auctionsData, categoriesData] = await Promise.all([
          eventAPI.getAll(),
          productAPI.getAll({ status: 'AVAILABLE' }),
          auctionAPI.getAll(),
          categoryAPI.getAll(),
        ])
        setEvents(Array.isArray(eventsData) ? eventsData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setAuctions(Array.isArray(auctionsData) ? auctionsData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      } catch (e) {
        setEvents([])
        setProducts([])
        setAuctions([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const liveEvents = useMemo(() => events.filter(e => e.status === 'LIVE' || e.status === 'ACTIVE'), [events])
  const upcomingEvents = useMemo(() => events.filter(e => e.status === 'UPCOMING'), [events])
  
  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === 'all') return products
    return products.filter(p => p.categoryId === selectedCategoryId)
  }, [products, selectedCategoryId])

  const requireAuthThenGo = (path: string) => {
    if (!isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(path)}`)
      return
    }
    router.push(path)
  }

  // Asset paths (copied to public/assets/images/)
  const heroImg = "/assets/images/hero_autobid_woman_car_png_1772448097517.png"
  const missionImg = "/assets/images/mission_autobid_dealership_png_1772448123136.png"

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <TopBar />
      <Header />
      
      <main>
        <HeroSectionAutoBid heroImage={heroImg} />
        <MissionSection missionImage={missionImg} />
        <PartnersSection />
        
        {/* Live Events Section - Placed logically after Partners/Team as per design flow */}
        <LiveEventsSection 
          events={liveEvents.length > 0 ? liveEvents : upcomingEvents.slice(0, 3)} 
          products={filteredProducts}
          categories={categories}
          selectedCategory={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          loading={loading}
          onNavigate={(type, id) => {
            if (type === 'event') {
              requireAuthThenGo(`/events/${id}`)
            } else {
              requireAuthThenGo(`/auction/${id}`)
            }
          }}
        />
        
        <TestimonialsSection />
      </main>

      <AutoBidFooter />
    </div>
  )
}
