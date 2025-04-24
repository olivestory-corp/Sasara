import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uuid() {
  return uuidv4()
}

// Compare versions, check if the first is less than the second, similar to semver.lt
export function compareVersionLt(v1: string, v2: string) {
  const v1Parts = v1.split('.')
  const v2Parts = v2.split('.')
  for (let i = 0; i < v1Parts.length; i++) {
    const v1Part = parseInt(v1Parts[i], 10)
    const v2Part = parseInt(v2Parts[i], 10)
    if (v1Part < v2Part) return true
    if (v1Part > v2Part) return false
  }
  return false
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// Use WeakMap as cache, when elements are garbage collected, the cache will be automatically cleared
const scrollParentCache = new WeakMap<HTMLElement, HTMLElement | null>()

export function getParentScrollElement(fromElement: HTMLElement): HTMLElement | null {
  // Check if it already exists in the cache
  if (scrollParentCache.has(fromElement)) {
    return scrollParentCache.get(fromElement) || null
  }

  const OVERFLOW_REGEX = /(auto|scroll|overlay)/

  const isScrollable = (element: HTMLElement): boolean => {
    const style = window.getComputedStyle(element)
    return OVERFLOW_REGEX.test(style.overflow + style.overflowY + style.overflowX)
  }

  let parent = fromElement.parentElement
  let result: HTMLElement | null = null

  while (parent) {
    if (parent === document.documentElement) {
      result = document.documentElement
      break
    }

    if (isScrollable(parent)) {
      result = parent
      break
    }

    parent = parent.parentElement
  }

  // Store result in cache
  scrollParentCache.set(fromElement, result)
  return result
}
