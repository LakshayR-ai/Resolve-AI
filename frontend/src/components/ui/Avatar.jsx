import { cn } from '../../lib/cn'

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
}

export default function Avatar({ name, src, size = 'md', className, ...props }) {
  const initial = name?.[0]?.toUpperCase() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={cn(
          'rounded-full object-cover ring-2 ring-surface-raised',
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        'bg-accent font-semibold text-white',
        sizes[size],
        className,
      )}
      aria-hidden={!name}
      title={name}
      {...props}
    >
      {initial}
    </div>
  )
}
