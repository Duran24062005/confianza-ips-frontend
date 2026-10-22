# Confianza IPS Frontend

Aplicación React + Vite para la operación institucional ficticia de Confianza IPS.

## Desarrollo

1. Copia `.env.example` como `.env`.
2. Ejecuta `pnpm install`.
3. Inicia con `pnpm dev`.

El frontend consume el backend mediante `VITE_API_BASE_URL`, mantiene el JWT únicamente en memoria y no contiene reglas críticas de autorización.

## Validación

- `pnpm build`
- `pnpm test`

La interfaz está escrita en español y muestra siempre que los datos son ficticios y no tienen validez institucional real.
