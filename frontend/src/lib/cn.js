import clsx from 'clsx'

/** Merge class names — lightweight helper for conditional Tailwind classes. */
export function cn(...inputs) {
  return clsx(inputs)
}
