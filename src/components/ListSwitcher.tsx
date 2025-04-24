import React from 'react'
import { Switch } from './ui/switch'
import { IBaseCheckOption } from '@/types'

interface ListSwitcherProps {
  items: IBaseCheckOption[]
  onChange: (items: IBaseCheckOption[]) => void
}

export const ListSwitcher: React.FC<ListSwitcherProps> = ({ items, onChange }) => {
  const onCheckedChange = (item: IBaseCheckOption, checked: boolean) => {
    const newItems = items.map((i) => ({ ...i, checked: i.id === item.id ? checked : i.checked }))
    onChange(newItems)
  }
  return (
    <>
      {items?.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-4">
          <div className="flex flex-col items-start justify-between gap-1 overflow-hidden">
            <div className="line-clamp-1">{item.name}</div>
            <div className="line-clamp-1 text-muted-foreground">{item.description}</div>
          </div>
          <Switch checked={item.checked} onCheckedChange={(checked) => onCheckedChange(item, checked)} />
        </div>
      ))}
    </>
  )
}
