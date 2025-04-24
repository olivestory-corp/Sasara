import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getKnowledgeItem, updateKnowledgeItem } from '@/services'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { CircleCheck, Ellipsis, Loader2, LucideRefreshCcw, MoveRight } from 'lucide-react'
import { EnumKnowledgeType } from '@/constants/paths'
import { IKnowledge } from '@/types'
import { toast } from 'sonner'
import {
  createVectorsByLocalFilePaths,
  getVectors,
  createVectorsByLocalFolderPath,
  deleteVector,
  refreshVectorsByLocalFolderPath,
} from '@/services/vector'
import { filesize } from 'filesize'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function KnowledgeDetail() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { knowledgeId = '' } = useParams()
  const { data: knowledge } = useQuery({
    queryKey: ['knowledgeItem', knowledgeId],
    queryFn: () => getKnowledgeItem(knowledgeId),
  })
  const { data: vectors } = useQuery({
    queryKey: ['vectors', knowledgeId],
    queryFn: () => getVectors(knowledgeId),
  })
  const { mutateAsync: mutateCreateVectorsByLocalFilePaths, isPending: isPendingCreateVectorsByLocalFilePaths } =
    useMutation({
      mutationFn: (filePaths: string[]) => createVectorsByLocalFilePaths(knowledgeId, filePaths),
    })
  const { mutateAsync: mutateCreateVectorsByLocalFolderPath, isPending: isPendingCreateVectorsByLocalFolderPath } =
    useMutation({
      mutationFn: (path: string) => createVectorsByLocalFolderPath(knowledgeId, path),
    })
  const { mutateAsync: mutateRefreshVectorsByLocalFolderPath, isPending: isPendingRefreshVectorsByLocalFolderPath } =
    useMutation({
      mutationFn: (path: string) => refreshVectorsByLocalFolderPath(knowledgeId, path),
    })

  const handleAddFile = async () => {
    const filePaths: string[] = await window.ipcRenderer.invoke('dialog:openFile', 'Documents')
    if (!filePaths.length) return
    await mutateCreateVectorsByLocalFilePaths(filePaths)
    queryClient.invalidateQueries({ queryKey: ['vectors', knowledgeId] })
    toast.success(t('knowledge.addFileSuccess'), {
      description: `${filePaths.length} ${t('knowledge.filesAdded')}`,
    })
  }

  if (!knowledge) return null

  const isFolder = knowledge.category === EnumKnowledgeType.Folder

  const handleUpdateKnowledge = async (newData: IKnowledge) => {
    await updateKnowledgeItem(knowledge.id, newData)
    queryClient.setQueryData(['knowledgeItem', knowledge.id], newData)
    queryClient.invalidateQueries({ queryKey: ['knowledgeItems'] })
  }

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...knowledge, title: e.target.value }
    handleUpdateKnowledge(newData)
  }

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newData = { ...knowledge, description: e.target.value }
    handleUpdateKnowledge(newData)
  }

  const handleOpenFolder = async () => {
    const filePaths: string[] = await window.ipcRenderer.invoke('dialog:openDirectory')
    const [folder_path] = filePaths
    if (!folder_path) return

    const newData = { ...knowledge, folder_path }
    await handleUpdateKnowledge(newData)
    await mutateCreateVectorsByLocalFolderPath(folder_path)
    queryClient.invalidateQueries({ queryKey: ['vectors', knowledgeId] })
    toast.success(t('knowledge.folderLinkSuccess'), {
      description: t('knowledge.folderLinkDescription'),
    })
  }

  const handleDeleteVector = async (vectorId: string) => {
    await deleteVector(vectorId)
    queryClient.invalidateQueries({ queryKey: ['vectors', knowledgeId] })
  }

  const handleFolderRefresh = async () => {
    await mutateRefreshVectorsByLocalFolderPath(knowledge.folder_path)
    queryClient.invalidateQueries({ queryKey: ['vectors', knowledgeId] })
    toast.success(t('knowledge.folderRefreshSuccess'), {
      description: t('knowledge.folderRefreshDescription'),
    })
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-10">
        <Card className="w-full space-y-4 p-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="name">{t('knowledge.name')}</Label>
            <Input
              key={knowledge.id}
              type="text"
              id="name"
              placeholder={t('knowledge.namePlaceholder')}
              defaultValue={knowledge.title}
              onChange={handleTitleChange}
              className="focus-visible:ring-0"
            />
          </div>
          {/* Case of directly importing local folder */}
          {isFolder && (
            <div className="flex items-center justify-between">
              <Label htmlFor="folder">{t('knowledge.folder')}</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="address" className="text-sm text-gray-500">
                  {knowledge.folder_path}
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenFolder}
                  disabled={isPendingCreateVectorsByLocalFolderPath}
                >
                  <MoveRight className="h-4 w-4" />
                  {/* {isPendingCreateVectorsByLocalFolderPath && <Loader2 className="w-4 h-4 ml-2 animate-spin" />} */}
                </Button>
                {knowledge.folder_path && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFolderRefresh}
                    disabled={isPendingCreateVectorsByLocalFolderPath}
                  >
                    <LucideRefreshCcw
                      className={cn('h-4 w-4', isPendingCreateVectorsByLocalFolderPath && 'animate-spin')}
                    />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">{t('knowledge.description')}</Label>
              <Textarea
                key={knowledge.id}
                placeholder={t('knowledge.descriptionPlaceholder')}
                defaultValue={knowledge.description}
                onChange={handleDescriptionChange}
                className="focus-visible:ring-0"
              />
            </div>
          </div>
        </Card>
        <Card className="mx-auto w-full space-y-4 p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('knowledge.fileName')}</TableHead>
                <TableHead>{t('knowledge.size')}</TableHead>
                <TableHead>{t('knowledge.uploadedAt')}</TableHead>
                <TableHead>{t('knowledge.progress')}</TableHead>
                {!isFolder && <TableHead>{t('knowledge.actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {vectors?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>{filesize(item.size)}</TableCell>
                  <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {new Date(item.os_mtime * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <CircleCheck className="h-4 w-4" />
                  </TableCell>
                  {!isFolder && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Ellipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteVector(item.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            <TableCaption>{t('knowledge.caption')}</TableCaption>
          </Table>
        </Card>
        {!isFolder && (
          <Button className="mx-auto" onClick={handleAddFile} disabled={isPendingCreateVectorsByLocalFilePaths}>
            {t('knowledge.addFile')}
            {isPendingCreateVectorsByLocalFilePaths && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        )}
      </div>
    </ScrollArea>
  )
}
