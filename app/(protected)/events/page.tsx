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
    <div className="min-h-screen bg-slate-950">
      <Header user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Live Auction Events</h1>
            <p className="text-slate-400">Join exciting live auctions hosted by sellers</p>
          </div>
          {user?.userType === 'SELLER' && (
            <Link href="/seller/events/create">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Host Event
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Now</p>
                <p className="text-2xl font-bold text-white">{activeEvents.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Ended</p>
                <p className="text-2xl font-bold text-white">{endedEvents.length}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </Card>
        </div>

        {/* Active Events Section */}
        {activeEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Active Right Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* All Events Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">All Events</h2>
          {loading ? (
            <p className="text-slate-400">Loading events...</p>
          ) : events.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No events scheduled yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
