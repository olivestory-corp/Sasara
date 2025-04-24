import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const CustomSwitch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, leftIcon, rightIcon, ...props }, ref) => (
    <div className="relative inline-flex items-center">
      {leftIcon && (
        <div className="pointer-events-none absolute left-1 h-4 w-4 text-primary-foreground">{leftIcon}</div>
      )}
      {rightIcon && <div className="pointer-events-none absolute right-1 h-4 w-4 text-primary">{rightIcon}</div>}
      <SwitchPrimitives.Root
        className={cn(
          'peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
          className,
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background ring-1 ring-primary/20 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0',
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  ),
)
CustomSwitch.displayName = SwitchPrimitives.Root.displayName
