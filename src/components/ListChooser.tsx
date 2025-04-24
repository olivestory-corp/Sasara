import { Loader2, MoveRight } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'

interface ListChooserProps {
  label: string
  defaultValue?: string
  value?: string
  onChoose?: () => void
}
export function ListChooser({ label, defaultValue, value, onChoose }: ListChooserProps) {
  const isPendingCreateVectorsByLocalFolderPath = false
  return (
    <div className="flex items-center justify-between gap-2 overflow-hidden">
      <Label htmlFor="folder" className="whitespace-nowrap">
        {label}
      </Label>
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        <Label htmlFor="address" className="flex-1 overflow-hidden break-words text-xs text-gray-500">
          {value || defaultValue}
        </Label>
        <Button variant="ghost" size="icon" onClick={onChoose} disabled={isPendingCreateVectorsByLocalFolderPath}>
          <MoveRight className="h-4 w-4" />
          {isPendingCreateVectorsByLocalFolderPath && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </div>
  )
}
