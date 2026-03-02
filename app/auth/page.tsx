'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

function AuthRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading, user } = useAuth()

  useEffect(() => {
    if (loading) return
    
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
        return
      }

      if (user?.userType === 'BUYER') router.push('/buyer/dashboard')
      else if (user?.userType === 'SELLER') router.push('/seller/dashboard')
      else if (user?.userType === 'ADMIN') router.push('/admin/dashboard')
    } else {
      // Redirect to login if not authenticated
      const redirect = searchParams.get('redirect')
      const loginUrl = redirect 
        ? `/auth/login?redirect=${encodeURIComponent(redirect)}` 
        : '/auth/login'
      router.push(loginUrl)
    }
  }, [isAuthenticated, loading, router, searchParams, user?.userType])

  return null
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectContent />
    </Suspense>
  )
}
