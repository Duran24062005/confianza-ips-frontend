# PRD: Participación del frontend institucional en la integración Waylo (MVP)

**Estado:** aprobado para integración
**Fecha:** 2026-10-26
**Repositorio:** `confianza-ips-frontend`

## Propósito

Este frontend es la interfaz institucional de Confianza IPS. No será reemplazado por
Waylo ni se convertirá en un proxy de datos. Su participación en el MVP consiste en que
un paciente autenticado pueda generar una clave temporal para activar su integración con
Waylo desde el flujo institucional existente.

## Responsabilidades

- Mantener el login institucional y el dashboard por rol.
- Mostrar al paciente la acción de generar la clave de activación.
- Explicar expiración y consumo único.
- No mostrar `AGENT_API_KEY`, `AGENT_ACTIVATION_SECRET` ni `AGENT_JWT_SECRET`.
- No enviar el código directamente desde el navegador a Waylo.
- Mantener el JWT institucional en memoria según la arquitectura existente.

## Flujo de usuario

1. El paciente inicia sesión en Confianza.
2. Abre la tarjeta de activación de agente en su resumen.
3. Genera una clave temporal.
4. Copia el código de seis dígitos a la configuración EPS de Waylo.
5. Waylo realiza el intercambio servidor-a-servidor con Confianza.
6. El código deja de ser válido después de consumirse o expirar.

## Fuera del alcance

- Crear una nueva pantalla de citas para Waylo.
- Entregar credenciales de integración al navegador.
- Añadir endpoints específicos al frontend.
- Permitir que Waylo cambie la EPS del paciente.
- Cambiar las reglas de roles o el modelo de permisos institucional.

## Contrato relacionado

El backend institucional expone:

- `POST /api/v1/integrations/agent/activation-code` para emitir la clave al paciente.
- `POST /api/v1/integrations/agent/token` para que el backend de Waylo intercambie la clave.
- `GET /api/v1/patients/me` y `GET /api/v1/appointments` para lecturas limitadas.

La API key usada en el intercambio pertenece exclusivamente al backend de Waylo y a
Confianza. Este frontend no la conoce.

## Validaciones

- El botón de generación solo aparece a pacientes autorizados.
- La clave se muestra únicamente en la respuesta de emisión.
- La interfaz no persiste la clave en claro.
- Los cambios del contrato deben validarse primero en `confianza-ips-backend`.

## Impacto

Para este MVP no se requiere cambio de código en el frontend institucional. La
documentación deja trazable su papel para que futuros colaboradores no intenten conectar
Waylo directamente con esta aplicación ni colocar secretos en componentes React.
