import { useState } from 'react'
import { BrandIcons } from '@/components/BrandIcons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import supabase from '@/lib/supabase'
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCountdown } from 'usehooks-ts'
import { useTranslation } from 'react-i18next'

const authCallbackURL =
  import.meta.env.VITE_SUPABASE_AUTH_CALLBACK_URL || 'https://xltwffswqvowersvchkj.supabase.co/auth/v1/callback'

export default function CreateAccount() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState('')
  const [password, setPassword] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [isExistingUser] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const countStart = 60
  const [count, { startCountdown }] = useCountdown({
    countStart: countStart,
    intervalMs: 1000,
  })

  const sendConfirmationEmail = async () => {
    if (!supabase) {
      toast.error('Supabase is not initialized')
      return
    }
    const { error } = await supabase.functions.invoke('userService-sendConfirmationLinkToEmail', {
      body: JSON.stringify({ email }),
    })
    setEmailSent(email)
    if (error) {
      toast(t('auth.sendConfirmationEmailError'), {
        description: t('auth.sendConfirmationEmailErrorDescription'),
      })
    } else {
      toast(t('auth.emailSent'), {
        description: t('auth.emailSentDescription', { email }),
      })
    }
    setIsLoading(false)
    startCountdown()
  }

  const handleContinue = async () => {
    setIsLoading(true)
    await sendConfirmationEmail()
  }

  const openURL = (url: string) => {
    window.open(url, '_blank')
  }

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      toast.error('Supabase is not initialized')
      return
    }
    const oauthResponse = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authCallbackURL,
        skipBrowserRedirect: true,
      },
    })
    const { data } = oauthResponse
    const { provider, url } = data
    if (provider && url) {
      openURL(url)
    }
  }

  const handleGithubSignIn = async () => {
    if (!supabase) {
      toast.error('Supabase is not initialized')
      return
    }
    const oauthResponse = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: authCallbackURL,
        skipBrowserRedirect: true,
      },
    })
    const { data } = oauthResponse
    const { provider, url } = data
    if (provider && url) {
      openURL(url)
    }
  }

  const isCountDowning = count < countStart && count > 0
  const continueButtonTitle = isLoading
    ? t('common.waiting')
    : emailSent === email
    ? isCountDowning
      ? `${t('common.resend')} (${count} ${t('common.seconds')})`
      : t('common.send')
    : t('common.send')

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('auth.loginAccount')}</DialogTitle>
        <DialogDescription>{t('auth.enterYourEmailBelowToLoginYourAccount')}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {isExistingUser === true && Password()}
        {isExistingUser === false && VerificationCode()}
        <Button onClick={handleContinue} disabled={isLoading || isCountDowning}>
          {continueButtonTitle}
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
        {ThirdParty()}
      </div>
      {PrivacyPolicy()}
    </>
  )

  function PrivacyPolicy() {
    return (
      <DialogFooter className="mt-4 text-xs text-muted-foreground sm:justify-center">
        <span>{t('auth.agreeTo')}</span>
        <a
          href="https://kleedesktop.com/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          {t('auth.termsOfService')}
        </a>
        <span>{t('auth.and')}</span>
        <a
          href="https://kleedesktop.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          {t('auth.privacyPolicy')}
        </a>
      </DialogFooter>
    )
  }

  function ThirdParty() {
    return (
      <>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 uppercase text-muted-foreground">{t('auth.orContinueWith')}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Button variant="outline" onClick={handleGithubSignIn}>
            <BrandIcons.gitHub className="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button variant="outline" onClick={handleGoogleSignIn}>
            <BrandIcons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
      </>
    )
  }

  function Password() {
    return (
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
    )
  }

  function VerificationCode() {
    return (
      <div className="grid gap-2">
        <Label htmlFor="verify-code">{t('auth.verifyCode')}</Label>
        <Input id="verify-code" type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {t('auth.weSentACodeToYourInbox')}
          <Button variant="ghost" size="sm">
            {t('common.resend')}
          </Button>
        </div>
      </div>
    )
  }
}
