// Add theme colors here, name is unique identifier, label is display name
export const DEFAULT_BASE_COLOR = 'losangeles'

export const baseColors = [
  {
    name: DEFAULT_BASE_COLOR,
    label: 'Los Angeles',
  },
  {
    name: 'newyork',
    label: 'New York',
  },
  {
    name: 'shanghai',
    label: 'Shanghai',
  },
  {
    name: 'sanfrancisco',
    label: 'San Francisco',
  },
] as const

export type BaseColor = (typeof baseColors)[number]
