# Auditoría de pruebas del frontend institucional

Fecha de corte: 2026-10-29

## Alcance

Se revisaron los flujos de pacientes, historia clínica, auditoría, autenticación,
agenda, dashboard, cliente HTTP y composición del API.

## Cobertura añadida

- `PatientsPage`: carga, búsqueda, apertura del formulario, creación y retry.
- `ClinicalPage`: carga de atenciones, notas del paciente seleccionado y cambio
  de paciente.
- `AuditPage`: error recuperable, retry, eventos persistidos y estado vacío.

## Evidencia local

- `pnpm test -- --reporter=dot`: 19 archivos, 46 pruebas aprobadas.
- `pnpm build`: correcto; TypeScript y Vite produjeron el bundle de producción.

## Riesgos y pendientes

Las pruebas cubren UI y clientes con mocks, no una sesión real contra el backend
institucional. Debe mantenerse una validación de contrato API separada y añadir
un flujo browser/API autenticado cuando exista un entorno de integración
aislado. El bundle generado en `dist/` no forma parte de los cambios de esta
auditoría.
