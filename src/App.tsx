import * as React from 'react'
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { authenticationService, api } from './infrastructure/composition'
import type { Appointment, Dashboard, Doctor, Patient, Role, Service, Site, User } from './domain/models'

type View = 'overview' | 'patients' | 'agenda' | 'clinical' | 'audit'

const demoAccounts: Record<Role, { email: string; label: string }> = {
  admin: { email: 'admin@confianza.demo', label: 'Administración' },
  receptionist: { email: 'recepcion@confianza.demo', label: 'Recepción' },
  doctor: { email: 'laura.medica@confianza.demo', label: 'Médico' },
  patient: { email: 'mariana.paciente@confianza.demo', label: 'Paciente' },
}

const roleLabels: Record<Role, string> = {
  admin: 'Administración', receptionist: 'Recepción', doctor: 'Equipo médico', patient: 'Paciente',
}

const statusLabels: Record<Appointment['status'], string> = {
  requested: 'Solicitada', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada', no_show: 'No asistió',
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<View>('overview')
  const [booting, setBooting] = useState(false)
  const [error, setError] = useState('')

  async function signIn(email: string, password: string) {
    setBooting(true)
    setError('')
    try {
      setUser(await authenticationService.signIn(email, password))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible iniciar sesión')
    } finally {
      setBooting(false)
    }
  }

  async function signOut() {
    try { await authenticationService.signOut() } catch { /* La sesión local se limpia aunque el servidor no responda. */ }
    setUser(null)
    setView('overview')
  }

  if (!user) return <LoginScreen onSubmit={signIn} busy={booting} error={error} />

  const canSeeDashboard = user.role === 'admin' || user.role === 'receptionist'
  const availableViews: View[] = canSeeDashboard ? ['overview', 'patients', 'agenda', 'audit'] : ['agenda', 'clinical']

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><span>c</span><div><strong>confianza</strong><small>IPS · operaciones</small></div></div>
        <div className="sidebar-rule" />
        <p className="eyebrow">Espacio de trabajo</p>
        <nav className="main-nav" aria-label="Navegación principal">
          {availableViews.map((item) => (
            <button className={view === item ? 'nav-item active' : 'nav-item'} key={item} onClick={() => setView(item)}>
              <span className="nav-icon">{item === 'overview' ? '◈' : item === 'patients' ? '◎' : item === 'agenda' ? '◷' : item === 'clinical' ? '⌁' : '≡'}</span>
              {item === 'overview' ? 'Resumen' : item === 'patients' ? 'Pacientes' : item === 'agenda' ? 'Agenda' : item === 'clinical' ? 'Historia' : 'Auditoría'}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note"><span className="pulse-dot" /> Datos de demostración<br /><small>Sin validez clínica real</small></div>
          <button className="logout-button" onClick={signOut}>Cerrar sesión <span>↗</span></button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div><span className="crumb">Confianza / </span><span>{view === 'overview' ? 'Resumen operativo' : view === 'patients' ? 'Pacientes' : view === 'agenda' ? 'Agenda clínica' : view === 'clinical' ? 'Historia clínica simulada' : 'Registro de auditoría'}</span></div>
          <div className="profile-chip"><span className="avatar">{user.full_name.slice(0, 1)}</span><span><strong>{user.full_name}</strong><small>{roleLabels[user.role]}</small></span><span className="chevron">⌄</span></div>
        </header>
        <div className="content-wrap">
          {view === 'overview' && canSeeDashboard && <Overview onError={setError} />}
          {view === 'patients' && canSeeDashboard && <Patients onError={setError} />}
          {view === 'agenda' && <Agenda user={user} onError={setError} />}
          {view === 'clinical' && <Clinical user={user} onError={setError} />}
          {view === 'audit' && canSeeDashboard && <Audit onError={setError} />}
          {error && <div className="toast error" role="alert"><span>!</span>{error}<button onClick={() => setError('')}>×</button></div>}
        </div>
      </main>
    </div>
  )
}

function LoginScreen({ onSubmit, busy, error }: { onSubmit: (email: string, password: string) => void; busy: boolean; error: string }) {
  const [email, setEmail] = useState(demoAccounts.admin.email)
  const [password, setPassword] = useState('Confianza123!')
  function submit(event: FormEvent) { event.preventDefault(); onSubmit(email, password) }
  return (
    <main className="login-page">
      <section className="login-story"><div className="story-grid" /><div className="story-content"><div className="brand-mark light"><span>c</span><div><strong>confianza</strong><small>IPS · operaciones</small></div></div><p className="eyebrow">Sistema institucional</p><h1>El cuidado también necesita <em>orden.</em></h1><p className="story-copy">Una operación clara para que cada paciente, cada agenda y cada decisión tenga su lugar.</p><div className="story-footer"><span>01</span><div /><span>Bogotá · Colombia</span></div></div></section>
      <section className="login-panel"><div className="login-card"><p className="eyebrow">Acceso seguro</p><h2>Bienvenido de nuevo</h2><p className="muted">Ingresa a tu espacio de trabajo institucional.</p><form onSubmit={submit} className="stack-form"><label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button" disabled={busy}>{busy ? 'Validando…' : 'Entrar al sistema'} <span>→</span></button></form><div className="demo-access"><span className="eyebrow">Acceso rápido de demo</span><div className="demo-buttons">{Object.entries(demoAccounts).map(([role, account]) => <button key={role} onClick={() => { setEmail(account.email); setPassword('Confianza123!') }}>{account.label}</button>)}</div></div><p className="legal-note">Entorno ficticio para demostración. No contiene información médica real.</p></div></section>
    </main>
  )
}

function Overview({ onError }: { onError: (message: string) => void }) {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.dashboard().then(setData).catch((reason) => onError(reason instanceof Error ? reason.message : 'No se pudo cargar el dashboard')).finally(() => setLoading(false)) }, [onError])
  const metrics = data ? [
    { label: 'Pacientes activos', value: data.active_patients, note: `${data.inactive_patients} inactivos`, tone: 'teal' },
    { label: 'Citas para hoy', value: data.appointments_today, note: `${data.confirmed_appointments} confirmadas`, tone: 'blue' },
    { label: 'Pendientes de confirmar', value: data.pending_appointments, note: 'Requieren atención', tone: 'amber' },
    { label: 'Próximas atenciones', value: data.upcoming_appointments, note: 'Agenda vigente', tone: 'ink' },
  ] : []
  return <><PageIntro eyebrow="Miércoles · 22 octubre 2026" title="Resumen operativo" subtitle="La sede central, vista en un solo pulso." action={<span className="live-label"><i /> Sistema operativo</span>} />{loading ? <Loading /> : <><div className="metric-grid">{metrics.map((metric) => <article className={`metric-card ${metric.tone}`} key={metric.label}><span className="metric-label">{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small><span className="metric-glyph">{metric.tone === 'amber' ? '!' : '↗'}</span></article>)}</div><section className="dashboard-lower"><div className="panel-card signal-card"><div className="panel-heading"><div><p className="eyebrow">Lectura del día</p><h3>Actividad de la sede</h3></div><span className="date-tag">Hoy</span></div><div className="activity-bars"><div style={{ '--height': '64%' } as React.CSSProperties}><span>Pacientes</span></div><div style={{ '--height': '42%' } as React.CSSProperties}><span>Citas</span></div><div style={{ '--height': '78%' } as React.CSSProperties}><span>Confirmadas</span></div><div style={{ '--height': '26%' } as React.CSSProperties}><span>Canceladas</span></div><div style={{ '--height': '55%' } as React.CSSProperties}><span>Atenciones</span></div></div><div className="bar-axis"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span></div></div><div className="panel-card brief-card"><p className="eyebrow">Nota de operación</p><h3>La agenda pide precisión.</h3><p>Revisa las solicitudes pendientes antes de abrir nuevos bloques de atención.</p><button className="text-button">Ir a la agenda <span>→</span></button></div></section></>}</>
}

function Patients({ onError }: { onError: (message: string) => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ document_type: 'CC', document_number: '', first_name: '', last_name: '', birth_date: '1990-01-01', email: '', phone: '', address: '', city: 'Bogotá', eps: 'EPS Confianza Ficticia', emergency_name: '', emergency_phone: '' })
  async function load() { try { setPatients(await api.patients(search)) } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudieron cargar los pacientes') } }
  useEffect(() => { void load() }, [search])
  async function save(event: FormEvent) { event.preventDefault(); setSaving(true); try { await api.createPatient(form); setShowForm(false); setForm({ ...form, document_number: '', first_name: '', last_name: '', email: '', phone: '', address: '', emergency_name: '', emergency_phone: '' }); await load() } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudo registrar el paciente') } finally { setSaving(false) } }
  return <><PageIntro eyebrow="Registro poblacional" title="Pacientes" subtitle="Busca, entiende y actualiza la información administrativa." action={<button className="primary-button compact" onClick={() => setShowForm(true)}>＋ Nuevo paciente</button>} /><section className="panel-card table-panel"><div className="table-toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o documento" /></div><span className="result-count">{patients.length} registros activos</span></div><div className="table-scroll"><table><thead><tr><th>Paciente</th><th>Documento</th><th>Contacto</th><th>EPS</th><th>Estado</th><th /></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><div className="person-cell"><span className="table-avatar">{patient.first_name[0]}{patient.last_name[0]}</span><span><strong>{patient.first_name} {patient.last_name}</strong><small>Desde {formatDate(patient.created_at)}</small></span></div></td><td>{patient.document_type} · {patient.document_number}</td><td><strong>{patient.phone}</strong><small>{patient.email}</small></td><td>{patient.eps}</td><td><StatusPill label={patient.active ? 'Activo' : 'Inactivo'} tone={patient.active ? 'success' : 'muted'} /></td><td><button className="icon-button" aria-label={`Abrir ${patient.first_name}`}>···</button></td></tr>)}</tbody></table>{patients.length === 0 && <EmptyState title="No encontramos pacientes" text="Prueba otra búsqueda o registra un nuevo paciente." />}</div></section>{showForm && <Modal title="Registrar paciente" onClose={() => setShowForm(false)}><form className="modal-form" onSubmit={save}><div className="form-grid"><label>Tipo<input value={form.document_type} onChange={(event) => setForm({ ...form, document_type: event.target.value })} required /></label><label>Número de documento<input value={form.document_number} onChange={(event) => setForm({ ...form, document_number: event.target.value })} required /></label><label>Nombres<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label><label>Apellidos<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label><label>Fecha de nacimiento<input type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} required /></label><label>Ciudad<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required /></label><label className="wide">Correo electrónico<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Teléfono<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label><label>Dirección<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required /></label><label>Contacto de emergencia<input value={form.emergency_name} onChange={(event) => setForm({ ...form, emergency_name: event.target.value })} required /></label><label>Teléfono de emergencia<input value={form.emergency_phone} onChange={(event) => setForm({ ...form, emergency_phone: event.target.value })} required /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar paciente'}</button></div></form></Modal>}</>
}

