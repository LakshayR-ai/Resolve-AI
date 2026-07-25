import { cn } from '../../lib/cn'

export default function Skeleton({ className, rounded = 'md', ...props }) {
  const radius = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn('skeleton', radius[rounded], className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}
