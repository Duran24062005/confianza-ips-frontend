export type Role = 'admin' | 'receptionist' | 'doctor' | 'patient'

export type User = {
  id: number
  email: string
  full_name: string
  role: Role
  active: boolean
  patient_id: number | null
  doctor_id: number | null
}

export type Patient = {
  id: number
  document_type: string
  document_number: string
  first_name: string
  last_name: string
  birth_date: string
  email: string
  phone: string
  address: string
  city: string
  eps: string
  emergency_name: string
  emergency_phone: string
  active: boolean
  created_at: string
  updated_at: string
}

export type Doctor = {
  id: number
  license_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  active: boolean
}

export type Service = {
  id: number
  name: string
  description: string
  duration_minutes: number
  active: boolean
}

export type Site = {
  id: number
  name: string
  address: string
  city: string
  active: boolean
}

export type Appointment = {
  id: number
  patient_id: number
  doctor_id: number
  service_id: number
  site_id: number
  starts_at: string
  ends_at: string
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  reason: string
  created_at: string
}

export type ClinicalNote = {
  id: number
  encounter_id: number
  version: number
  note_type: string
  content: string
  supersedes_id: number | null
  created_by_user_id: number
  created_at: string
}

export type Dashboard = {
  active_patients: number
  inactive_patients: number
  active_doctors: number
  appointments_today: number
  pending_appointments: number
  confirmed_appointments: number
  cancelled_appointments: number
  upcoming_appointments: number
}

type LoginResponse = { access_token: string; token_type: string; expires_in: number }

let accessToken: string | null = null
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export function setAccessToken(token: string | null) {
  accessToken = token
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  const response = await fetch(`${apiBase}${path}`, { ...init, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(body?.detail || `La operación falló (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) => request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<User>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  dashboard: () => request<Dashboard>('/dashboard'),
  patients: (search = '') => request<Patient[]>(`/patients?active=true${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  createPatient: (payload: Omit<Patient, 'id' | 'active' | 'created_at' | 'updated_at'>) => request<Patient>('/patients', { method: 'POST', body: JSON.stringify(payload) }),
  doctors: () => request<Doctor[]>('/doctors'),
  services: () => request<Service[]>('/services'),
  sites: () => request<Site[]>('/sites'),
  appointments: () => request<Appointment[]>('/appointments'),
  createAppointment: (payload: { patient_id: number | null; doctor_id: number; service_id: number; site_id: number; starts_at: string; reason: string }) => request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  updateAppointmentStatus: (id: number, status: Appointment['status']) => request<Appointment>(`/appointments/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  audit: () => request<Array<{ id: number; action: string; resource_type: string; resource_id: string; created_at: string; actor_user_id: number | null }>>('/audit'),
  clinicalNotes: (patientId: number) => request<ClinicalNote[]>(`/clinical/patients/${patientId}`),
}
