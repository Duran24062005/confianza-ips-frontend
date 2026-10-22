# PRD técnico — Ruta pública `/docs`

## Problema y objetivo

El frontend necesitaba explicar la API de Confianza IPS sin depender de la memoria del equipo ni de una página Swagger genérica. La ruta `/docs` convierte el contrato REST en una guía de producto atómica: una ficha por `operationId`, con su intención funcional, permisos, reglas y contrato HTTP.

## Alcance implementado

- Índice público en `/docs` y detalle público en `/docs/:operationId`.
- Catálogo editorial en español para las 41 operaciones actuales.
- Búsqueda por texto, método, dominio y rol.
- Método, ruta, parámetros, payload, schemas y respuestas tomados del OpenAPI real.
- Reglas, actores, efectos, errores, ejemplos ficticios y relaciones mantenidos en `src/docs/endpoint-guides.ts`.
- Estados de carga, error, reintento y degradación editorial cuando `/openapi.json` no responde.
- Copiado de ruta, JSON de entrada y ejemplos completos; no existe ejecución de solicitudes.
- Enlace público desde login y dashboard.
- Rewrite de Vercel para recargar rutas profundas del router.

## Actores y permisos

La página es pública porque describe el contrato, no expone datos operativos reales ni permite mutaciones. La documentación distingue los roles que pueden usar cada endpoint, pero no reemplaza la autorización del backend. Los ejemplos usan dominios, tokens y pacientes ficticios.

## Arquitectura y fuentes

`OpenApiClient` carga `/openapi.json` desde el origen de `VITE_API_BASE_URL`, con timeout y sin encabezado `Authorization`. `buildDocumentedOperations` mezcla la información técnica runtime con la ficha editorial local. La vista no importa el cliente de operaciones ni conoce reglas para crear citas, usuarios o notas.

La prueba `endpoint-guides.test.ts` fija el inventario actual de `operationId`, comprueba ausencia de duplicados y exige los campos PRD de cada ficha. Si el backend agrega una operación, la prueba obliga a revisar el catálogo antes de publicar.

## Validaciones y riesgos

- El OpenAPI inválido, una respuesta HTTP no exitosa, una desconexión o un timeout se muestran como error visible.
- Si el contrato no está disponible, la ficha usa identidad y contenido editorial local como respaldo y deja claro que el contrato técnico no está sincronizado.
- El router depende del rewrite de Vercel para `/docs` y `/docs/:operationId`; el backend debe mantener público `/openapi.json` y permitir CORS para el origen frontend.
- El JWT de la aplicación sigue en memoria; la ruta de documentación nunca intenta hidratar sesión.

## Mantenimiento

Al agregar o modificar un endpoint, actualizar primero el backend y su OpenAPI, luego `endpoint-guides.ts`, los operation IDs esperados y las pruebas. Verificar TypeScript, Vitest, build Vite y la recarga directa de `/docs/<operationId>` en preview antes de publicar.
