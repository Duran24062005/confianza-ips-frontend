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

export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export type Appointment = {
  id: number
  patient_id: number
  doctor_id: number
  service_id: number
  site_id: number
  starts_at: string
  ends_at: string
  status: AppointmentStatus
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

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type AuditEvent = {
  id: number
  action: string
  resource_type: string
  resource_id: string
  created_at: string
  actor_user_id: number | null
}
