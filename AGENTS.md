# Memoria del Proyecto - Colegio Ramón Pierluissi Ramírez

Sistema Financiero, Cobranza de Mensualidades, Recibos Digitalizados en PDF, Recordatorios por WhatsApp, Escáner Inteligente Gemini AI, Portal de Representantes (Pago Sin Tarjeta & C2P Provincial), Landing Page Institucional, Verificación TotalPago/Provincial y Exportador para Profit Plus 2K12 (Lotes Fin de Semana).

## 📌 Reglas de Flujo de Trabajo (Obligatorias)

1. **Memoria de Proyecto**: Actualizar este archivo (`AGENTS.md` / `CLAUDE.md`) con cada cambio o nueva característica.
2. **Grafo de Conocimiento (`/graphify`)**: Ejecutar `/graphify` para actualizar la estructura del grafo de conocimiento.
3. **Despliegue Automático VPS**: Ejecutar `git push origin main` tras cada commit para desplegar en Coolify VPS ([http://colegio.13.140.181.29.sslip.io](http://colegio.13.140.181.29.sslip.io)).
4. **Sincronización Prisma**: Ejecutar `npx prisma db push` cuando la modificación toque `prisma/schema.prisma`.

---

## 🏛️ Arquitectura y Producción

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Base de Datos**: PostgreSQL (Coolify VPS `colegio-db`) & SQLite (Desarrollo local `dev.db`)
- **VPS / Hosting**: Coolify en IP `13.140.181.29`
- **Dominio Público**: [http://colegio.13.140.181.29.sslip.io](http://colegio.13.140.181.29.sslip.io)
- **Repositorio GitHub**: `https://github.com/guaricool/Colegio.git` (rama `main`)

---

## 🚀 Módulos Implementados

- **Exportador Contable Profit Plus 2K12 & Lotes Fin de Semana (`/reportes`)**: Agrupación automática de cobros recibidos el fin de semana (sábado y domingo) para ser exportados el lunes por la mañana a Profit Plus 2K12 (`saCliente` y `saCobro`) en Excel y CSV.
- **Escáner Inteligente e IA Gemini Vision (`/api/payments/ocr`)**: Lector automático de capturas/fotos de Pago Móvil, Transferencias y Depósitos del Banco Provincial. Extrae la referencia, el monto en Bolívares y calcula el saldo a la Tasa BCV del día para auto-aprobar la transacción.
- **Cobro Instantáneo C2P Dinero Rápido (Banco Provincial)**: Módulo de débito directo C2P (`/api/payments/c2p`) mediante Clave de Compra C2P en el Portal de Representantes y Administración sin tarjetas.
- **Tasa BCV Doble (Dólar $ & Euro €)**: Indicador gemelo en tiempo real (`USD: 75.51` | `EUR: 81.20`) en la barra superior y soporte multimoneda para mensualidades.
- **Verificación Automática TotalPago & Banco Provincial (BBVA)**: Módulo de integración API (`/api/payments/verify`) para validación automática de referencias de Pago Móvil y C2P Dinero Rápido del Banco Provincial.
- **Landing Page Limpia (`/`)**: Presentación oficial de la U.E. Ramón Pierluissi Ramírez (Sede Prebo II), indicador neón en vivo de las Tasas BCV y botones de doble acceso sin menús administrativos visibles.
- **Navegación Contextual (`Navbar.tsx`)**: Oculta opciones administrativas en la landing page y portal de padres, mostrándolas únicamente en el módulo administrativo.
- **Dashboard Administrativo (`/dashboard`)**: KPIs de ingresos USD/EUR/VES, tasa BCV dual, gráfico de recaudación por métodos y mensualidades recientes.
- **Cobros & Recibos (`/cobros`)**: Gestión de mensualidades pendientes, abonos, pagos con Pago Móvil/Zelle y emisión de recibos PDF al instante.
- **Portal de Representantes (`/representante/login` & `/representante/portal`)**: Acceso para padres mediante Cédula de Identidad, estado de cuenta a Tasa BCV y reporte de Pago Móvil/Zelle sin requerir tarjetas.
- **Estudiantes & Becas (`/estudiantes`)**: Registro de representantes, alumnos, grados escolares, porcentaje de beca y facturación masiva.
- **Recordatorios WhatsApp (`/whatsapp`)**: Avisos de cobro amigables con enlace `wa.me` directo a representantes.
- **Reportes Contables (`/reportes`)**: Auditoría de flujo de caja, morosidad por grado y exportación de libro de ingresos a Excel (`.xlsx`) y Profit Plus 2K12.
