/**
 * Consistent sticky page header used by all dashboard pages.
 * Replaces the per-page topbar div that was repeated everywhere.
 */
export default function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="topbar" style={{ padding:'18px 28px', flexShrink:0 }}>
      <div style={{ maxWidth:1280, margin:'0 auto',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
          {Icon && (
            <div style={{ width:38, height:38, borderRadius:10, flexShrink:0,
              background:'rgba(99,102,241,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon size={19} color="#6366F1" />
            </div>
          )}
          <div style={{ minWidth:0 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#0F172A', margin:0,
              fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.02em',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize:13, color:'#6B7280', margin:'2px 0 0',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
