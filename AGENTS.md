# Memoria del Proyecto - Colegio Ramón Pierluissi Ramírez

Sistema Financiero, Cobranza de Mensualidades, Recibos Digitalizados en PDF, Recordatorios por WhatsApp, Escáner Inteligente Gemini AI, Portal de Representantes (Pago Sin Tarjeta & C2P Provincial), Landing Page Institucional, Verificación TotalPago/Provincial, Autenticación Obligatoria & AdminAuthGuard (SuperAdmin, Admin, Cobranza), Dockerfile Optimizado, Exportador para Profit Plus 2K12, CRM de Registro de Llamadas de Cobranza, Dashboard de Auditoría de Desempeño con Filtros Avanzados y Registro Privado Exclusivo para SuperAdmin.

## 📌 Reglas de Flujo de Trabajo (Obligatorias)

1. **Memoria de Proyecto**: Actualizar este archivo (`AGENTS.md` / `CLAUDE.md`) con cada cambio o nueva característica.
2. **Grafo de Conocimiento (`/graphify`)**: Ejecutar `/graphify` para actualizar la estructura del grafo de conocimiento.
3. **Despliegue Automático VPS**: Ejecutar `git push origin main` tras cada commit para desplegar en Coolify VPS ([http://colegio.13.140.181.29.sslip.io](http://colegio.13.140.181.29.sslip.io)).
4. **Sincronización Prisma**: Ejecutar `npx prisma db push` cuando la modificación toque `prisma/schema.prisma`.

---

## 🏛️ Arquitectura y Producción

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Base de Datos**: PostgreSQL (Coolify VPS `colegio-db`) & SQLite (Desarrollo local `dev.db`)
- **VPS / Hosting**: Coolify en IP `13.140.181.29` (Construcción vía `Dockerfile` multi-stage Node 20-alpine & `nixpacks.toml`)
- **Dominio Público**: [http://colegio.13.140.181.29.sslip.io](http://colegio.13.140.181.29.sslip.io)
- **Repositorio GitHub**: `https://github.com/guaricool/Colegio.git` (rama `main`)

---

## 🚀 Módulos Implementados

- **Dashboard de Auditoría de Cobranza con Filtros Avanzados (`/reportes`)**:
  - Pestaña **"📊 Auditoría de Cobranza"** repotenciada con una **barra de filtros multicriterio en tiempo real**:
    - **Filtro por Rango de Fechas**: Fecha Desde y Fecha Hasta con atajos de un solo clic (*Hoy*, *Esta Semana*, *Este Mes* y *Limpiar Filtros*).
    - **Filtro por Estado de Llamada**: `Todas`, `🟢 Comunicado con Éxito` o `🔴 Intento Fallido (No contestó)`.
    - **Filtro por Resultado de Pago (Cruce)**: `Todos`, `💜 Pago Confirmado (Convertido)` o `⏳ Pendiente de Pago`.
    - **Búsqueda por Texto**: Filtrado instantáneo por nombre del alumno, representante, cédula, nota u operador.
  - KPIs globales de llamadas, contactados, no contestados, efectividad % y dinero recuperado ($) actualizados dinámicamente según el filtro.
- **Restricción de Registro Público & Creación Privada de Usuarios**:
  - Eliminado el enlace de registro público externo en la vista de login `/admin/login`.
  - La pantalla `/admin/register` ahora está **protegida con `AdminAuthGuard`** para que solo SuperAdmin y Administradores autenticados puedan acceder.
  - Creación de usuarios con roles **`SUPER_ADMIN`** (SuperAdmin 100%), **`ADMIN`** (Dueño / Administrador General) y **`COBRANZA`** (Caja / Cobros) disponible de forma exclusiva en `/configuracion` y `/admin/register`.
- **CRM de Registro de Gestiones de Cobranza (`CollectionCall`)**:
  - Modal interactivo de llamada en `/cobros` al hacer clic en un estudiante adeudado.
  - Botón "Intento Fallido" y Botón "Comunicado Con Éxito" con área de observaciones.
  - Cruce de datos automático a `PAGADO / CONVERTED_PAID`.
- **Privacidad y Eliminación de Marcas de Agua Personales**: Limpieza total de datos personales en los placeholders de login, registro y configuración.
- **Dockerfile & Nixpacks.toml Optimizado**: Solución al fallo `ECONNRESET` de Nixpacks en Coolify.
- **Bloqueo Total Administrativo & AdminAuthGuard (`AdminAuthGuard.tsx`)**: Protección global de las 6 páginas administrativas (`/dashboard`, `/cobros`, `/estudiantes`, `/whatsapp`, `/reportes`, `/configuracion`).
- **Autenticación Administrativa & Control de Roles (RBAC)**: SuperAdmin (`cpierluissis@gmail.com`), Administrador General y Área de Cobranza.
- **Exportador Contable Profit Plus 2K12 & Lotes Fin de Semana (`/reportes`)**: Agrupación de cobros del fin de semana (sábado/domingo) para exportación en Excel/CSV (`saCliente` y `saCobro`).
- **Escáner Inteligente e IA Gemini Vision (`/api/payments/ocr`)**: Lector automático de capturas/fotos de Pago Móvil y Banco Provincial.
- **Cobro Instantáneo C2P Dinero Rápido (`/api/payments/c2p`)**: Débito directo C2P en el Portal de Representantes sin tarjetas.
- **Tasa BCV Doble (Dólar $ & Euro €)**: Indicador gemelo en tiempo real (`USD: 75.51` | `EUR: 81.20`).
- **Landing Page Institucional (`/`)**: Presentación oficial de la U.E. Ramón Pierluissi Ramírez.
