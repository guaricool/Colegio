import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Colegio Ramón Pierluissi - Sistema Financiero y Cobranzas',
  description: 'Sistema integral de gestión de cobros, recibos digitalizados, reportes de contabilidad y recordatorios de pago por WhatsApp para el Colegio Ramón Pierluissi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Colegio Ramón Pierluissi. Todos los derechos reservados. | Sistema de Administración Financiera Venezuela.
        </footer>
      </body>
    </html>
  );
}