function Agenda({ user, onError }: { user: User; onError: (message: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', service_id: '', site_id: '', date: '', time: '08:00', reason: '' })
  async function load() { try { const result = await Promise.all([api.appointments(), user.role === 'patient' ? Promise.resolve([]) : api.patients(), user.role === 'patient' ? Promise.resolve([]) : api.doctors(), user.role === 'patient' ? Promise.resolve([]) : api.services(), user.role === 'patient' ? Promise.resolve([]) : api.sites()]); setAppointments(result[0]); setPatients(result[1]); setDoctors(result[2]); setServices(result[3]); setSites(result[4]) } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudo cargar la agenda') } }
  useEffect(() => { void load() }, [user.role])
  async function createAppointment(event: FormEvent) { event.preventDefault(); setSaving(true); try { await api.createAppointment({ patient_id: form.patient_id ? Number(form.patient_id) : null, doctor_id: Number(form.doctor_id), service_id: Number(form.service_id), site_id: Number(form.site_id), starts_at: new Date(`${form.date}T${form.time}:00`).toISOString(), reason: form.reason }); setShowForm(false); await load() } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudo crear la cita') } finally { setSaving(false) } }
  async function changeStatus(id: number, status: Appointment['status']) { try { await api.updateAppointmentStatus(id, status); await load() } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudo actualizar la cita') } }
  const people = useMemo(() => Object.fromEntries(patients.map((patient) => [patient.id, `${patient.first_name} ${patient.last_name}`])), [patients])
  const doctorsById = useMemo(() => Object.fromEntries(doctors.map((doctor) => [doctor.id, `Dr. ${doctor.first_name} ${doctor.last_name}`])), [doctors])
  return <><PageIntro eyebrow="Coordinación clínica" title="Agenda" subtitle={user.role === 'patient' ? 'Tus citas y solicitudes activas.' : 'La jornada completa, sin cruces de horario.'} action={user.role !== 'patient' ? <button className="primary-button compact" onClick={() => setShowForm(true)}>＋ Nueva cita</button> : undefined} /><section className="agenda-layout"><div className="panel-card table-panel"><div className="table-toolbar"><div><p className="eyebrow">Citas registradas</p><h3>{appointments.length} en la vista</h3></div><span className="date-tag">Persistencia activa</span></div><div className="table-scroll"><table><thead><tr><th>Fecha y hora</th><th>Paciente</th><th>Profesional</th><th>Estado</th><th /></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td><strong>{formatDateTime(appointment.starts_at)}</strong><small>{appointment.reason || 'Sin motivo registrado'}</small></td><td>{people[appointment.patient_id] || `Paciente #${appointment.patient_id}`}</td><td>{doctorsById[appointment.doctor_id] || `Profesional #${appointment.doctor_id}`}</td><td><StatusPill label={statusLabels[appointment.status]} tone={appointment.status === 'confirmed' ? 'success' : appointment.status === 'requested' ? 'warning' : appointment.status === 'cancelled' ? 'muted' : 'info'} /></td><td>{appointment.status === 'requested' && user.role !== 'patient' && <button className="small-action" onClick={() => changeStatus(appointment.id, 'confirmed')}>Confirmar</button>}{appointment.status === 'confirmed' && <button className="small-action danger" onClick={() => changeStatus(appointment.id, 'cancelled')}>Cancelar</button>}</td></tr>)}</tbody></table>{appointments.length === 0 && <EmptyState title="Agenda despejada" text="No hay citas registradas para esta vista." />}</div></div><aside className="panel-card legend-card"><p className="eyebrow">Reglas de agenda</p><h3>La disponibilidad nace de los datos.</h3><ul><li><span className="legend-dot green" />Los horarios ocupados quedan protegidos.</li><li><span className="legend-dot amber" />Las solicitudes esperan confirmación.</li><li><span className="legend-dot blue" />Cada cambio queda en el historial.</li></ul><div className="legend-foot">Zona horaria institucional<br /><strong>America / Bogotá</strong></div></aside></section>{showForm && <Modal title="Programar una cita" onClose={() => setShowForm(false)}><form className="modal-form" onSubmit={createAppointment}><div className="form-grid"><label>Paciente<select value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} required><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>)}</select></label><label>Profesional<select value={form.doctor_id} onChange={(event) => setForm({ ...form, doctor_id: event.target.value })} required><option value="">Selecciona un médico</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>)}</select></label><label>Servicio<select value={form.service_id} onChange={(event) => setForm({ ...form, service_id: event.target.value })} required><option value="">Selecciona un servicio</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration_minutes} min</option>)}</select></label><label>Sede<select value={form.site_id} onChange={(event) => setForm({ ...form, site_id: event.target.value })} required><option value="">Selecciona una sede</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label><label>Fecha<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label><label>Hora<input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /></label><label className="wide">Motivo de consulta<input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Describe brevemente el motivo" /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Registrando…' : 'Registrar cita'}</button></div></form></Modal>}</>
}

