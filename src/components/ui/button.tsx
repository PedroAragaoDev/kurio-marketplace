// Adapted from shadcn/ui Button (MIT), with project variants and no cva dependency.
import { Slot } from '@radix-ui/react-slot'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

export function Button({ className, variant = 'default', asChild = false, type = 'button', ...props }: ComponentProps<'button'> & { variant?: 'default' | 'outline' | 'ghost'; asChild?: boolean }) {
  const Component = asChild ? Slot : 'button'
  return <Component type={asChild ? undefined : type} className={cn('button inline-flex items-center justify-center gap-2 disabled:opacity-50', `button-${variant}`, className)} {...props} />
}
