import { useEffect, useState } from 'react'
import type { Appointment, User } from '../../domain/models'
import { api } from '../../infrastructure/composition'
import { EmptyState, ErrorState, formatDateTime, Loading, PageHeader } from '../../components/ui'

export function ClinicalPage({ user, onError }: { user: User; onError: (message: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(user.patient_id)
  const [notes, setNotes] = useState<Array<{ id: number; version: number; note_type: string; content: string; created_at: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { api.appointments().then((items) => { setAppointments(items); if (!selectedPatient && items[0]) setSelectedPatient(items[0].patient_id) }).catch((reason) => setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las atenciones')).finally(() => setLoading(false)) }, [selectedPatient])
  useEffect(() => { if (!selectedPatient) return; setLoading(true); api.clinicalNotes(selectedPatient).then(setNotes).catch((reason) => onError(reason instanceof Error ? reason.message : 'No se pudo cargar la historia')).finally(() => setLoading(false)) }, [selectedPatient, onError])
  const patientOptions = [...new Set(appointments.map((appointment) => appointment.patient_id))]
  return <><PageHeader eyebrow="Consulta autorizada" title="Historia clínica" subtitle="Notas de demostración asociadas a atenciones persistidas." />{error ? <ErrorState message={error} /> : <section className="clinical-layout"><div className="surface clinical-selector"><p className="eyebrow">Paciente en consulta</p><select value={selectedPatient ?? ''} onChange={(event) => setSelectedPatient(Number(event.target.value))}><option value="">Selecciona un paciente</option>{patientOptions.map((patientId) => <option key={patientId} value={patientId}>Paciente #{patientId}</option>)}</select><div className="clinical-warning"><span>!</span><p>Este módulo contiene información sintética y no tiene validez clínica real.</p></div><div className="clinical-meta"><span>Acceso actual</span><strong>{user.role === 'doctor' ? 'Equipo médico' : 'Paciente'}</strong></div></div><div className="surface notes-panel"><div className="table-toolbar"><div><p className="eyebrow">Registro evolutivo</p><h2>{notes.length} notas disponibles</h2></div><span className="panel-note">Solo lectura</span></div>{loading ? <Loading /> : notes.length === 0 ? <EmptyState title="Historia sin notas" text="Las atenciones completadas aparecerán aquí cuando el profesional las registre." /> : <div className="notes-list">{notes.map((note) => <article className="note-card" key={note.id}><div className="note-heading"><strong>Versión {note.version}</strong><time>{formatDateTime(note.created_at)}</time></div><p>{note.content}</p></article>)}</div>}</div></section>}</>
}
