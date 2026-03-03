'use client'

import React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Gavel, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from "@/components/header"

interface AuthPageProps {
  initialTab?: 'login' | 'register'
}

export default function AuthPage({ initialTab = 'login' }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login, register } = useAuth()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'BUYER' as 'BUYER' | 'SELLER',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(loginForm.email, loginForm.password)
      const userType = localStorage.getItem('userType')
      if (userType === 'BUYER') router.push('/buyer/dashboard')
      else if (userType === 'SELLER') router.push('/seller/dashboard')
      else if (userType === 'ADMIN') router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.userType)
      const userType = localStorage.getItem('userType')
      if (userType === 'BUYER') router.push('/buyer/dashboard')
      else if (userType === 'SELLER') router.push('/seller/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-[480px]">

          {/* Auth Card */}
          <Card className="bg-white border-none shadow-2xl rounded-sm overflow-hidden p-0">
            <Tabs defaultValue={initialTab} className="w-full">
              <TabsList className="w-full bg-slate-50 p-0 h-16 rounded-none grid grid-cols-2 divide-x divide-white">
                <TabsTrigger value="login" className="h-full font-black uppercase tracking-[0.2em] text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary transition-all rounded-none border-t-2 border-transparent data-[state=active]:border-primary shadow-none">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="h-full font-black uppercase tracking-[0.2em] text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary transition-all rounded-none border-t-2 border-transparent data-[state=active]:border-primary shadow-none">
                  Create Agent
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="p-8 md:p-12 space-y-8 animate-in fade-in duration-300">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-100 text-[#e35b5a] rounded-none">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-[10px] font-black uppercase tracking-widest">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                    <Input
                      type="email"
                      placeholder="EMAIL@PROTOCOL.COM"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="bg-slate-50 border-none rounded-none py-6 uppercase font-black text-[11px] tracking-widest placeholder:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="bg-slate-50 border-none rounded-none py-6 tracking-widest"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-none shadow-lg shadow-primary/20 transition-all mt-4"
                  >
                    {isLoading ? 'Synchronizing...' : (
                      <>
                        Authorize Access
                        <ArrowRight className="w-4 h-4 ml-3" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="flex items-center gap-4 py-4">
                   <div className="h-px flex-1 bg-slate-50"></div>
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">or</span>
                   <div className="h-px flex-1 bg-slate-50"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                      <ShieldCheck className="w-6 h-6 text-slate-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Registry ID</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                      <Zap className="w-6 h-6 text-slate-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Biometrics</span>
                   </div>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="p-8 md:p-12 space-y-8 animate-in fade-in duration-300">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-100 text-[#e35b5a] rounded-none">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-[10px] font-black uppercase tracking-widest">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agent Name</label>
                    <Input
                      type="text"
                      placeholder="FULL NAME"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="bg-slate-50 border-none rounded-none py-6 uppercase font-black text-[11px] tracking-widest placeholder:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                    <Input
                      type="email"
                      placeholder="EMAIL@PROTOCOL.COM"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="bg-slate-50 border-none rounded-none py-6 uppercase font-black text-[11px] tracking-widest placeholder:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="bg-slate-50 border-none rounded-none py-6 tracking-widest"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Role</label>
                    <select
                      value={registerForm.userType}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          userType: e.target.value as 'BUYER' | 'SELLER',
                        })
                      }
                      className="w-full bg-slate-50 border-none rounded-none h-12 px-4 font-black uppercase tracking-widest text-[10px] appearance-none cursor-pointer focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="BUYER">Buyer (Investor)</option>
                      <option value="SELLER">Seller (Authority)</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-none shadow-lg shadow-primary/20 transition-all mt-4"
                  >
                    {isLoading ? 'Registering Agent...' : (
                      <>
                        Initiate Portal
                        <Gavel className="w-4 h-4 ml-3" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
               © 2026 CUNGURA Protocol. All Rights Reserved.
             </p>
          </div>
        </div>
      </main>
    </div>
  )
}
