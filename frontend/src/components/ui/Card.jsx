import { cn } from '../../lib/cn'

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ className, padding = 'md', hover = false, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-raised shadow-xs',
        hover && 'transition-all duration-150 hover:border-border-strong hover:shadow-md',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border pb-4 mb-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('font-display text-sm font-semibold text-fg', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-fg-secondary', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export default Card
