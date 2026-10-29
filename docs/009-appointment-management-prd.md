# PRD: operaciones funcionales de citas

## Problema y objetivo

La vista de agenda muestra las citas existentes y permite algunas transiciones
para personal institucional, pero no ofrece un flujo completo para crear,
reprogramar y cancelar citas desde la plataforma. El objetivo es que cada
acción visible ejecute el contrato real de Confianza IPS, refleje sus estados
y mantenga la trazabilidad de las operaciones.

## Alcance

- Crear una cita desde la agenda con paciente, profesional, servicio, sede y
  un horario disponible.
- Consultar disponibilidad real al seleccionar profesional, servicio y fecha.
- Reprogramar una cita activa seleccionando un nuevo horario disponible.
- Cancelar una cita mediante la cancelación lógica del backend.
- Mostrar estados de carga, vacío, error y confirmación para cada mutación.
- Respetar el alcance por rol implementado por la API:
  administración y recepción gestionan la agenda; pacientes gestionan sus
  propias solicitudes dentro de las reglas de anticipación; médicos solo
  cierran las atenciones de su agenda.

## Contratos utilizados

- `GET /appointments`
- `GET /doctors`, `GET /services`, `GET /sites`
- `GET /availability?doctor_id=&service_id=&date=`
- `POST /appointments`
- `POST /appointments/{id}/reschedule`
- `POST /appointments/{id}/status` con `status: cancelled`

La eliminación se representa como cancelación lógica, porque Confianza conserva
el registro y su historial de auditoría. El frontend no debe ofrecer un `DELETE`
físico que el backend no soporta.

## Reglas de interfaz

- La creación usa únicamente horarios devueltos por `/availability`; no se
  permite enviar una hora arbitraria desde el formulario.
- La reprogramación solo aparece para citas `requested` o `confirmed`.
- La cancelación se muestra para administración, recepción y pacientes; la API
  sigue siendo la autoridad para permisos y la regla de 24 horas.
- Las citas `completed`, `cancelled` y `no_show` no se pueden reprogramar.
- Una operación exitosa cierra el diálogo y vuelve a cargar la agenda.
- Los errores del backend se muestran en la vista y no se ocultan como éxito.

## Riesgos y validaciones

- La disponibilidad puede cambiar entre la consulta y la mutación; un `409`
  debe mostrarse como conflicto y permitir volver a consultar.
- El backend puede devolver `403` por rol o por la ventana de cancelación del
  paciente.
- La zona horaria se conserva en la conversión de fecha y hora del navegador;
  la API recibe un `starts_at` ISO.
- La interfaz se prueba con mocks del contrato y el build. La confirmación
  contra una base institucional real requiere un entorno autenticado separado.
