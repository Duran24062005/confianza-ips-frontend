# Rediseño frontend y analítica de Confianza IPS

## Objetivo

La interfaz debía conservar los flujos ficticios de autenticación, agenda, pacientes, historia clínica y auditoría, pero dejar de depender de una pantalla monolítica y de una gráfica estática. El resultado usa una identidad clínico-editorial y datos consultados desde el backend.

## Sistema visual

- `Space Grotesk` se usa para títulos y números destacados.
- `DM Sans` se usa para texto operativo y formularios.
- `IBM Plex Mono` se usa para etiquetas, estados y metadatos.
- La paleta combina verde clínico, azul petróleo, superficies verdes muy claras y colores semánticos para estados.
- El modo oscuro respeta `prefers-color-scheme`; no modifica permisos ni persistencia.

## Arquitectura

`App.tsx` solo compone rutas y sesión. La experiencia está separada por responsabilidades:

- `components/layout`: shell, navegación y perfil del encabezado.
- `components/ui`: encabezados, estados, modales, métricas y badges.
- `components/charts`: gráficas SVG y tablas accesibles.
- `features/*`: autenticación, resumen, pacientes, agenda, historia, auditoría y perfil.

Las rutas autenticadas viven bajo `/app/*`. `/docs` continúa siendo pública, de solo lectura y alimentada por OpenAPI más las guías editoriales existentes.

## Analítica

El resumen consulta `GET /api/v1/dashboard/analytics?days=7|30|90`. No calcula actividad ficticia en el navegador. Cada gráfica tiene un estado vacío, una descripción accesible y una tabla expandible con los valores exactos.

La visibilidad depende del rol devuelto por la sesión: administración y recepción reciben el agregado institucional; médicos y pacientes reciben únicamente el alcance permitido por el backend.

## Perfil

Todos los roles pueden editar su nombre visible con `PATCH /api/v1/auth/me`. El rol paciente también puede actualizar sus datos administrativos mediante el endpoint existente `/api/v1/patients/me`. El correo, el rol y las relaciones clínicas se muestran como datos de consulta.

## Validación

```bash
pnpm test
pnpm build
git diff --check
```

La revisión visual debe incluir escritorio, móvil, modo claro, modo oscuro y recarga directa de `/app/resumen` y `/app/perfil` en Vercel.
