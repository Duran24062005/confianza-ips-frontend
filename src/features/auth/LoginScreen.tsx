import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { PatientRegistrationInput, Role } from '../../domain/models'

const demoAccounts: Record<Role, { email: string; label: string }> = {
  admin: { email: 'admin@confianza.demo', label: 'Administración' },
  receptionist: { email: 'recepcion@confianza.demo', label: 'Recepción' },
  doctor: { email: 'laura.medica@confianza.demo', label: 'Médico' },
  patient: { email: 'mariana.paciente@confianza.demo', label: 'Paciente' },
}

const emptyRegistration: PatientRegistrationInput = {
  document_type: 'CC', document_number: '', first_name: '', last_name: '', birth_date: '',
  email: '', phone: '', address: '', city: 'Bogotá', eps: 'EPS Confianza Ficticia',
  emergency_name: '', emergency_phone: '', password: '',
}

type LoginScreenProps = {
  onSubmit: (email: string, password: string) => void
  onRegister: (payload: PatientRegistrationInput) => void
  busy: boolean
  error: string
}

export function LoginScreen({ onSubmit, onRegister, busy, error }: LoginScreenProps) {
  const location = useLocation()
  const [registering, setRegistering] = useState(() => new URLSearchParams(location.search).get('mode') === 'register')
  const [email, setEmail] = useState(demoAccounts.admin.email)
  const [password, setPassword] = useState('Confianza123!')
  const [registration, setRegistration] = useState(emptyRegistration)
  const [confirmation, setConfirmation] = useState('')
  const [localError, setLocalError] = useState('')

  function updateRegistration<Key extends keyof PatientRegistrationInput>(key: Key, value: PatientRegistrationInput[Key]) {
    setRegistration((current) => ({ ...current, [key]: value }))
  }

  function showLogin() { setRegistering(false); setLocalError('') }
  function showRegistration() { setRegistering(true); setLocalError('') }
  function submitLogin(event: FormEvent) { event.preventDefault(); onSubmit(email, password) }
  function submitRegistration(event: FormEvent) {
    event.preventDefault()
    if (registration.password !== confirmation) { setLocalError('Las contraseñas no coinciden'); return }
    setLocalError('')
    onRegister(registration)
  }

  const visibleError = localError || error

  return (
    <main className="auth-page">
      <section className="auth-story"><div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" /><div className="auth-story-inner"><div className="brand-lockup brand-light"><span className="brand-symbol brand-symbol-image"><img src="/brand/confianza-symbol.png" alt="" /></span><span><strong>confianza</strong><small>IPS · operaciones</small></span></div><div className="auth-message"><p className="eyebrow">Sistema institucional</p><h1>El cuidado también necesita <em>orden.</em></h1><p>Una operación clara para que cada paciente, cada agenda y cada decisión tenga su lugar.</p></div><div className="auth-footnote"><span>Confianza IPS</span><span>Datos sintéticos para demostración</span></div></div></section>
      <section className="auth-panel"><div className="auth-card">
        {registering ? <>
          <p className="eyebrow">Cuenta de paciente</p><h2>Crea tu cuenta</h2><p className="auth-intro">Registra datos ficticios para probar el recorrido del paciente y la activación del agente.</p>
          <form onSubmit={submitRegistration} className="form-stack">
            <div className="auth-form-grid">
              <label>Tipo de documento<select value={registration.document_type} onChange={(event) => updateRegistration('document_type', event.target.value)}><option value="CC">CC</option><option value="CE">CE</option><option value="TI">TI</option><option value="PP">PP</option></select></label>
              <label>Número de documento<input value={registration.document_number} onChange={(event) => updateRegistration('document_number', event.target.value)} required minLength={3} maxLength={40} /></label>
              <label>Nombres<input value={registration.first_name} onChange={(event) => updateRegistration('first_name', event.target.value)} required minLength={2} maxLength={80} /></label>
              <label>Apellidos<input value={registration.last_name} onChange={(event) => updateRegistration('last_name', event.target.value)} required minLength={2} maxLength={80} /></label>
              <label>Fecha de nacimiento<input type="date" value={registration.birth_date} onChange={(event) => updateRegistration('birth_date', event.target.value)} required /></label>
              <label>Ciudad<input value={registration.city} onChange={(event) => updateRegistration('city', event.target.value)} required minLength={2} maxLength={100} /></label>
              <label className="auth-wide">Correo electrónico<input type="email" value={registration.email} onChange={(event) => updateRegistration('email', event.target.value)} required /></label>
              <label>Teléfono<input value={registration.phone} onChange={(event) => updateRegistration('phone', event.target.value)} required minLength={7} maxLength={40} /></label>
              <label>EPS<input value={registration.eps} onChange={(event) => updateRegistration('eps', event.target.value)} required minLength={2} maxLength={120} /></label>
              <label className="auth-wide">Dirección<input value={registration.address} onChange={(event) => updateRegistration('address', event.target.value)} required minLength={3} maxLength={240} /></label>
              <label>Contacto de emergencia<input value={registration.emergency_name} onChange={(event) => updateRegistration('emergency_name', event.target.value)} required minLength={2} maxLength={160} /></label>
              <label>Teléfono de emergencia<input value={registration.emergency_phone} onChange={(event) => updateRegistration('emergency_phone', event.target.value)} required minLength={7} maxLength={40} /></label>
              <label>Contraseña<input type="password" value={registration.password} onChange={(event) => updateRegistration('password', event.target.value)} required minLength={8} /></label>
              <label>Confirmar contraseña<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} /></label>
            </div>
            {visibleError && <div className="form-error" role="alert">{visibleError}</div>}
            <button className="button button-primary" disabled={busy}>{busy ? 'Creando cuenta' : 'Crear cuenta de paciente'} <span>→</span></button>
          </form>
          <button type="button" className="auth-switch" onClick={showLogin}>¿Ya tienes cuenta? Inicia sesión</button>
        </> : <>
          <p className="eyebrow">Acceso seguro</p><h2>Bienvenido de nuevo</h2><p className="auth-intro">Ingresa a tu espacio de trabajo institucional.</p>
          <form onSubmit={submitLogin} className="form-stack"><label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>{visibleError && <div className="form-error" role="alert">{visibleError}</div>}<button className="button button-primary" disabled={busy}>{busy ? 'Validando' : 'Entrar al sistema'} <span>→</span></button></form>
          <button type="button" className="auth-switch" onClick={showRegistration}>¿Eres paciente nuevo? Crea tu cuenta</button>
          <div className="demo-access"><p className="eyebrow">Acceso rápido de demo</p><div className="demo-buttons">{Object.entries(demoAccounts).map(([role, account]) => <button type="button" key={role} onClick={() => { setEmail(account.email); setPassword('Confianza123!') }}>{account.label}</button>)}</div></div>
        </>}
        <Link className="auth-docs-link" to="/docs">Leer la documentación de la API <span>↗</span></Link><p className="legal-note">Entorno ficticio para demostración. No contiene información médica real.</p>
      </div></section>
    </main>
  )
}
