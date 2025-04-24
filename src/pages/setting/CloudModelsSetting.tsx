import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAllProviders, useDefaultLlmModel, useSetDefaultLlmModel } from '@/hooks/use-llm'
import { ILlmProvider, ILlmModel } from '@/types'
import { Plus, Bot, Edit, Trash2, Loader2 } from 'lucide-react'
import { useCreateCustomProvider, useUpdateCustomProvider, useDeleteCustomProvider } from '@/hooks/use-custom-provider'
import { toast } from 'sonner'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, uuid } from '@/lib/utils'
import { PopoverClose } from '@radix-ui/react-popover'
import { useTranslation } from 'react-i18next'

function ProviderItem({
  provider,
  selectedProviderId,
  handleProviderSelected,
}: {
  provider: ILlmProvider
  selectedProviderId: string
  handleProviderSelected: (provider: ILlmProvider) => void
}) {
  const [isEditingProvider, setIsEditingProvider] = useState<boolean>(false)
  const { mutateAsync: deleteCustomProvider, isPending: isDeletingProvider } = useDeleteCustomProvider()
  const { t } = useTranslation()

  return (
    <Button
      key={provider.id}
      onClick={() => handleProviderSelected(provider)}
      variant={selectedProviderId === provider.id ? null : 'ghost'}
      className={cn('group relative w-full justify-start', selectedProviderId === provider.id ? 'bg-primary/20' : '')}
    >
      <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <Avatar className="h-8 w-8">
            <AvatarImage src={provider.icon} />
            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{provider.name}</span>
        </div>
        {provider.custom && (
          <div className="flex items-center gap-2">
            <Popover open={isEditingProvider} onOpenChange={setIsEditingProvider}>
              <PopoverTrigger className="cursor-default opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <EditModelForm provider={provider} onClose={() => setIsEditingProvider(false)} />
              </PopoverContent>
            </Popover>
            <AlertDialog>
              <AlertDialogTrigger className="cursor-default opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Trash2 className="h-4 w-4 text-muted-foreground"></Trash2>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.providers.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.providers.deleteConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => deleteCustomProvider(provider.id)} disabled={isDeletingProvider}>
                    {t('common.delete')}
                    {isDeletingProvider && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </AlertDialogAction>
                  <AlertDialogCancel disabled={isDeletingProvider}>{t('common.cancel')}</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </Button>
  )
}

function EditModelForm({ provider, onClose }: { provider: ILlmProvider; onClose: () => void }) {
  const [newProviderName, setNewProviderName] = useState(provider.name)
  const [newProviderApiKey, setNewProviderApiKey] = useState(provider.apiKey)
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState(provider.baseUrl)
  const { mutateAsync: updateProvider, isPending: isUpdatingProvider } = useUpdateCustomProvider()
  const { t } = useTranslation()

  const handleUpdateProvider = async () => {
    await updateProvider({
      ...provider,
      name: newProviderName,
      apiKey: newProviderApiKey,
      baseUrl: newProviderBaseUrl,
    })
    setNewProviderName('')
    setNewProviderApiKey('')
    setNewProviderBaseUrl('')

    onClose()
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">{t('settings.providers.editProvider')}</h4>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="edit-name">{t('common.name')}</Label>
          <Input
            className="col-span-2 h-8"
            placeholder="Enter provider name"
            value={newProviderName}
            onChange={(e) => setNewProviderName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="edit-apiKey">{t('settings.providers.apiKey')}</Label>
          <Input
            className="col-span-2 h-8"
            placeholder="sk-..."
            type="password"
            value={newProviderApiKey}
            onChange={(e) => setNewProviderApiKey(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="edit-baseUrl">{t('settings.providers.endpoint')}</Label>
          <Input
            className="col-span-2 h-8"
            placeholder="https://api.example.com"
            value={newProviderBaseUrl}
            onChange={(e) => setNewProviderBaseUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={handleUpdateProvider} size="sm" disabled={isUpdatingProvider}>
          {t('common.update')}
          {isUpdatingProvider && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isUpdatingProvider}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}

export default function CloudModelsSetting() {
  const { t } = useTranslation()
  const defaultLlmModel = useDefaultLlmModel()
  const setDefaultLlmModel = useSetDefaultLlmModel()
  const providers = useAllProviders()

  const { mutateAsync: createCustomProvider, isPending: isCreatingProvider } = useCreateCustomProvider()
  const { mutateAsync: updateCustomProvider, isPending: isUpdatingProvider } = useUpdateCustomProvider()

  const [selectedProviderId, setSelectedProviderId] = useState<string>('openai')

  const [newProviderName, setNewProviderName] = useState('')
  const [newProviderApiKey, setNewProviderApiKey] = useState('')
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState('')
  const [newModelName, setNewModelName] = useState('')
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [isAddingModel, setIsAddingModel] = useState(false)

  // const providers = useMemo(() => [...(cloudProviders || []), ...(customProviders || [])], [cloudProviders, customProviders])
  const selectedProvider = useMemo(() => {
    return providers.find((provider) => provider.id === selectedProviderId)
  }, [selectedProviderId, providers])
  const selectedModels = useMemo(() => {
    return selectedProvider?.models || []
  }, [selectedProvider])

  const handleAddProvider = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    if (newProviderName === '') {
      return
    }
    const newProvider = await createCustomProvider({
      name: newProviderName,
      apiKey: newProviderApiKey,
      baseUrl: newProviderBaseUrl,
      models: [],
      icon: '',
      description: '',
    })
    console.log('[renderer] -> handleAddProvider', newProvider)

    setNewProviderName('')
    setNewProviderApiKey('')
    setNewProviderBaseUrl('')

    // Select newly added provider by default
    setSelectedProviderId(newProvider.id)
    setIsAddingProvider(false)
  }

  const handleCancelAddProvider = () => {
    setNewProviderName('')
    setNewProviderApiKey('')
    setNewProviderBaseUrl('')
  }

  const handleProviderSelected = (provider: ILlmProvider) => {
    setSelectedProviderId(provider.id)
  }

  const handleAddModel = async () => {
    if (newModelName.trim() === '') {
      return
    }
    if (!selectedProvider) return

    const newModel: ILlmModel = {
      id: uuid(),
      name: newModelName,
      provider: selectedProviderId,
      description: '',
      icon: '',
    }
    const newProvider = {
      ...selectedProvider,
      models: [...selectedModels, newModel],
    }

    await updateCustomProvider(newProvider)

    setNewModelName('')
    setIsAddingModel(false)
  }

  const handleCancelAddModel = () => {
    setNewModelName('')
  }

  const handleDeleteModel = async (modelToDelete: ILlmModel) => {
    if (selectedProviderId === 'openai' || selectedProviderId === 'anthropic') {
      return
    }
    if (!selectedProvider) return

    const newProvider = {
      ...selectedProvider,
      models: selectedModels.filter((model) => model.id !== modelToDelete.id),
    }
    await updateCustomProvider(newProvider)

    toast.success(t('settings.models.modelDeleted'))
  }

  return (
    <div className="grid h-96 grid-cols-12 gap-2">
      {/* Left column */}
      <div className="col-span-4 flex max-h-[50vh] flex-col justify-between gap-2 border-r">
        {/* Provider list */}
        <ScrollArea className="h-full flex-1">
          <div className="flex flex-col gap-2 px-3 py-2">
            {providers.map((provider) => (
              <ProviderItem
                key={provider.id}
                provider={provider}
                selectedProviderId={selectedProviderId}
                handleProviderSelected={handleProviderSelected}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Add provider button */}
        <Popover open={isAddingProvider} onOpenChange={setIsAddingProvider}>
          <PopoverTrigger asChild>
            <Button variant="link" className="w-full justify-start text-sm text-muted-foreground">
              {t('settings.providers.addYourProviders')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t('settings.providers.newProvider')}</h4>
              <p className="text-sm text-muted-foreground">{t('settings.providers.newProviderDescription')}</p>
            </div>

            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="name">{t('common.name')}</Label>
                <Input
                  className="col-span-2 h-8"
                  placeholder={t('settings.providers.enterProviderName')}
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="apiKey">{t('settings.providers.apiKey')}</Label>
                <Input
                  className="col-span-2 h-8"
                  placeholder="sk-..."
                  type="password"
                  value={newProviderApiKey}
                  onChange={(e) => setNewProviderApiKey(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="baseUrl">{t('settings.providers.endpoint')}</Label>
                <Input
                  className="col-span-2 h-8"
                  placeholder="https://api.example.com"
                  value={newProviderBaseUrl}
                  onChange={(e) => setNewProviderBaseUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button className="w-auto" size="sm" onClick={handleAddProvider} disabled={isCreatingProvider}>
                {t('common.add')}
                {isCreatingProvider && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
              <PopoverClose asChild>
                <Button variant="outline" size="sm" onClick={handleCancelAddProvider} disabled={isCreatingProvider}>
                  {t('common.cancel')}
                </Button>
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right column */}
      <div className="col-span-8 flex max-h-[50vh] flex-col justify-between gap-2">
        {/* Model list */}
        <ScrollArea className="h-full flex-1">
          {selectedModels.length > 0 && (
            <div className="flex flex-col gap-3 px-3 py-2">
              {selectedModels.map((model) => (
                <div key={model.id} className="group relative">
                  <Button variant={'ghost'} className={cn('w-full justify-start pr-10')}>
                    <div className="flex w-full items-center gap-2 overflow-hidden">
                      {model.icon === '' ? (
                        <Bot className="h-6 w-6 text-primary" />
                      ) : (
                        <img src={model.icon} alt={model.name} className="h-6 w-6 rounded-full border border-border" />
                      )}
                      <span className="truncate">{model.name}</span>
                      {/* {defaultLlmModel?.id === model.id && <Badge>Default</Badge>} */}
                    </div>
                  </Button>
                  {selectedProvider?.custom && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-default p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteModel(model)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add model button */}
          {selectedProvider && selectedProvider.custom && (
            <Popover open={isAddingModel} onOpenChange={setIsAddingModel}>
              <PopoverTrigger asChild>
                <Button variant="link" className="w-full justify-start gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>{t('settings.models.addModels')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="space-y-3">
                <h4 className="font-medium leading-none">{t('settings.models.newModel')}</h4>
                <p className="text-sm text-muted-foreground">{t('settings.models.newModelDescription')}</p>

                <Input
                  placeholder={t('settings.models.enterModelName')}
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddModel()
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
