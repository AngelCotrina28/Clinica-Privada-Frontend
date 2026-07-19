# Clínica Privada - Frontend

Aplicación web Angular de la Clínica Privada Luz del Túnel.

## Acceso demo local

Después de iniciar el backend y la pila de microservicios con Docker Compose, use:

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `ClinicaAdminLocal123!` |
| Recepcionista | `recepcionista` | `ClinicaDemoLocal123!` |
| Jefe de enfermería | `jefe_enfermeria` | `ClinicaDemoLocal123!` |
| Enfermero | `enfermero` | `ClinicaDemoLocal123!` |
| Médico | `medico` | `ClinicaDemoLocal123!` |
| Técnico de farmacia | `tecnico_farmacia` | `ClinicaDemoLocal123!` |
| Cajero | `cajero` | `ClinicaDemoLocal123!` |

Estas cuentas son demostrativas y se crean únicamente en el entorno local. La lista completa, incluidas las credenciales preparadas para el despliegue de entrega, se mantiene en [CREDENCIALES_DEMO.md](https://github.com/AngelCotrina28/ClinicaPrivadaMSContainer/blob/main/CREDENCIALES_DEMO.md).

## Requisitos

- Node.js `^20.19.0`, `^22.12.0` o `^24.0.0`.
- npm.
- Gateway disponible en `http://localhost:8090`.
- Backend monolítico disponible en `http://localhost:8080` mientras existan rutas legacy.

## Instalación

Desde la raíz del frontend:

```powershell
npm ci
```

La URL base predeterminada es `/api`, por lo que el proyecto puede arrancar sin crear un `.env`. Si necesitas personalizarla, copia la plantilla local:

```powershell
Copy-Item .env.example .env
```

El archivo `.env` es local y no se versiona. La variable disponible es:

```dotenv
NG_APP_API_URL=/api
```

## Conectividad local

El navegador llama siempre a `/api`. Al ejecutar el frontend con `npm start`, `proxy.conf.json` reenvía esas solicitudes al Gateway en `http://localhost:8090`.

Antes de iniciar Angular deben estar disponibles:

1. El backend monolítico en el puerto `8080`, porque el Gateway todavía envía allí las rutas legacy que no han sido migradas de forma compatible.
2. El Gateway en el puerto `8090`.

Para exponer el Gateway de Kubernetes:

```powershell
kubectl -n clinica-ms port-forward svc/gateway-service 8090:8090
```

Como alternativa, el despliegue Docker Compose de microservicios publica directamente el puerto `8090`.

El prefijo `/api/ms` es la vía explícita del Gateway hacia los microservicios. No debe asumirse que sus contratos son intercambiables con las rutas legacy del frontend ni activarse los flags de compatibilidad sin validar primero cada request y response.

## Desarrollo

```powershell
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Compilación

```powershell
npm run build
```

La salida de producción se genera en `dist/frontend/browser`.

## Pruebas unitarias

```powershell
npm test -- --watch=false
```

## Despliegue en Vercel

`vercel.json` ejecuta `npm ci`, compila con `npm run build`, publica `dist/frontend/browser` y reescribe `/api` hacia el Gateway desplegado en Render. El Gateway desplegado debe tener configurado también su backend fallback para las rutas legacy.
