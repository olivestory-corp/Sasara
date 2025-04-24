import { CheckIcon, Loader2 } from 'lucide-react'
import supabase from '@/lib/supabase'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useSubscription } from '@/hooks/use-subscription'
import { useQueryClient } from '@tanstack/react-query'
import { useSupabaseSession } from '../SupabaseProvider'
import { toast } from 'sonner'
import { useTranslation, Trans } from 'react-i18next'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Account() {
  const { t } = useTranslation()
  // const [isDataLoaded, setIsDataLoaded] = useState(false)
  // const [isLoading, setIsLoading] = useState(true)
  // const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [session] = useSupabaseSession()
  const queryClient = useQueryClient()
  const { data: subscription, isPending: isLoading, isSuccess: isDataLoaded } = useSubscription()

  const handleUpgrade = async () => {
    if (!supabase) return
    setIsUpgrading(true)
    const { data, error } = await supabase.functions.invoke('subscriptionService-fetchSubscriptionLink', {
      body: JSON.stringify({
        type: 'monthly',
      }),
    })
    if (error) {
      toast.error(error.message || t('subscription.account.upgradeFailed'))
    } else {
      const {
        data: { url },
      } = JSON.parse(data)
      window.open(url, '_blank')
    }
    setIsUpgrading(false)
  }

  const handleRenew = () => {
    handleUpgrade()
  }
  const handleCancel = async () => {
    if (!supabase) return
    setIsCanceling(true)
    const { data, error } = await supabase.functions.invoke('subscriptionService-cancelSubscription')
    if (data) {
      await queryClient.invalidateQueries({ queryKey: ['subscription', session?.user?.id] })
    } else {
      toast.error(error.message || t('subscription.account.cancelFailed'))
    }
    setIsCanceling(false)
  }

  const handleResume = async () => {
    if (!supabase) return
    setIsResuming(true)
    const { data, error } = await supabase.functions.invoke('subscriptionService-resumeSubscription')
    if (data) {
      await queryClient.invalidateQueries({ queryKey: ['subscription', session?.user?.id] })
    } else {
      toast.error(error.message || t('subscription.account.resumeFailed'))
    }
    setIsResuming(false)
  }

  const title = subscription?.status === 'active' ? t('subscription.account.title') : t('subscription.upgrade.title')

  const endDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : ''

  const description =
    subscription?.status === 'active'
      ? subscription.cancel_at_period_end
        ? t('subscription.account.expiration', { endDate })
        : t('subscription.account.proUser', { endDate })
      : t('subscription.upgrade.description')

  const subscriptionInfo = { title, description }

  const tiers = [
    {
      name: t('subscription.tiers.free.name'),
      id: 'tier-free',
      href: '#',
      priceMonthly: '$0',
      description: t('subscription.tiers.free.description'),
      features: [
        t('subscription.features.openSourceModels'),
        t('subscription.features.unlimitedDialogues'),
        t('subscription.features.noteTaking'),
        t('subscription.features.knowledgeBase'),
      ],
      mostPopular: false,
      available: false,
    },
    {
      name: t('subscription.tiers.pro.name'),
      id: 'tier-pro',
      href: '#',
      priceMonthly: '$12',
      description: t('subscription.tiers.pro.description'),
      features: [
        t('subscription.features.openSourceModels'),
        t('subscription.features.unlimitedDialogues'),
        t('subscription.features.noteTaking'),
        t('subscription.features.knowledgeBase'),
        t('subscription.features.openAiModels'),
        t('subscription.features.anthropicModels'),
        t('subscription.features.aiFunctions'),
      ],
      mostPopular: true,
      available: true,
    },
    {
      name: t('subscription.tiers.enterprise.name'),
      id: 'tier-enterprise',
      href: '#',
      priceMonthly: 'TBD',
      description: t('subscription.tiers.enterprise.description'),
      features: [
        t('subscription.features.openSourceModels'),
        t('subscription.features.unlimitedDialogues'),
        t('subscription.features.noteTaking'),
        t('subscription.features.knowledgeBase'),
        t('subscription.features.openAiModels'),
        t('subscription.features.anthropicModels'),
        t('subscription.features.aiFunctions'),
        t('subscription.features.sharedKnowledge'),
        t('subscription.features.adminAndUserRoles'),
        t('subscription.features.apiAccess'),
      ],
      mostPopular: false,
      available: false,
    },
  ]

  return (
    <>
      <DialogHeader>
        <DialogTitle>{subscriptionInfo.title}</DialogTitle>
        <DialogDescription>
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-headline-main" />
            </div>
          ) : (
            <Trans components={{ strong: <strong /> }}>{subscriptionInfo.description}</Trans>
          )}
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.mostPopular ? 'lg:z-10' : 'lg:mt-8',
              'flex flex-col justify-between rounded-xl p-6 ring-1 ring-border',
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.mostPopular ? 'text-headline-main' : 'text-foreground',
                    'text-lg font-semibold leading-8',
                  )}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-headline-main">
                    {t('subscription.tiers.mostPopular')}
                  </p>
                ) : null}
              </div>
              <p className="mt-4 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">
                  /{t('subscription.tiers.month')}
                </span>
              </p>
              <ul role="list" className="mt-4 space-y-2 text-sm leading-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-2 text-muted-foreground">
                    <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-headline-main" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            {/* Not subscribed */}
            {tier.available && subscription === null && isDataLoaded && (
              <Button onClick={handleUpgrade} className="mt-8" disabled={isUpgrading}>
                {isUpgrading ? t('subscription.account.upgrading') : t('subscription.account.upgrade')}
                {isUpgrading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            )}
            {/* Subscribed and active */}
            {tier.available &&
              subscription &&
              subscription.status === 'active' &&
              !subscription.cancel_at_period_end &&
              isDataLoaded && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="mt-8" disabled={isCanceling}>
                      {isCanceling ? t('subscription.account.canceling') : t('subscription.account.cancelSubscription')}
                      {isCanceling && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('subscription.account.cancelSubscription')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('subscription.account.cancelSubscriptionDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('subscription.account.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel}>{t('subscription.account.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            {/* Subscription cancelled but not yet expired */}
            {tier.available &&
              subscription &&
              subscription.status === 'active' &&
              subscription.cancel_at_period_end &&
              isDataLoaded && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="mt-8" disabled={isResuming}>
                      {isResuming ? t('subscription.account.resuming') : t('subscription.account.resume')}
                      {isResuming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('subscription.account.resumeSubscription')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('subscription.account.resumeSubscriptionDescription', { endDate })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('subscription.account.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResume}>{t('subscription.account.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            {tier.available && subscription && subscription.status !== 'active' && (
              <Button variant="outline" className="mt-8" disabled={isRenewing} onClick={handleRenew}>
                {isRenewing ? t('subscription.account.renewing') : t('subscription.account.renew')}
                {isRenewing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
