'use client'

import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/utils/constants'
import localforage from 'localforage'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { toast } from 'sonner'

export default function OAuth2RedirectHandler () {
  // Get query params from URL
  const params = useSearchParams()
  const router = useRouter()
  const accessToken = params.get('accessToken')
  const refreshToken = params.get('refreshToken')
  const error = params.get('error')
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
    if (accessToken && refreshToken) {
      localforage
        .setItem(ACCESS_TOKEN, accessToken)
        .then(() => {
          localforage
            .setItem(REFRESH_TOKEN, refreshToken)
            .then(() => {
              router.push('/')
            })
            .catch(error => {
              toast.error('Failed to store refresh token.')
            })
        })
        .catch(error => {
          toast.error('Failed to store access token.')
        })
    }
  }, [accessToken, refreshToken, error, router])
  return (
    <Suspense>
      <div>{error && <p>{error}</p>}</div>
    </Suspense>
  )
}
