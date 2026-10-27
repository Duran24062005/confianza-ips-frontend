# PRD — Registro de paciente desde el acceso público

## Problema y objetivo

La pantalla de acceso precargaba una cuenta de administración y solo mostraba accesos rápidos de demo. Se incorpora una ruta visible para que quien prueba la demostración cree una cuenta de paciente propia y llegue al dashboard donde se genera la clave de activación de Waylo.

## Experiencia y alcance

- El botón **Crear cuenta** de la landing abre `/app?mode=register`.
- El login también muestra **¿Eres paciente nuevo? Crea tu cuenta**.
- El formulario solicita el conjunto administrativo requerido por el backend, contraseña y confirmación.
- Tras un registro exitoso, el frontend conserva el JWT exclusivamente en memoria, consulta `/auth/me` y entra al espacio del paciente.
- Solo se ofrece registro de paciente ficticio. No hay selector de rol ni alta pública de personal.

## Contrato y errores

El cliente envía `POST /api/v1/auth/register` y delega la autoridad de roles y validaciones en el backend. Una contraseña distinta de su confirmación se bloquea antes de enviar la petición. Los errores de formato, correo o documento repetido se muestran desde la respuesta de la API.

## Relación con Waylo

Una vez dentro, el paciente puede abrir la tarjeta de activación, generar la clave temporal de seis dígitos y usarla en Waylo con sus propios documento y EPS. La cuenta no revela ni configura `AGENT_API_KEY`; esa clave continúa siendo exclusivamente servidor a servidor.

## Riesgos y validación

Esta capacidad usa datos sintéticos y no es un proceso de admisión real. La validación cubre el enlace al formulario, la confirmación de contraseña, el contrato HTTP y el inicio de sesión posterior. La revisión visual en navegador queda pendiente de un entorno local conectado.