function Audit({ onError }: { onError: (message: string) => void }) {
  const [events, setEvents] = useState<Array<{ id: number; action: string; resource_type: string; resource_id: string; created_at: string; actor_user_id: number | null }>>([])
  useEffect(() => { api.audit().then(setEvents).catch((reason) => onError(reason instanceof Error ? reason.message : 'No se pudo cargar la auditoría')) }, [onError])
  return <><PageIntro eyebrow="Trazabilidad institucional" title="Auditoría" subtitle="Una línea de tiempo de las operaciones importantes." /><section className="panel-card audit-panel"><div className="table-toolbar"><div><p className="eyebrow">Eventos recientes</p><h3>Registro persistido</h3></div><span className="date-tag">Solo administración</span></div><div className="audit-list">{events.map((event) => <div className="audit-row" key={event.id}><span className="audit-marker" /><div><strong>{event.action.replace('_', ' ')}</strong><span>{event.resource_type} · #{event.resource_id}</span></div><time>{formatDateTime(event.created_at)}</time></div>)}{events.length === 0 && <EmptyState title="Sin eventos todavía" text="Las operaciones relevantes aparecerán aquí." />}</div></section></>
}

function Clinical({ user, onError }: { user: User; onError: (message: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(user.patient_id)
  const [notes, setNotes] = useState<Array<{ id: number; version: number; note_type: string; content: string; created_at: string }>>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    api.appointments().then((items) => {
      setAppointments(items)
      if (!selectedPatient && items[0]) setSelectedPatient(items[0].patient_id)
    }).catch((reason) => onError(reason instanceof Error ? reason.message : 'No se pudieron cargar las atenciones'))
  }, [onError, selectedPatient])
  useEffect(() => {
    if (!selectedPatient) return
    setLoading(true)
    api.clinicalNotes(selectedPatient).then(setNotes).catch((reason) => onError(reason instanceof Error ? reason.message : 'No se pudo cargar la historia')).finally(() => setLoading(false))
  }, [onError, selectedPatient])
  const patientOptions = [...new Set(appointments.map((appointment) => appointment.patient_id))]
  return <><PageIntro eyebrow="Consulta autorizada" title="Historia clínica" subtitle="Notas de demostración asociadas a atenciones persistidas." /><section className="clinical-layout"><div className="panel-card clinical-selector"><p className="eyebrow">Paciente en consulta</p><select value={selectedPatient ?? ''} onChange={(event) => setSelectedPatient(Number(event.target.value))}><option value="">Selecciona un paciente</option>{patientOptions.map((patientId) => <option key={patientId} value={patientId}>Paciente #{patientId}</option>)}</select><div className="clinical-warning"><span>!</span><p>Este módulo contiene información sintética y no tiene validez clínica real.</p></div><div className="clinical-meta"><span>Acceso actual</span><strong>{roleLabels[user.role]}</strong></div></div><div className="panel-card notes-panel"><div className="table-toolbar"><div><p className="eyebrow">Registro evolutivo</p><h3>{notes.length} notas disponibles</h3></div><span className="date-tag">Solo lectura</span></div>{loading ? <Loading /> : notes.length === 0 ? <EmptyState title="Historia sin notas" text="Las atenciones completadas aparecerán aquí cuando el profesional las registre." /> : <div className="notes-list">{notes.map((note) => <article className="note-card" key={note.id}><div className="note-heading"><span className="status-pill info"><i />Versión {note.version}</span><time>{formatDateTime(note.created_at)}</time></div><p>{note.content}</p></article>)}</div>}</div></section></>
}

function PageIntro({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) { return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action}</div> }
function Loading() { return <div className="loading-state"><span className="spinner" /> Cargando información persistida…</div> }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="empty-state"><strong>{title}</strong><span>{text}</span></div> }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button><p className="eyebrow">Nueva operación</p><h2>{title}</h2>{children}</section></div> }
function StatusPill({ label, tone }: { label: string; tone: 'success' | 'warning' | 'muted' | 'info' }) { return <span className={`status-pill ${tone}`}><i />{label}</span> }
function formatDate(value: string) { return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }

export default App
