import type {
  AccessTokenStore,
  ConfianzaApi,
  CreateAppointmentInput,
  CreatePatientInput,
} from '../application/ports'
import type {
  Appointment,
  AuditEvent,
  ClinicalNote,
  Dashboard,
  Doctor,
  LoginResponse,
  Patient,
  Service,
  Site,
  User,
} from '../domain/models'
import { HttpClient } from './http-client'

export class ConfianzaApiClient implements ConfianzaApi {
  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Promise<LoginResponse> {
    return this.http.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  me(): Promise<User> {
    return this.http.request('/auth/me')
  }

  logout(): Promise<{ message: string }> {
    return this.http.request('/auth/logout', { method: 'POST' })
  }

  dashboard(): Promise<Dashboard> {
    return this.http.request('/dashboard')
  }

  patients(search = ''): Promise<Patient[]> {
    const query = search ? `&search=${encodeURIComponent(search)}` : ''
    return this.http.request(`/patients?active=true${query}`)
  }

  createPatient(payload: CreatePatientInput): Promise<Patient> {
    return this.http.request('/patients', { method: 'POST', body: JSON.stringify(payload) })
  }

  doctors(): Promise<Doctor[]> {
    return this.http.request('/doctors')
  }

  services(): Promise<Service[]> {
    return this.http.request('/services')
  }

  sites(): Promise<Site[]> {
    return this.http.request('/sites')
  }

  appointments(): Promise<Appointment[]> {
    return this.http.request('/appointments')
  }

  createAppointment(payload: CreateAppointmentInput): Promise<Appointment> {
    return this.http.request('/appointments', { method: 'POST', body: JSON.stringify(payload) })
  }

  updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    return this.http.request(`/appointments/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
  }

  audit(): Promise<AuditEvent[]> {
    return this.http.request('/audit')
  }

  clinicalNotes(patientId: number): Promise<ClinicalNote[]> {
    return this.http.request(`/clinical/patients/${patientId}`)
  }
}

export function createConfianzaApi(baseUrl: string, tokenStore: AccessTokenStore): ConfianzaApi {
  return new ConfianzaApiClient(new HttpClient(baseUrl, tokenStore))
}
