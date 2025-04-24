import LottieLogo from '@/components/lottie/Logo'
import { useTranslation } from 'react-i18next'

export default function LogoCard() {
  const { t } = useTranslation()
  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-6">
        <LottieLogo className="h-20 w-20" />
        <div className="flex flex-col">
          <span className="text-3xl font-medium text-headline-main">{t('logo.name')}</span>
          <span className="text-lg text-foreground">{t('logo.description')}</span>
        </div>
      </div>
    </div>
  )
}
