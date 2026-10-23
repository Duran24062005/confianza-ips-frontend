import { describe, expect, it } from 'vitest'
import { endpointGuides, endpointOperationIds } from './endpoint-guides'

const currentBackendOperationIds = [
  'health_health_get', 'readiness_health_ready_get', 'login_api_v1_auth_login_post', 'me_api_v1_auth_me_get', 'update_me_api_v1_auth_me_patch', 'logout_api_v1_auth_logout_post',
  'list_patients_api_v1_patients_get', 'create_patient_api_v1_patients_post', 'get_my_patient_api_v1_patients_me_get', 'update_my_patient_api_v1_patients_me_patch',
  'get_patient_api_v1_patients__patient_id__get', 'update_patient_api_v1_patients__patient_id__put', 'change_patient_status_api_v1_patients__patient_id__status_patch',
  'list_sites_api_v1_sites_get', 'list_specialties_api_v1_specialties_get', 'create_specialty_api_v1_specialties_post', 'list_services_api_v1_services_get',
  'create_service_api_v1_services_post', 'list_doctors_api_v1_doctors_get', 'create_doctor_api_v1_doctors_post', 'change_doctor_status_api_v1_doctors__doctor_id__status_patch',
  'list_schedules_api_v1_doctors__doctor_id__schedules_get', 'create_schedule_api_v1_doctors__doctor_id__schedules_post', 'list_blocks_api_v1_doctors__doctor_id__blocks_get',
  'create_block_api_v1_doctors__doctor_id__blocks_post', 'availability_api_v1_availability_get', 'list_appointments_api_v1_appointments_get',
  'create_appointment_api_v1_appointments_post', 'get_appointment_api_v1_appointments__appointment_id__get', 'change_status_api_v1_appointments__appointment_id__status_post',
  'reschedule_api_v1_appointments__appointment_id__reschedule_post', 'appointment_history_api_v1_appointments__appointment_id__history_get',
  'create_encounter_api_v1_clinical_appointments__appointment_id__encounter_post', 'list_patient_notes_api_v1_clinical_patients__patient_id__get',
  'dashboard_api_v1_dashboard_get', 'dashboard_analytics_api_v1_dashboard_analytics_get', 'audit_events_api_v1_audit_get', 'list_authorizations_api_v1_authorizations_get', 'create_authorization_api_v1_authorizations_post',
  'update_authorization_status_api_v1_authorizations__authorization_id__status_patch', 'create_appointment_confirmation_api_v1_documents_appointments__appointment_id__confirmation_post',
  'list_users_api_v1_users_get', 'create_user_api_v1_users_post',
  'issue_activation_code_api_v1_integrations_agent_activation_code_post',
  'issue_agent_token_api_v1_integrations_agent_token_post',
]

describe('endpoint editorial coverage', () => {
  it('documents exactly the current 45 backend operations', () => {
    expect(endpointGuides).toHaveLength(45)
    expect(new Set(endpointOperationIds).size).toBe(endpointOperationIds.length)
    expect([...endpointOperationIds].sort()).toEqual([...currentBackendOperationIds].sort())
  })

  it('has every atomic PRD field populated', () => {
    endpointGuides.forEach((guide) => {
      expect(guide.title).toBeTruthy()
      expect(guide.objective).toBeTruthy()
      expect(guide.problem).toBeTruthy()
      expect(guide.roles.length).toBeGreaterThan(0)
      expect(guide.authentication).toBeTruthy()
      expect(guide.preconditions.length).toBeGreaterThan(0)
      expect(guide.rules.length).toBeGreaterThan(0)
      expect(guide.effects.length).toBeGreaterThan(0)
      expect(guide.errors.length).toBeGreaterThan(0)
      expect(guide.exampleRequest).toBeTruthy()
      expect(guide.exampleResponse).toBeTruthy()
    })
  })
})
