import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Appointment, AvailabilitySlot, Doctor, Patient, Service, Site, User } from '../../domain/models'
import type { CreateAppointmentInput } from '../../application/ports'
import { api } from '../../infrastructure/composition'
import { EmptyState, ErrorState, formatDateTime, Modal, PageHeader, StatusBadge, statusLabels, statusTone } from '../../components/ui'

type AppointmentForm = {
  patient_id: string
  doctor_id: string
  service_id: string
  site_id: string
  date: string
  slot: string
  reason: string
}

type RescheduleForm = { date: string; slot: string; reason: string }

function dateInputValue(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

const emptyAppointmentForm = (): AppointmentForm => ({
  patient_id: '', doctor_id: '', service_id: '', site_id: '',
  date: dateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)), slot: '', reason: '',
})

function isOpenAppointment(status: Appointment['status']): boolean {
  return status === 'requested' || status === 'confirmed'
}

function slotLabel(slot: AvailabilitySlot): string {
  return formatDateTime(slot.starts_at)
}

export function AgendaPage({ user, onError }: { user: User; onError: (message: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [dialog, setDialog] = useState<'create' | 'reschedule' | 'cancel' | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [createForm, setCreateForm] = useState<AppointmentForm>(emptyAppointmentForm)
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({ date: dateInputValue(new Date()), slot: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availabilityError, setAvailabilityError] = useState('')

  const canManageRequests = user.role === 'admin' || user.role === 'receptionist'
  const canCreate = canManageRequests || user.role === 'patient'
  const canReschedule = canManageRequests || user.role === 'doctor' || user.role === 'patient'
  const canCancel = canManageRequests || user.role === 'patient'

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [nextAppointments, nextPatients, nextDoctors, nextServices, nextSites] = await Promise.all([
        api.appointments(),
        user.role === 'patient' ? Promise.resolve([]) : api.patients(),
        canCreate ? api.doctors() : Promise.resolve([]),
        canCreate ? api.services() : Promise.resolve([]),
        canCreate ? api.sites() : Promise.resolve([]),
      ])
      setAppointments(nextAppointments)
      setPatients(nextPatients)
      setDoctors(nextDoctors)
      setServices(nextServices)
      setSites(nextSites)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar la agenda')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [user.role])

  const availabilityRequest = useMemo(() => {
    if (dialog === 'create') return { doctorId: Number(createForm.doctor_id), serviceId: Number(createForm.service_id), date: createForm.date }
    if (dialog === 'reschedule' && editingAppointment) return { doctorId: editingAppointment.doctor_id, serviceId: editingAppointment.service_id, date: rescheduleForm.date }
    return null
  }, [createForm.date, createForm.doctor_id, createForm.service_id, dialog, editingAppointment, rescheduleForm.date])

  useEffect(() => {
    setAvailability([])
    setAvailabilityError('')
    if (!availabilityRequest || !availabilityRequest.doctorId || !availabilityRequest.serviceId || !availabilityRequest.date) {
      setLoadingAvailability(false)
      return
    }
    let current = true
    setLoadingAvailability(true)
    void api.availability(availabilityRequest.doctorId, availabilityRequest.serviceId, availabilityRequest.date)
      .then((slots) => { if (current) setAvailability(slots) })
      .catch((reason) => { if (current) setAvailabilityError(reason instanceof Error ? reason.message : 'No se pudo consultar la disponibilidad') })
      .finally(() => { if (current) setLoadingAvailability(false) })
    return () => { current = false }
  }, [availabilityRequest])

  function openCreate() {
    const next = emptyAppointmentForm()
    if (sites.length === 1) next.site_id = String(sites[0].id)
    setCreateForm(next)
    setAvailability([])
    setDialog('create')
  }

  function openReschedule(appointment: Appointment) {
    setEditingAppointment(appointment)
    setRescheduleForm({ date: dateInputValue(appointment.starts_at), slot: '', reason: '' })
    setAvailability([])
    setDialog('reschedule')
  }

  function closeDialog(force = false) {
    if (saving && !force) return
    setDialog(null)
    setEditingAppointment(null)
    setCancelTarget(null)
    setAvailability([])
    setAvailabilityError('')
  }

  function selectedSlot(): AvailabilitySlot | undefined {
    const value = dialog === 'create' ? createForm.slot : rescheduleForm.slot
    return availability.find((slot) => slot.starts_at === value)
  }

  async function createAppointment(event: FormEvent) {
    event.preventDefault()
    const slot = selectedSlot()
    if (!slot || !createForm.site_id) {
      onError('Selecciona una sede y un horario disponible antes de registrar la cita')
      return
    }
    setSaving(true)
    try {
      const payload: CreateAppointmentInput = {
        patient_id: createForm.patient_id ? Number(createForm.patient_id) : null,
        doctor_id: Number(createForm.doctor_id), service_id: Number(createForm.service_id), site_id: Number(createForm.site_id),
        starts_at: slot.starts_at, reason: createForm.reason,
      }
      await api.createAppointment(payload)
      closeDialog(true)
      await load()
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo crear la cita')
    } finally { setSaving(false) }
  }

  async function rescheduleAppointment(event: FormEvent) {
    event.preventDefault()
    const slot = selectedSlot()
    if (!editingAppointment || !slot) {
      onError('Selecciona un nuevo horario disponible antes de reprogramar la cita')
      return
    }
    setSaving(true)
    try {
      await api.rescheduleAppointment(editingAppointment.id, { starts_at: slot.starts_at, reason: rescheduleForm.reason })
      closeDialog(true)
      await load()
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo reprogramar la cita')
    } finally { setSaving(false) }
  }

  async function confirmCancellation() {
    if (!cancelTarget) return
    setSaving(true)
    try {
      await api.updateAppointmentStatus(cancelTarget.id, 'cancelled')
      closeDialog(true)
      await load()
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : 'No se pudo cancelar la cita')
    } finally { setSaving(false) }
  }

  async function changeStatus(id: number, status: Appointment['status']) {
    try {
      await api.updateAppointmentStatus(id, status)
      await load()
    } catch (reason) { onError(reason instanceof Error ? reason.message : 'No se pudo actualizar la cita') }
  }

  const people = useMemo(() => Object.fromEntries(patients.map((patient) => [patient.id, `${patient.first_name} ${patient.last_name}`])), [patients])
  const doctorsById = useMemo(() => Object.fromEntries(doctors.map((doctor) => [doctor.id, `Dr. ${doctor.first_name} ${doctor.last_name}`])), [doctors])

  return <>
    <PageHeader eyebrow="Coordinación clínica" title="Agenda" subtitle={user.role === 'patient' ? 'Tus citas y solicitudes activas.' : 'La jornada completa, sin cruces de horario.'} action={canCreate ? <button className="button button-primary" onClick={openCreate}>+ Nueva cita</button> : undefined} />
    {error ? <ErrorState message={error} onRetry={() => void load()} /> : <section className="agenda-layout">
      <div className="surface table-panel">
        <div className="table-toolbar"><div><p className="eyebrow">Citas registradas</p><h2>{loading ? 'Cargando agenda' : `${appointments.length} en la vista`}</h2></div><span className="panel-note">Persistencia activa</span></div>
        {loading ? <div className="table-skeleton" /> : <div className="table-scroll"><table><thead><tr><th>Fecha y hora</th><th>Paciente</th><th>Profesional</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}>
          <td><strong>{formatDateTime(appointment.starts_at)}</strong><small>{appointment.reason || 'Sin motivo registrado'}</small></td><td>{people[appointment.patient_id] || `Paciente #${appointment.patient_id}`}</td><td>{doctorsById[appointment.doctor_id] || `Profesional #${appointment.doctor_id}`}</td><td><StatusBadge label={statusLabels[appointment.status]} tone={statusTone(appointment.status)} /></td>
          <td><div className="agenda-actions">
            {appointment.status === 'requested' && canManageRequests && <button className="small-action" onClick={() => void changeStatus(appointment.id, 'confirmed')}>Confirmar</button>}
            {isOpenAppointment(appointment.status) && canReschedule && <button className="small-action" onClick={() => openReschedule(appointment)}>Reprogramar</button>}
            {isOpenAppointment(appointment.status) && canCancel && <button className="small-action danger" onClick={() => { setCancelTarget(appointment); setDialog('cancel') }}>Cancelar</button>}
            {appointment.status === 'confirmed' && user.role === 'doctor' && <button className="small-action" onClick={() => void changeStatus(appointment.id, 'completed')}>Completar</button>}
            {appointment.status === 'confirmed' && user.role === 'doctor' && <button className="small-action danger" onClick={() => void changeStatus(appointment.id, 'no_show')}>No asistió</button>}
            {!isOpenAppointment(appointment.status) && <span className="action-placeholder">Sin acciones</span>}
          </div></td>
        </tr>)}</tbody></table>{appointments.length === 0 && <EmptyState title="Agenda despejada" text="No hay citas registradas para esta vista." action={canCreate ? <button className="button button-secondary" onClick={openCreate}>Registrar la primera cita</button> : undefined} />}</div>}
      </div>
      <aside className="surface rule-panel"><p className="eyebrow">Reglas de agenda</p><h2>La disponibilidad nace de los datos.</h2><ul><li><span className="rule-icon">✓</span>Los horarios ocupados quedan protegidos.</li><li><span className="rule-icon">↗</span>Las solicitudes esperan confirmación.</li><li><span className="rule-icon">≡</span>Cada cambio queda en el historial.</li></ul><div className="rule-foot">Zona horaria institucional<strong>America / Bogotá</strong></div></aside>
    </section>}

    {dialog === 'create' && <Modal title="Programar una cita" onClose={closeDialog}><form className="modal-form" onSubmit={createAppointment}><div className="form-grid">
      {canManageRequests && <label>Paciente<select value={createForm.patient_id} onChange={(event) => setCreateForm({ ...createForm, patient_id: event.target.value })} required><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>)}</select></label>}
      <label>Profesional<select value={createForm.doctor_id} onChange={(event) => setCreateForm({ ...createForm, doctor_id: event.target.value, slot: '' })} required><option value="">Selecciona un médico</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>)}</select></label>
      <label>Servicio<select value={createForm.service_id} onChange={(event) => setCreateForm({ ...createForm, service_id: event.target.value, slot: '' })} required><option value="">Selecciona un servicio</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration_minutes} min</option>)}</select></label>
      <label>Sede<select value={createForm.site_id} onChange={(event) => setCreateForm({ ...createForm, site_id: event.target.value })} required><option value="">Selecciona una sede</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name} · {site.city}</option>)}</select></label>
      <label>Fecha<input type="date" min={dateInputValue(new Date())} value={createForm.date} onChange={(event) => setCreateForm({ ...createForm, date: event.target.value, slot: '' })} required /></label>
      <label>Horario disponible<select value={createForm.slot} onChange={(event) => setCreateForm({ ...createForm, slot: event.target.value })} disabled={!availabilityRequest?.doctorId || loadingAvailability || availability.length === 0} required><option value="">{loadingAvailability ? 'Consultando horarios…' : availability.length ? 'Selecciona un horario' : 'No hay horarios para esta selección'}</option>{availability.map((slot) => <option key={slot.starts_at} value={slot.starts_at}>{slotLabel(slot)}</option>)}</select></label>
      <label className="wide">Motivo de consulta<input value={createForm.reason} onChange={(event) => setCreateForm({ ...createForm, reason: event.target.value })} placeholder="Describe brevemente el motivo" /></label>
    </div>{availabilityError && <p className="form-error">{availabilityError}</p>}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => closeDialog()}>Cerrar</button><button className="button button-primary" disabled={saving || loadingAvailability}>{saving ? 'Registrando' : 'Registrar cita'}</button></div></form></Modal>}

    {dialog === 'reschedule' && editingAppointment && <Modal title="Reprogramar cita" onClose={closeDialog}><form className="modal-form" onSubmit={rescheduleAppointment}><p className="modal-context">Cita del {formatDateTime(editingAppointment.starts_at)}. Elige un nuevo horario que la agenda confirme como disponible.</p><div className="form-grid">
      <label>Nuevo día<input type="date" min={dateInputValue(new Date())} value={rescheduleForm.date} onChange={(event) => setRescheduleForm({ ...rescheduleForm, date: event.target.value, slot: '' })} required /></label>
      <label>Nuevo horario<select value={rescheduleForm.slot} onChange={(event) => setRescheduleForm({ ...rescheduleForm, slot: event.target.value })} disabled={loadingAvailability || availability.length === 0} required><option value="">{loadingAvailability ? 'Consultando horarios…' : availability.length ? 'Selecciona un horario' : 'No hay horarios para ese día'}</option>{availability.map((slot) => <option key={slot.starts_at} value={slot.starts_at}>{slotLabel(slot)}</option>)}</select></label>
      <label className="wide">Motivo del cambio<input value={rescheduleForm.reason} onChange={(event) => setRescheduleForm({ ...rescheduleForm, reason: event.target.value })} placeholder="Opcional" /></label>
    </div>{availabilityError && <p className="form-error">{availabilityError}</p>}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => closeDialog()}>Cerrar</button><button className="button button-primary" disabled={saving || loadingAvailability}>{saving ? 'Guardando' : 'Guardar cambio'}</button></div></form></Modal>}

    {dialog === 'cancel' && cancelTarget && <Modal title="Cancelar cita" onClose={closeDialog}><div className="confirmation-copy"><p>Se cancelará la cita del <strong>{formatDateTime(cancelTarget.starts_at)}</strong> para {people[cancelTarget.patient_id] || `Paciente #${cancelTarget.patient_id}`}.</p><p>La cita se conservará como cancelada en el historial institucional.</p></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => closeDialog()}>Conservar cita</button><button type="button" className="button button-danger" disabled={saving} onClick={() => void confirmCancellation()}>{saving ? 'Cancelando' : 'Cancelar cita'}</button></div></Modal>}
  </>
}
