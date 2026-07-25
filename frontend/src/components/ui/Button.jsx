import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const variants = {
  primary:
    'bg-accent text-white shadow-xs hover:bg-accent-hover active:scale-[0.98]',
  secondary:
    'bg-surface-raised text-fg border border-border shadow-xs hover:bg-surface-muted hover:border-border-strong',
  ghost:
    'bg-transparent text-fg-secondary hover:bg-surface-muted hover:text-fg',
  danger:
    'bg-danger-muted text-danger border border-danger/20 hover:bg-danger/10',
  outline:
    'bg-transparent text-fg border border-border hover:bg-surface-muted',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-lg',
  icon: 'h-9 w-9 p-0 rounded-lg',
  'icon-sm': 'h-8 w-8 p-0 rounded-md',
}

const Button = forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled,
    as: Component = 'button',
    children,
    ...props
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap',
        'transition-all duration-150 ease-out outline-none',
        'focus-visible:shadow-[var(--shadow-focus)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
})

export default Button
