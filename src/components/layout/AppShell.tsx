import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { Role, User } from '../../domain/models'
import { roleLabel } from '../ui'

type NavItem = { path: string; label: string; icon: string; roles: Role[] }

const navItems: NavItem[] = [
  { path: '/app/resumen', label: 'Resumen', icon: '◈', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
  { path: '/app/pacientes', label: 'Pacientes', icon: '◎', roles: ['admin', 'receptionist'] },
  { path: '/app/agenda', label: 'Agenda', icon: '◷', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
  { path: '/app/historia', label: 'Historia clínica', icon: '⌁', roles: ['doctor', 'patient'] },
  { path: '/app/auditoria', label: 'Auditoría', icon: '≡', roles: ['admin'] },
]

export function AppShell({ user, children, onSignOut, error, onClearError }: { user: User; children: ReactNode; onSignOut: () => void; error: string; onClearError: () => void }) {
  const location = useLocation()
  const items = navItems.filter((item) => item.roles.includes(user.role))
  const active = items.find((item) => location.pathname.startsWith(item.path))
  const currentLabel = location.pathname.endsWith('/perfil') ? 'Mi perfil' : active?.label ?? 'Espacio de trabajo'
  return (
    <div className="product-shell">
      <aside className="app-sidebar">
        <Link to="/app/resumen" className="brand-lockup"><span className="brand-symbol">c</span><span><strong>confianza</strong><small>IPS · operaciones</small></span></Link>
        <div className="sidebar-context"><span className="status-indicator" /> Entorno de demostración</div>
        <nav className="app-nav" aria-label="Navegación principal">
          <p className="nav-section-label">Espacio de trabajo</p>
          {items.map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</NavLink>)}
          <p className="nav-section-label nav-section-spaced">Referencia</p>
          <Link to="/docs" className="app-nav-link"><span>⌘</span>Documentación API</Link>
        </nav>
        <div className="sidebar-footer"><p>Datos sintéticos<br /><small>No tienen validez clínica real.</small></p><button className="signout-link" onClick={onSignOut}>Cerrar sesión <span>↗</span></button></div>
      </aside>
      <main className="product-main">
        <header className="app-topbar">
          <div className="topbar-context"><span>Confianza IPS</span><b>/</b><strong>{currentLabel}</strong></div>
          <Link to="/app/perfil" className="profile-link"><span className="avatar-badge">{user.full_name.slice(0, 1).toUpperCase()}</span><span><strong>{user.full_name}</strong><small>{roleLabel(user.role)}</small></span><span className="profile-arrow">↗</span></Link>
        </header>
        <div className="mobile-nav-scroll">{items.map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>{item.label}</NavLink>)}</div>
        <div className="content-wrap">{children}</div>
        {error && <div className="toast" role="alert"><span>!</span>{error}<button onClick={onClearError} aria-label="Cerrar mensaje">×</button></div>}
      </main>
    </div>
  )
}
