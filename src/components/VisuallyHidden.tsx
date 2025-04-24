import * as VisuallyHidden_ from '@radix-ui/react-visually-hidden'

export default function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <VisuallyHidden_.Root>{children}</VisuallyHidden_.Root>
}
