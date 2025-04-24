import { cn } from '@/lib/utils'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { IBaseOption } from '@/types'
interface ListSelectorProps {
  label: string | React.ReactNode
  options: IBaseOption[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  renderSuffixComponent?: (option: IBaseOption) => React.ReactNode
  renderAdditionalComponent?: () => React.ReactNode
  className?: string
}

export function ListSelector({
  label,
  options,
  defaultValue,
  value,
  onValueChange,
  renderSuffixComponent,
  renderAdditionalComponent,
  className,
}: ListSelectorProps) {
  const labelContent = typeof label === 'string' ? <Label htmlFor={label}>{label}</Label> : <div>{label}</div>
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {labelContent}
      <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <SelectItem key={option.id} value={option.id} disabled={option.disabled}>
                <span>{option.name}</span>
              </SelectItem>
              {renderSuffixComponent?.(option)}
            </div>
          ))}
          {renderAdditionalComponent?.()}
        </SelectContent>
      </Select>
    </div>
  )
}
