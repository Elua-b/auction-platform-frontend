'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { eventAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Calendar, Clock, Users, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  status: string
  createdAt: string
}

export default function EventsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await eventAPI.getAll()
      setEvents(data)
    } catch (err) {
      setError('Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const activeEvents = events.filter((e) => e.status === 'ACTIVE')
  const upcomingEvents = events.filter((e) => e.status === 'UPCOMING')
  const endedEvents = events.filter((e) => e.status === 'ENDED')

  const EventCard = ({ event }: { event: Event }) => (
    <Link href={`/events/${event.id}`}>
      <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-amber-500 transition cursor-pointer group h-full">
        {/* Header with Status */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg group-hover:scale-105 transition">{event.title}</h3>
            <Badge
              className={`${
                event.status === 'ACTIVE'
                  ? 'bg-green-600 hover:bg-green-700'
                  : event.status === 'UPCOMING'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {event.status}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {event.description && (
            <p className="text-sm text-slate-400 line-clamp-2">{event.description}</p>
          )}

          <div className="space-y-2 border-t border-slate-700 pt-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="w-4 h-4" />
              <span>{event.startTime}</span>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault()
              router.push(`/events/${event.id}`)
            }}
            className={`w-full font-semibold text-sm mt-2 ${event.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}
          >
            {event.status === 'ACTIVE' ? 'Join Live Now' : 'View Event'}
          </Button>
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-7xl space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Network</span>
               <div className="h-px w-8 bg-slate-200"></div>
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter leading-none">Live Experiences</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Access to the world's most exclusive live auction events</p>
          </div>
          {user?.userType === 'SELLER' && (
            <Link href="/seller/events/create">
              <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-sm h-14 px-10 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]">
                <Plus className="w-4 h-4 mr-3" />
                Host Premiere Event
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-sm border-none bg-red-50 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-bold uppercase tracking-widest text-[10px]">{error}</AlertDescription>
          </Alert>
        )}

        {/* Global Analytics / Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border-none p-8 rounded-sm shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Active Now</p>
                <p className="text-3xl font-black text-slate-800">{activeEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 flex items-center justify-center text-primary rounded-sm transition-transform group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="bg-white border-none p-8 rounded-sm shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Upcoming Collections</p>
                <p className="text-3xl font-black text-slate-800">{upcomingEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm transition-transform group-hover:scale-110">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="bg-white border-none p-8 rounded-sm shadow-sm relative overflow-hidden group hover:shadow-md transition-all opacity-60">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Archive Record</p>
                <p className="text-3xl font-black text-slate-400">{endedEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-200 rounded-sm">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Dynamic Event Sections */}
        {activeEvents.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em] whitespace-nowrap">Live Auctions Ongoing</h2>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="group h-full">
                  <Card className="bg-white border-none overflow-hidden rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <span className="bg-primary text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest rounded-full">🔴 Live Now</span>
                        <div className="px-2 py-1 bg-slate-50 rounded-sm flex items-center gap-2">
                           <Users className="w-3 h-3 text-primary" />
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Theatre</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4 group-hover:text-primary transition-colors leading-tight">{event.title}</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8 line-clamp-3">
                        {event.description || 'Exclusive curated collection auction session.'}
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5 text-primary" />
                           <span className="text-[10px] font-black text-slate-800 tracking-tight">Started at {event.startTime}</span>
                         </div>
                      </div>
                    </div>
                    <div className="px-8 pb-8">
                      <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-sm h-14 transition-all group-hover:translate-y-[-2px]">
                        Enter Live Theatre
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Upcoming Collections</h2>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="group h-full">
                  <Card className="bg-white border-none overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-all duration-500 h-full flex flex-col relative opacity-90 hover:opacity-100">
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-3 py-1 uppercase tracking-widest rounded-full">Scheduled</span>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry ID: {event.id.substring(0, 8)}</div>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4 leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                      <div className="space-y-4 pt-6 mt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Execution Date</p>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Premiere Signal</p>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Live at {event.startTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-8 pb-8">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-800 font-black uppercase tracking-widest text-[9px] rounded-sm h-14 transition-all">
                        View Catalogue
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Default State */}
        {events.length === 0 && !loading && (
          <Card className="bg-white border-none p-24 text-center rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100" />
            <Calendar className="w-16 h-16 text-slate-50 mx-auto mb-8" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">No events currently scheduled</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 max-w-xs mx-auto leading-relaxed">We're synchronizing elite collections for the next premiere series. Stay tuned for authorization signals.</p>
            {user?.userType === 'SELLER' && (
              <Link href="/seller/events/create">
                <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-[10px] rounded-sm h-16 px-12 transition-all shadow-lg shadow-primary/20">
                  Host Premiere Event
                </Button>
              </Link>
            )}
          </Card>
        )}

        {loading && (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Registry...</p>
          </div>
        )}
      </main>
    </div>
  )
}
