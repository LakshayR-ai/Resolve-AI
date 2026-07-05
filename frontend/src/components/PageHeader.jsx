/**
 * Consistent top-of-page header used by every dashboard page.
 * Gives every screen the same professional banded header style.
 */
export default function PageHeader({ title, subtitle, actions, icon: Icon, iconColor = '#6C63FF', iconBg }) {
  return (
    <div className="page-header px-8 py-6 mb-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg || `${iconColor}18` }}>
              <Icon size={20} style={{ color: iconColor }} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
