import React from 'react'
import { Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export const TopBar = () => {
  return (
    <div className="bg-[#D32F2F] text-white py-2 text-xs hidden md:block">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span>info@finbiz.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Working: 8:00am - 6:00pm</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white/80 transition-colors">About</a>
            <a href="#" className="hover:text-white/80 transition-colors">Team</a>
            <a href="#" className="hover:text-white/80 transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-3 border-l border-white/20 pl-6">
            <a href="#" className="hover:text-white/80 transition-colors"><Facebook className="h-3 w-3" /></a>
            <a href="#" className="hover:text-white/80 transition-colors"><Twitter className="h-3 w-3" /></a>
            <a href="#" className="hover:text-white/80 transition-colors"><Instagram className="h-3 w-3" /></a>
            <a href="#" className="hover:text-white/80 transition-colors"><Linkedin className="h-3 w-3" /></a>
          </div>
        </div>
      </div>
    </div>
  )
}
