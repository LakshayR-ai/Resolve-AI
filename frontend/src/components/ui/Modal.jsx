import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import Button from './Button'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
  className,
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[200]">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={cn(
                'w-full rounded-2xl border border-border bg-surface-raised p-6 shadow-lg',
                'animate-[scaleIn_0.2s_ease-out]',
                sizes[size],
                className,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <DialogTitle className="font-display text-base font-semibold text-fg">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-fg-secondary">{description}</p>
                  )}
                </div>
                {showClose && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="shrink-0 -mr-1 -mt-1"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>

              {children && <div className="mt-5">{children}</div>}

              {footer && (
                <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </>
      }
    />
  )
}
