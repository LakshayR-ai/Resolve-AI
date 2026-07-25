import { cn } from '../../lib/cn'

const variants = {
  default: 'bg-surface-muted text-fg-secondary',
  primary: 'bg-accent-muted text-accent-fg',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  outline: 'border border-border bg-surface-raised text-fg-secondary',
}

export default function Badge({ className, variant = 'default', dot, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-semibold leading-normal',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'primary' && 'bg-accent',
            (variant === 'default' || variant === 'outline') && 'bg-fg-muted',
          )}
        />
      )}
      {children}
    </span>
  )
}
