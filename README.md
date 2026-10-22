# Confianza IPS Frontend

Aplicación React + Vite para la operación institucional ficticia de Confianza IPS.

## Desarrollo

1. Copia `.env.example` como `.env`.
2. Ejecuta `pnpm install`.
3. Inicia con `pnpm dev`.

El frontend consume el backend mediante `VITE_API_BASE_URL`, mantiene el JWT únicamente en memoria y no contiene reglas críticas de autorización.

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

## Integración continua

El workflow `.github/workflows/ci.yml` se ejecuta en cada `push` o `pull_request` hacia `main`, y también puede iniciarse manualmente. Usa Node.js 24 y pnpm 12.15.0 para instalar dependencias con lockfile, ejecutar Vitest y construir la aplicación.

Para reproducir las validaciones localmente:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
```
