import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status) {
      if (status === 'success') {
        window.open('klee://auth/callback#status=success', '_blank')
      } else {
        window.open('klee://auth/callback#status=error', '_blank')
      }
      window.close()
    }
  }, [searchParams])

  return <></>
}
