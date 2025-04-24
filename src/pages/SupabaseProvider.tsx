import { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import supabase from '@/lib/supabase'

const SupabaseContext = createContext<[Session | null, Dispatch<SetStateAction<Session | null>>] | null>(null)

export function useSupabaseSession() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabaseSession must be used within a SupabaseSessionProvider')
  }
  return context
}

function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = useMemo(() => [session, setSession], [session, setSession])

  return (
    <SupabaseContext.Provider value={value as [Session | null, Dispatch<SetStateAction<Session | null>>]}>
      {children}
    </SupabaseContext.Provider>
  )
}

export default SupabaseSessionProvider
