import { cn } from '../../lib/cn'
import Skeleton from './Skeleton'

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'accent',
  loading = false,
  className,
  onClick,
}) {
  const accents = {
    accent: 'text-accent bg-accent-muted',
    success: 'text-success bg-success-muted',
    warning: 'text-warning bg-warning-muted',
    danger: 'text-danger bg-danger-muted',
    neutral: 'text-fg-secondary bg-surface-muted',
  }

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-border bg-surface-raised p-5 text-left shadow-xs',
        'transition-all duration-150',
        onClick && 'cursor-pointer hover:border-border-strong hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              accents[accent] || accents.accent,
            )}
          >
            <Icon size={17} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : (
        <>
          <p className="font-display mt-3 text-2xl font-bold tracking-tight text-fg">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-fg-muted">{sub}</p>}
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-fg-secondary">
            {label}
          </p>
        </>
      )}
    </Wrapper>
  )
}
