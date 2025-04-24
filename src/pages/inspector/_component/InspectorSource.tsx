import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, Plus, X, LucideNotebookPen, LucideLibraryBig } from 'lucide-react'
import { useCurrentConversationByNote, useNotes, useCurrentNote } from '@/hooks/use-note'
import { useKnowledgeItems } from '@/hooks/use-knowledge'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ISource } from '@/types'
import { useConversationSettingsById } from '@/hooks/use-conversation'

export default function InspectorSource() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: currentNote } = useCurrentNote()
  const { data: notes } = useNotes()
  const { data: knowledgeItems } = useKnowledgeItems()
  const currentConversation = useCurrentConversationByNote()
  const { setKnowledgeIds, setNoteIds, note_ids, knowledge_ids } = useConversationSettingsById({
    id: currentConversation?.id,
  })

  const sourceNotes = useMemo(
    () =>
      notes?.map((note) => ({
        id: note.id,
        type: 'note' as const,
        title: note.title || t('sidebar.newNote'),
        isCurrent: note.id === currentNote?.id || false,
        selected: note_ids.includes(note.id) || false,
      })) ?? [],
    [notes, note_ids, currentNote, t],
  )
  const sourceKnowledge = useMemo(
    () =>
      knowledgeItems?.map((knowledge) => ({
        id: knowledge.id,
        type: 'knowledge' as const,
        title: knowledge.title || t('sidebar.newKnowledge'),
        isCurrent: false,
        selected: knowledge_ids.includes(knowledge.id) || false,
      })) ?? [],
    [knowledgeItems, knowledge_ids, t],
  )

  const sources = useMemo(() => [...sourceNotes, ...sourceKnowledge], [sourceNotes, sourceKnowledge])

  const handleSelectSource = (source: ISource) => {
    if (source.isCurrent) return

    switch (source.type) {
      case 'note':
        setNoteIds(source.selected ? note_ids.filter((noteId) => noteId !== source.id) || [] : [...note_ids, source.id])
        break
      case 'knowledge':
        setKnowledgeIds(
          source.selected
            ? knowledge_ids.filter((knowledgeId) => knowledgeId !== source.id) || []
            : [...knowledge_ids, source.id],
        )
        break
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-start gap-2">
      {/* Add notes or knowledge bases */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="h-8 w-8 p-1">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={t('inspector.searchResources')} />
            <CommandList>
              {sources.length > 0 ? (
                <CommandGroup>
                  {sources.map((source) => (
                    <CommandItem key={source.id} value={source.id} disabled={source.isCurrent}>
                      <div className="flex w-full items-center gap-2" onClick={() => handleSelectSource(source)}>
                        <span className="flex items-center gap-1">
                          {source.type === 'note' && <LucideNotebookPen className="h-3 w-3" />}
                          {source.type === 'knowledge' && <LucideLibraryBig className="h-3 w-3" />}
                          {source.title}
                        </span>
                        {source.selected && <Check className="ml-auto h-3 w-3" />}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>{t('inspector.noResourcesFound')}</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Added notes or knowledge bases */}
      {sources
        .filter((source) => source.selected)
        .map((source, index) => (
          <Button key={index} variant="outline" className="h-8 max-w-full px-2">
            <div className="flex w-full items-center gap-1 font-normal">
              {source.type === 'note' && <LucideNotebookPen className="h-3 w-3 flex-none" />}
              {source.type === 'knowledge' && <LucideLibraryBig className="h-3 w-3 flex-none" />}
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{source.title}</span>
              {source.isCurrent && <span className="text-xs text-muted-foreground ">{t('inspector.currentNote')}</span>}
              {!source.isCurrent && <X className="h-3 w-3 flex-none" onClick={() => handleSelectSource(source)} />}
            </div>
          </Button>
        ))}
    </div>
  )
}
