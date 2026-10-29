# Docker: frontend Confianza IPS

La imagen compila la aplicación Vite y la sirve con Nginx en el puerto `80`.
El fallback de Nginx permite recargar directamente rutas como `/app/resumen` y
`/docs/...` sin perder el enrutamiento de React.

## Construir y ejecutar

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://confianza-ips-backend.vercel.app/api/v1 \
  -t confianza-ips-frontend .
docker run --rm -p 5173:80 confianza-ips-frontend
```

`VITE_API_BASE_URL` se incorpora durante el build; cambiarlo requiere construir
una nueva imagen. No se deben pasar secretos al frontend ni al argumento de build.
