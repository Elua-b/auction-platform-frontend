'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { eventAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/header'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const combinedDateTime = new Date(`${formData.date}T${formData.startTime}`)
      const event = await eventAPI.create({
        ...formData,
        date: combinedDateTime.toISOString(),
      })
      router.push(`/seller/events/${event.id}/manage`)
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <main className="mx-auto max-w-3xl space-y-10">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 leading-none">Initialize Event</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-black">Strategic Auction Planning</p>
          </div>
          <div className="flex gap-2 text-[10px] items-center">
              <span className="text-slate-400 uppercase font-bold tracking-widest">Seller</span>
              <span className="text-slate-300">/</span>
              <span className="text-primary font-black uppercase tracking-widest">Events</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-black uppercase tracking-widest">Create</span>
          </div>
        </div>

        {/* Back Button */}
        <Link href="/seller/dashboard">
          <Button variant="outline" className="text-slate-400 border-slate-200 hover:bg-white hover:text-primary transition-all rounded-sm font-black uppercase tracking-widest text-[9px] h-9 px-6 bg-white shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Return to Command Center
          </Button>
        </Link>

        <Card className="bg-white border-none p-10 rounded-sm shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          
          <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
              <Alert variant="destructive" className="rounded-sm border-none bg-red-50 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold uppercase tracking-widest text-[10px]">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-10">
              <div className="border-b border-slate-50 pb-4 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Event Identity</h2>
                <div className="p-1 px-3 bg-slate-50 rounded-full">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phase 01 / Branding</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Official Title *</label>
                  <Input
                    required
                    placeholder="e.g. THE PLATINUM ASSET COLLECTION"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-50 border-none text-slate-800 placeholder:text-slate-300 rounded-sm h-12 font-bold uppercase tracking-tight text-sm focus-visible:ring-1 focus-visible:ring-primary transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Narrative Overview *</label>
                  <Textarea
                    placeholder="Provide a compelling overview of the collection being auctioned..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-50 border-none text-slate-700 placeholder:text-slate-300 rounded-sm min-h-[140px] p-4 font-medium text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-primary transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="border-b border-slate-50 pb-4 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Scheduling</h2>
                <div className="p-1 px-3 bg-slate-50 rounded-full">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phase 02 / Synchronization</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Execution Date *
                  </label>
                  <Input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-slate-50 border-none text-slate-800 rounded-sm h-12 font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all cursor-pointer"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Launch Time *
                  </label>
                  <Input
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-slate-50 border-none text-slate-800 rounded-sm h-12 font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col md:flex-row gap-6 border-t border-slate-50">
              <Button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-sm h-16 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
              >
                {loading ? 'INITIALIZING EVENT...' : 'CREATE EVENT & CONFIGURE LOTS'}
              </Button>
              <Link href="/seller/dashboard" className="flex-1">
                <Button variant="outline" type="button" className="w-full text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-sm h-16 font-black uppercase tracking-widest text-[11px] transition-all">
                  ABORT
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
