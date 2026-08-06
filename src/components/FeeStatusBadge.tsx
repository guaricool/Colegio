import React from 'react';

interface FeeStatusBadgeProps {
  status: string;
}

export function FeeStatusBadge({ status }: FeeStatusBadgeProps) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          PAGADO
        </span>
      );
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          VENCIDO
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          ABONADO
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          PENDIENTE
        </span>
      );
  }
}
