import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const Input = forwardRef(function Input(
  { className, error, leftIcon, rightIcon, ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-surface-muted px-3.5 py-2.5 text-sm text-fg',
          'placeholder:text-fg-muted transition-all duration-150 outline-none',
          'focus:border-accent focus:bg-surface-raised focus:shadow-[var(--shadow-focus)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.2)]',
          !error && 'border-border',
          className,
        )}
        aria-invalid={error || undefined}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted">
          {rightIcon}
        </span>
      )}
    </div>
  )
})

export default Input
