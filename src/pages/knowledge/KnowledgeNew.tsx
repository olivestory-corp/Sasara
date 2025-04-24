import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { EnumKnowledgeType, EnumRouterLink } from '@/constants/paths'
import { useNavigate } from 'react-router-dom'
import { useCreateKnowledgeItem } from '@/hooks/use-knowledge'
import { useTranslation } from 'react-i18next'

export default function KnowledgeNew() {
  const { t } = useTranslation()

  const tabsData = [
    {
      key: EnumKnowledgeType.Files,
      value: t('knowledge.newKnowledge'),
      title: t('knowledge.newKnowledgeDescription'),
      description: [
        t('knowledge.newKnowledgeDescription1'),
        t('knowledge.newKnowledgeDescription2'),
        t('knowledge.newKnowledgeDescription3'),
      ],
    },
    {
      key: EnumKnowledgeType.Folder,
      value: t('knowledge.newKnowledgeFolder'),
      title: t('knowledge.newKnowledgeFolderDescription'),
      description: [
        t('knowledge.newKnowledgeFolderDescription1'),
        t('knowledge.newKnowledgeFolderDescription2'),
        t('knowledge.newKnowledgeFolderDescription3'),
      ],
    },
  ]
  const navigate = useNavigate()
  const { mutateAsync: createKnowledge, isPending } = useCreateKnowledgeItem()
  const handleCreateKnowledge = async (category: EnumKnowledgeType) => {
    const newKnowledgeItem = await createKnowledge({ category })
    navigate(EnumRouterLink.KnowledgeDetail.replace(':knowledgeId', newKnowledgeItem.id))
  }

  return (
    <div className="flex h-full flex-col justify-center px-4">
      <div className="mb-8 text-center text-2xl font-semibold text-headline-main">
        {t('knowledge.newKnowledgeTitle')}
      </div>

      <div className="flex justify-center">
        <Tabs defaultValue={tabsData[0].value} className="w-[400px]">
          <TabsList className="w-full">
            {tabsData.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="w-full">
                {tab.value}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Card>
                <CardHeader>
                  <CardTitle className="pb-2 text-lg font-medium">{tab.title}</CardTitle>
                  <CardDescription className="space-y-2">
                    {tab.description.map((item, index) => (
                      <span key={index} className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                        <span>{item}</span>
                      </span>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" disabled={isPending} onClick={() => handleCreateKnowledge(tab.key)}>
                    {t('knowledge.create')}
                    {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
