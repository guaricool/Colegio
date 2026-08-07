# Memoria del Proyecto - Colegio Ramón Pierluissi Ramírez

Sistema Financiero, Cobranza de Mensualidades, Recibos Digitalizados en PDF, Recordatorios por WhatsApp, Escáner Inteligente Gemini AI, Portal de Representantes (Pago Sin Tarjeta & C2P Provincial), Landing Page Institucional, Verificación TotalPago/Provincial, Autenticación Obligatoria & AdminAuthGuard (SuperAdmin, Admin, Cobranza), Dockerfile Optimizado, Exportador para Profit Plus 2K12, CRM de Registro de Llamadas de Cobranza y Dashboard de Auditoría de Desempeño de Personal.

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

- **CRM de Registro de Gestiones de Cobranza (`CollectionCall`)**:
  - Modal interactivo de llamada en `/cobros` al hacer clic en un estudiante adeudado.
  - Muestra la ficha de contacto del representante (Teléfono, Cédula, Nombre, Saldo).
  - **Botón "Intento Fallido"**: Registra que el operador intentó llamar pero no contestó.
  - **Botón "Comunicado Con Éxito"**: Abre un área de texto para ingresar las observaciones/compromisos de pago (Ej. *"Mañana paga en efectivo"*).
  - Trazabilidad y cruce de datos automático: Al registrarse el pago, las gestiones previas pasan automáticamente a `PAGADO / CONVERTED_PAID`.
- **Dashboard de Auditoría y Desempeño de Cobranza (`/reportes`)**:
  - Pestaña **"📊 Auditoría de Cobranza"** con KPIs de efectividad (%), gestiones totales, contactados, intentos fallidos y monto recuperado ($).
  - Tabla de productividad por operador/cajero.
  - Línea de tiempo auditante de llamadas cruzada con el comprobante de pago final.
- **Privacidad y Eliminación de Marcas de Agua Personales**: Limpieza total de datos personales en los placeholders/marcas de agua de los formularios de Login, Registro y Configuración de usuarios.
- **Dockerfile & Nixpacks.toml Optimizado**: Solución al fallo `ECONNRESET` de Nixpacks en Coolify. Compilación ligera usando `npm install --legacy-peer-deps` y `npx prisma generate`.
- **Bloqueo Total Administrativo & AdminAuthGuard (`AdminAuthGuard.tsx`)**: Protección global de las 6 páginas administrativas (`/dashboard`, `/cobros`, `/estudiantes`, `/whatsapp`, `/reportes`, `/configuracion`).
- **Autenticación Administrativa & Control de Roles (RBAC)**: SuperAdmin (`cpierluissis@gmail.com`), Administrador General y Área de Cobranza.
- **Exportador Contable Profit Plus 2K12 & Lotes Fin de Semana (`/reportes`)**: Agrupación de cobros del fin de semana (sábado/domingo) para exportación en Excel/CSV (`saCliente` y `saCobro`).
- **Escáner Inteligente e IA Gemini Vision (`/api/payments/ocr`)**: Lector automático de capturas/fotos de Pago Móvil y Banco Provincial.
- **Cobro Instantáneo C2P Dinero Rápido (`/api/payments/c2p`)**: Débito directo C2P en el Portal de Representantes sin tarjetas.
- **Tasa BCV Doble (Dólar $ & Euro €)**: Indicador gemelo en tiempo real (`USD: 75.51` | `EUR: 81.20`).
- **Landing Page Institucional (`/`)**: Presentación oficial de la U.E. Ramón Pierluissi Ramírez.
