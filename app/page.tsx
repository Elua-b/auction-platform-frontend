'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthPage from '@/components/auth/auth-page'

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userType = localStorage.getItem('userType')
    
    if (token) {
      if (userType === 'BUYER') router.push('/buyer/dashboard')
      else if (userType === 'SELLER') router.push('/seller/dashboard')
      else if (userType === 'ADMIN') router.push('/admin/dashboard')
    } else {
      setIsLoaded(true)
    }
  }, [router])

  if (!isLoaded) return null

  return <AuthPage />
}
