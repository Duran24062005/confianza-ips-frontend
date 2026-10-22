import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Role } from '../../domain/models'

const demoAccounts: Record<Role, { email: string; label: string }> = {
  admin: { email: 'admin@confianza.demo', label: 'Administración' },
  receptionist: { email: 'recepcion@confianza.demo', label: 'Recepción' },
  doctor: { email: 'laura.medica@confianza.demo', label: 'Médico' },
  patient: { email: 'mariana.paciente@confianza.demo', label: 'Paciente' },
}

export function LoginScreen({ onSubmit, busy, error }: { onSubmit: (email: string, password: string) => void; busy: boolean; error: string }) {
  const [email, setEmail] = useState(demoAccounts.admin.email)
  const [password, setPassword] = useState('Confianza123!')
  function submit(event: FormEvent) { event.preventDefault(); onSubmit(email, password) }
  return (
    <main className="auth-page">
      <section className="auth-story"><div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" /><div className="auth-story-inner"><div className="brand-lockup brand-light"><span className="brand-symbol">c</span><span><strong>confianza</strong><small>IPS · operaciones</small></span></div><div className="auth-message"><p className="eyebrow">Sistema institucional</p><h1>El cuidado también necesita <em>orden.</em></h1><p>Una operación clara para que cada paciente, cada agenda y cada decisión tenga su lugar.</p></div><div className="auth-footnote"><span>Confianza IPS</span><span>Datos sintéticos para demostración</span></div></div></section>
      <section className="auth-panel"><div className="auth-card"><p className="eyebrow">Acceso seguro</p><h2>Bienvenido de nuevo</h2><p className="auth-intro">Ingresa a tu espacio de trabajo institucional.</p><form onSubmit={submit} className="form-stack"><label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary" disabled={busy}>{busy ? 'Validando' : 'Entrar al sistema'} <span>→</span></button></form><div className="demo-access"><p className="eyebrow">Acceso rápido de demo</p><div className="demo-buttons">{Object.entries(demoAccounts).map(([role, account]) => <button key={role} onClick={() => { setEmail(account.email); setPassword('Confianza123!') }}>{account.label}</button>)}</div></div><Link className="auth-docs-link" to="/docs">Leer la documentación de la API <span>↗</span></Link><p className="legal-note">Entorno ficticio para demostración. No contiene información médica real.</p></div></section>
    </main>
  )
}
