// Adapted from shadcn/ui Dialog (MIT). Radix manages focus, Escape, and restoration.
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'

export function Modal({ title, description, trigger, children, open, onOpenChange, drawer = false, onCloseAutoFocus }: {
  title: string; description: string; trigger?: ReactNode; children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; drawer?: boolean; onCloseAutoFocus?: Dialog.DialogContentProps['onCloseAutoFocus']
}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
    <Dialog.Portal><Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className={`dialog-content ${drawer ? 'drawer' : ''}`} onCloseAutoFocus={onCloseAutoFocus}>
        <Dialog.Title>{title}</Dialog.Title><Dialog.Description className="muted">{description}</Dialog.Description>
        <Dialog.Close asChild><Button variant="ghost" className="dialog-close" aria-label="Fechar"><X size={18} /></Button></Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
