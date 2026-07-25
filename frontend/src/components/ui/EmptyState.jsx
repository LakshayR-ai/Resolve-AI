import { cn } from '../../lib/cn'
import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted">
          <Icon size={22} className="text-accent opacity-70" />
        </div>
      )}
      {title && (
        <p className="font-display text-sm font-semibold text-fg">{title}</p>
      )}
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-fg-secondary">{description}</p>
      )}
      {(action || (actionLabel && onAction)) && (
        <div className="mt-5">
          {action ?? (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
