import LogoLottie from '@/components/lottie/Logo'
import { Button } from '@/components/ui/button'
import { useCreateNote } from '@/hooks/use-note'
import { LucidePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EmptyNote() {
  const navigate = useNavigate()
  const { mutateAsync: handleCreateNote } = useCreateNote()

  const handleAdd = async () => {
    const newNote = await handleCreateNote()
    navigate(`/notes/${newNote.id}`)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-16">
      <div className="flex flex-col items-center gap-2">
        <LogoLottie className="h-20 w-20" />
        <p>Your thoughts, your space, your notes.</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleAdd}>
        <LucidePlus className="mr-2 h-4 w-4" />
        <span>Create New Note</span>
      </Button>
    </div>
  )
}
