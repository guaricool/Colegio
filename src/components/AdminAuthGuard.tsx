'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, ShieldAlert, LogIn, Sparkles } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AdminAuthGuard({ children, allowedRoles }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sessionStr = localStorage.getItem('pierluissi_admin_session');
    if (!sessionStr) {
      setIsAuthenticated(false);
      router.push('/admin/login');
      return;
    }

    try {
      const session = JSON.parse(sessionStr);
      if (session && session.email) {
        setUserRole(session.role || 'ADMIN');

        // Si se especifican roles permitidos y el usuario no lo cumple
        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
          setIsAuthenticated(false);
          if (session.role === 'COBRANZA') {
            router.push('/cobros');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    } catch (e) {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  }, [pathname, router, allowedRoles]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Verificando permisos de seguridad administrativa...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-8 max-w-md text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-400 border border-rose-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-white">Área Administrativa Bloqueada</h2>
            <p className="text-xs text-slate-300">
              Esta sección requiere inicio de sesión obligatorio con usuario y clave de administración.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/admin/login')}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Ir al Login de Administración</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
