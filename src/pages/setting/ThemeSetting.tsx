import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useConfig } from '@/hooks/use-config'
import { baseColors } from '@/constants/base-colors'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'

export default function ThemeSetting() {
  const { t } = useTranslation()
  const [config, setConfig] = useConfig()
  return (
    <ScrollArea className="h-96">
      <div className="grid grid-cols-3 gap-4">
        {baseColors.map((baseColor) => {
          const isActive = baseColor.name === config.theme
          return (
            <div key={baseColor.name} className={cn(`theme-${baseColor.name}`)}>
              <Card
                data-key={baseColor.name}
                onClick={() => setConfig({ ...config, theme: baseColor.name })}
                className={cn('cursor-pointer bg-background-main', isActive ? 'border-2 border-headline-main' : '')}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-headline-main">{t(`themeSetting.${baseColor.name}`)}</CardTitle>
                  <CardDescription className="text-foreground">
                    <div>{t('themeSetting.description')}</div>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
