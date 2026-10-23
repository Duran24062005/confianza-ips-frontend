# Confianza IPS Frontend

Aplicación React + Vite para la operación institucional ficticia de Confianza IPS.

## Desarrollo

1. Copia `.env.example` como `.env`.
2. Ejecuta `pnpm install`.
3. Inicia con `pnpm dev`.

El frontend consume el backend mediante `VITE_API_BASE_URL`, mantiene el JWT únicamente en memoria y no contiene reglas críticas de autorización.

En Vercel, `VITE_API_BASE_URL` debe apuntar al backend público, no a `localhost`. La configuración de producción esperada para la demo es `https://confianza-ips-backend.vercel.app/api/v1`. Las variables `VITE_*` se incorporan durante el build, así que después de cambiarlas hay que crear un nuevo deployment.

## Documentación pública de la API

La ruta `/docs` es un atlas público y de solo lectura del contrato REST. Cada operación tiene una ficha individual en `/docs/:operationId` con objetivo, actores, permisos, reglas de negocio, parámetros, payload, schemas, respuestas, errores, auditoría y ejemplos ficticios.

La documentación combina dos fuentes deliberadas:

- El cliente `src/infrastructure/openapi-client.ts` carga `/openapi.json` desde el origen de `VITE_API_BASE_URL` sin enviar JWT. De allí provienen método, ruta, parámetros, cuerpos, schemas y códigos HTTP.
- `src/docs/endpoint-guides.ts` contiene la metadata editorial en español para explicar intención, roles, reglas, efectos y relaciones. La prueba de cobertura mantiene una ficha por cada `operationId` actual.

La vista no tiene “Try it out” y no ejecuta mutaciones. Los botones solo copian rutas o ejemplos al portapapeles. Si el contrato no está disponible, la interfaz conserva el índice editorial y muestra un estado de error visible para que el problema de infraestructura no se confunda con documentación actualizada.

Cuando se agregue o cambie un endpoint en el backend:

1. Ejecuta el backend y revisa `/openapi.json`.
2. Agrega o actualiza la ficha correspondiente en `src/docs/endpoint-guides.ts`.
3. Actualiza la prueba de cobertura si cambia el inventario de `operationId`.
4. Verifica `tsc`, Vitest y el build antes de publicar.

Vercel reescribe `/docs` y `/docs/:operationId` hacia `index.html` para que las recargas y URLs directas lleguen al router del navegador.

La decisión de arquitectura, alcance, riesgos y mantenimiento queda registrada en [`docs/api-docs-route.md`](docs/api-docs-route.md).

## Capas

- `domain/models.ts`: tipos del contrato que la interfaz necesita.
- `application/`: puertos y casos de uso, como el ciclo de inicio y cierre de sesión.
- `infrastructure/`: cliente HTTP, adaptación de endpoints y composición de dependencias.
- `App.tsx`: composición visual de las vistas y manejo de interacción.

`src/api.ts` se conserva como una fachada de compatibilidad; las nuevas dependencias deben importar desde la capa que les corresponda. El token no se persiste en `localStorage` ni en cookies: al recargar la aplicación se solicita autenticación nuevamente.

## Validación

- `pnpm build`
- `pnpm test`

La interfaz está escrita en español y muestra siempre que los datos son ficticios y no tienen validez institucional real.

El área autenticada usa rutas `/app/resumen`, `/app/pacientes`, `/app/agenda`, `/app/historia`, `/app/auditoria` y `/app/perfil`. El resumen consulta métricas persistidas del backend para periodos de 7, 30 o 90 días. La arquitectura visual y de componentes está documentada en [`docs/001-frontend-redesign.md`](docs/001-frontend-redesign.md).

El dashboard del paciente incluye la tarjeta de activación del agente. El paciente
genera una clave individual de seis dígitos, válida durante cinco minutos y de un
solo uso, para compartirla junto con su documento y EPS. La interfaz nunca recibe
la API key del agente ni muestra secretos del backend.

## Integración continua

El workflow `.github/workflows/ci.yml` se ejecuta en cada `push` o `pull_request` hacia `main`, y también puede iniciarse manualmente. Usa Node.js 24 y pnpm 12.15.0 para instalar dependencias con lockfile, ejecutar Vitest y construir la aplicación.

Para reproducir las validaciones localmente:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
```
