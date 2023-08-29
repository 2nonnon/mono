import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export function usePageLoading() {
  const router = useRouter()

  const [pageLoading, setPageLoading] = useState(false)

  useEffect(() => {
    let timer: null | NodeJS.Timeout = null
    const handleRouteChangeStart = () => {
      timer = setTimeout(() => setPageLoading(true), 100)
    }

    const handleRouteChangeComplete = () => {
      clearTimeout(timer!)
      setPageLoading(false)
    }

    const handleRouteChangeError = (_err: Error) => {
      // if (err.message.includes('Failed to load script'))
      // router.back()

      handleRouteChangeComplete()
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeError', handleRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [])

  return [pageLoading, setPageLoading]
}
