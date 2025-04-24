import supabase from '@/lib/supabase'
import { useSupabaseSession } from '@/pages/SupabaseProvider'
import { useDeepLinkParams } from './use-deep-link-params'
import { useQuery } from '@tanstack/react-query'
import { UserSubscription } from '@/types'
import { atom, useAtom } from 'jotai'

export function useSubscription() {
  const [session] = useSupabaseSession()
  const userId = session?.user?.id
  const [url] = useDeepLinkParams()
  const isPaymentSuccess = url.startsWith('payment_success')

  return useQuery({
    queryKey: ['subscription', userId, isPaymentSuccess],
    queryFn: async () => {
      if (!userId) return null
      if (!supabase) return null
      try {
        const { data: userSubscriptions } = await supabase
          .from('users_subscriptions')
          .select()
          .eq('user_id', userId)
          .returns<UserSubscription[]>()

        // console.log('Retrieved user subscription information:', result.data)
        const userSubscriptionActive =
          userSubscriptions?.find((subscription) => subscription.status === 'active') || null
        return userSubscriptionActive || null
      } catch (error) {
        console.error('Error fetching subscription info:', error)
        return null
      }
    },
    enabled: !!userId || isPaymentSuccess,
  })
}

/** Whether the user is a premium user */
export function useIsPremium() {
  const { data: subscription } = useSubscription()
  if (!supabase) return true
  if (process.env.NODE_ENV === 'development') return true
  return subscription?.status === 'active'
}

// Whether to show the payment prompt dialog
export const upgradeAlertAtom = atom(false)

export function useUpgradeAlert() {
  return useAtom(upgradeAlertAtom)
}

// Whether to show the premium upgrade dialog
export const noPremiumAlertAtom = atom(false)

export function useNoPremiumAlert() {
  return useAtom(noPremiumAlertAtom)
}
