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

export type PatientRegistrationInput = Omit<Patient, 'id' | 'active' | 'created_at' | 'updated_at'> & {
  password: string
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

export type AvailabilitySlot = {
  starts_at: string
  ends_at: string
  doctor_id: number
  service_id: number
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

export type DashboardPeriod = {
  days: number
  start: string
  end: string
  timezone: 'America/Bogota'
}

export type DashboardSummary = {
  active_patients: number | null
  active_doctors: number | null
  appointments_today: number
  upcoming_appointments: number
  pending_appointments: number
  confirmed_appointments: number
  completed_appointments: number
  cancelled_appointments: number
  no_show_appointments: number
  attendance_rate: number | null
}

export type DashboardTrendPoint = {
  date: string
  total: number
  requested: number
  confirmed: number
  completed: number
  cancelled: number
  no_show: number
}

export type DashboardAnalytics = {
  scope: 'global' | 'doctor' | 'patient'
  period: DashboardPeriod
  summary: DashboardSummary
  trend: DashboardTrendPoint[]
  status_breakdown: Array<{ status: AppointmentStatus; count: number }>
  service_breakdown: Array<{ service_id: number; service_name: string; count: number }>
}

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type AgentActivationCode = {
  code: string
  expires_at: string
  expires_in: number
  single_use: boolean
}

export type AuditEvent = {
  id: number
  action: string
  resource_type: string
  resource_id: string
  created_at: string
  actor_user_id: number | null
}
