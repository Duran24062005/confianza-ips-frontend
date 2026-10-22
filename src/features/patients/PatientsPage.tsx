import { useEffect, useState, type FormEvent } from 'react'
import type { Patient } from '../../domain/models'
import { api } from '../../infrastructure/composition'
import { EmptyState, ErrorState, formatDate, Modal, PageHeader, StatusBadge } from '../../components/ui'

const emptyForm = { document_type: 'CC', document_number: '', first_name: '', last_name: '', birth_date: '1990-01-01', email: '', phone: '', address: '', city: 'Bogotá', eps: 'EPS Confianza Ficticia', emergency_name: '', emergency_phone: '' }

export function PatientsPage({ onError }: { onError: (message: string) => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  async function load() { setLoading(true); setError(''); try { setPatients(await api.patients(search)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los pacientes') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [search])
  async function save(event: FormEvent) { event.preventDefault(); setSaving(true); try { await api.createPatient(form); setShowForm(false); setForm(emptyForm); await load() } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudo registrar el paciente') } finally { setSaving(false) } }
  return <>
    <PageHeader eyebrow="Registro poblacional" title="Pacientes" subtitle="Busca, entiende y actualiza la información administrativa." action={<button className="button button-primary" onClick={() => setShowForm(true)}>+ Nuevo paciente</button>} />
    {error ? <ErrorState message={error} onRetry={() => void load()} /> : <section className="surface table-panel"><div className="table-toolbar"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o documento" aria-label="Buscar pacientes" /></label><span className="result-count">{loading ? 'Cargando' : `${patients.length} registros activos`}</span></div>{loading ? <div className="table-skeleton" /> : <div className="table-scroll"><table><thead><tr><th>Paciente</th><th>Documento</th><th>Contacto</th><th>EPS</th><th>Estado</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><div className="person-cell"><span className="table-avatar">{patient.first_name[0]}{patient.last_name[0]}</span><span><strong>{patient.first_name} {patient.last_name}</strong><small>Desde {formatDate(patient.created_at)}</small></span></div></td><td>{patient.document_type} · {patient.document_number}</td><td><strong>{patient.phone}</strong><small>{patient.email}</small></td><td>{patient.eps}</td><td><StatusBadge label={patient.active ? 'Activo' : 'Inactivo'} tone={patient.active ? 'success' : 'muted'} /></td></tr>)}</tbody></table>{patients.length === 0 && <EmptyState title="No encontramos pacientes" text="Prueba otra búsqueda o registra un nuevo paciente." />}</div>}</section>}
    {showForm && <Modal title="Registrar paciente" onClose={() => setShowForm(false)}><form className="modal-form" onSubmit={save}><div className="form-grid">{[['document_type', 'Tipo'], ['document_number', 'Número de documento'], ['first_name', 'Nombres'], ['last_name', 'Apellidos'], ['birth_date', 'Fecha de nacimiento'], ['city', 'Ciudad'], ['email', 'Correo electrónico'], ['phone', 'Teléfono'], ['address', 'Dirección'], ['emergency_name', 'Contacto de emergencia'], ['emergency_phone', 'Teléfono de emergencia']].map(([key, label]) => <label key={key}>{label}<input type={key === 'email' ? 'email' : key === 'birth_date' ? 'date' : 'text'} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required /></label>)}</div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Guardando' : 'Guardar paciente'}</button></div></form></Modal>}
  </>
}
