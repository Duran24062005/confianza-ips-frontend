# PRD - Landing pública e identidad visual de Confianza IPS

## Problema y objetivo

Confianza IPS tiene una operación autenticada, pero no cuenta con una portada pública que explique la plataforma antes del acceso. La nueva superficie debe presentar el producto de forma clara para pacientes, equipos clínicos y personal administrativo, con una identidad propia inspirada en la composición institucional de la referencia visual.

El objetivo es crear la ruta `/` como punto de entrada de demostración: explicar qué resuelve Confianza IPS, mostrar sus áreas principales y llevar a las personas a iniciar sesión o registrarse sin alterar el flujo autenticado existente.

## Alcance

- Crear la ruta pública `/` en el frontend Vite/React existente.
- Crear una identidad visual de Confianza IPS con logotipo, símbolo, paleta, tipografías y reglas de uso aplicadas a la portada.
- Incorporar recursos gráficos generados para el hero y una sección editorial de apoyo.
- Implementar navegación institucional, hero, accesos de confianza, módulos de producto, bloque de impacto, llamada a la acción y footer.
- Incluir botones funcionales de `Iniciar sesión` y `Crear cuenta` que naveguen al acceso de `/app`.
- Mantener `/app/*` y `/docs*` sin cambios de contrato ni de autenticación.
- Mantener visible que el contenido y los datos son ficticios o de demostración.

## Actores y objetivos

- **Visitante o paciente:** entender en pocos segundos qué puede hacer en la plataforma y acceder a su cuenta.
- **Equipo clínico:** identificar agenda, historia clínica y seguimiento como capacidades centrales.
- **Personal administrativo:** reconocer pacientes, autorizaciones y trazabilidad como áreas operativas.
- **Equipo de mantenimiento:** poder cambiar textos, enlaces y recursos visuales desde archivos localizables, sin depender de una conversación previa.

## Dirección visual

- **Referencia:** portal institucional de salud con barra superior, navegación compacta, hero fotográfico, módulos de acceso y footer oscuro.
- **Adaptación:** composición propia de Confianza IPS, sin copiar logotipos, textos, imágenes ni elementos de marca de terceros.
- **Paleta:** azul petróleo como base de confianza, verde clínico como acento único, blanco mineral y un amarillo suave solo para estados destacados.
- **Tipografía:** `Space Grotesk` para titulares y marca, `DM Sans` para lectura y `IBM Plex Mono` para etiquetas operativas.
- **Firma visual:** el símbolo de Confianza IPS combina una forma de diálogo y una marca de verificación clínica, aplicado con un corte diagonal que también aparece en botones y paneles.
- **Movimiento:** entrada suave de los bloques y hover en tarjetas y botones; respeta `prefers-reduced-motion`.

## Contenido ficticio

Los nombres de módulos, métricas, testimonios y cifras de la portada son demostrativos. No deben presentarse como estadísticas reales ni como promesas clínicas. La página debe conservar una nota visible de entorno de demostración y no recoger información médica.

## Integración y contratos

- `/` renderiza contenido estático en el cliente y no necesita una llamada al backend.
- `Iniciar sesión` dirige a `/app`, donde el flujo actual conserva su formulario y autenticación.
- `Crear cuenta` dirige a `/app` como punto de entrada único del MVP; el registro es una capacidad futura y no se simula como alta persistida.
- No se modifican nombres de campos, cookies, endpoints, permisos ni modelos existentes.

## Validaciones y accesibilidad

- La navegación principal debe ser usable con teclado y tener foco visible.
- Los controles deben tener etiquetas claras y contraste suficiente.
- Las imágenes deben tener texto alternativo útil y dimensiones reservadas para evitar saltos de layout.
- La composición debe colapsar explícitamente en una columna en pantallas pequeñas.
- La portada debe seguir siendo entendible sin animación.
- El contenido ficticio debe estar indicado en la interfaz y en la documentación.

## Riesgos y bordes

- Una imagen generada puede contener texto ilegible o artefactos; por eso los mensajes críticos vivirán en HTML, no dentro de las imágenes.
- `/app` actualmente funciona como acceso y no como un formulario separado de registro. El botón de registro debe comunicar ese alcance para no prometer una operación inexistente.
- La landing no demuestra una sesión autenticada, conexión con base de datos ni entrega de datos clínicos reales.
- Los recursos gráficos deben quedar dentro de `public/` y no depender de URLs externas para la portada.

## Verificación prevista

```bash
pnpm test
pnpm build
git diff --check
```

La revisión visual debe cubrir `/` en escritorio y móvil, navegación a `/app`, modo claro y modo oscuro del sistema, además de la operación normal de las rutas autenticadas existentes.
