import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUsd, formatVes, formatDate } from './utils';
import { PIERLUISSI_LOGO_BASE64 } from './logoBase64';

export interface PaymentReceiptData {
  receiptNumber: string;
  paymentDate: string | Date;
  schoolName: string;
  schoolRif: string;
  schoolPhone: string;
  schoolAddress: string;
  representativeName: string;
  representativeCedula: string;
  studentName: string;
  studentGrade: string;
  conceptName: string;
  method: string;
  reference?: string | null;
  amountUsd: number;
  amountVes: number;
  bcvRate: number;
  notes?: string | null;
}

export function generatePaymentReceiptPDF(data: PaymentReceiptData) {
  const doc = new jsPDF();

  // Encabezado Membretado Oficial Pierluissi Verde Esmeralda (#166534)
  doc.setFillColor(22, 101, 52);
  doc.rect(0, 0, 210, 36, 'F');

  // Insertar Logo Oficial en alta resolución
  try {
    doc.addImage(PIERLUISSI_LOGO_BASE64, 'PNG', 12, 8, 68, 16);
  } catch (e) {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('U.E. RAMÓN PIERLUISSI RAMÍREZ', 14, 15);
  }

  // Texto Membrete al lado del logo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('U.E. RAMÓN PIERLUISSI RAMÍREZ', 90, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`RIF: ${data.schoolRif}  |  Telf: ${data.schoolPhone}`, 90, 20);
  doc.text(`admonpierluissi@gmail.com`, 90, 25);
  doc.text(`Sede Prebo II, Valencia, Carabobo`, 90, 30);

  // Título de Recibo
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('COMPROBANTE DE PAGO DIGITAL', 14, 48);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Recibo: ${data.receiptNumber}`, 140, 48);
  doc.text(`Fecha Emisión: ${formatDate(data.paymentDate)}`, 140, 54);
  doc.text(`Tasa BCV Aplicada: ${data.bcvRate.toFixed(2)} Bs./USD`, 140, 60);

  // Cuadro Datos del Representante y Estudiante
  autoTable(doc, {
    startY: 66,
    head: [['DATOS DEL REPRESENTANTE', 'DATOS DEL ESTUDIANTE / NIVEL']],
    body: [
      [
        `Nombre: ${data.representativeName}\nCédula: ${data.representativeCedula}`,
        `Estudiante: ${data.studentName}\nGrado/Sección: ${data.studentGrade}`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Detalle del Pago
  const methodMap: Record<string, string> = {
    PAGO_MOVIL: 'Pago Móvil (Bolívares)',
    ZELLE: 'Zelle (USD)',
    TRANSFERENCIA_VES: 'Transferencia Bancaria (Bolívares)',
    EFECTIVO_USD: 'Efectivo USD',
    EFECTIVO_VES: 'Efectivo Bolívares',
  };

  const methodLabel = methodMap[data.method] || data.method;

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [['CONCEPTO / MENSUALIDAD', 'MÉTODO DE PAGO', 'REFERENCIA', 'MONTO ($)', 'EQUIVALENTE (BS.)']],
    body: [
      [
        data.conceptName,
        methodLabel,
        data.reference || 'N/A',
        formatUsd(data.amountUsd),
        formatVes(data.amountVes),
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9.5, cellPadding: 5 },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Observaciones si existen
  let currentY = (doc as any).lastAutoTable.finalY + 12;
  if (data.notes) {
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Observaciones: ${data.notes}`, 14, currentY);
    currentY += 10;
  }

  // Pie de Página y Firma Digital / Sello
  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY + 25, 80, currentY + 25);
  doc.line(130, currentY + 25, 196, currentY + 25);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Administración U.E. Ramón Pierluissi R.', 20, currentY + 30);
  doc.text('Firma y Conformidad del Representante', 137, currentY + 30);

  doc.text('Este documento es un comprobante de pago digital emitido por la U.E. Ramón Pierluissi Ramírez (Valencia, Carabobo).', 14, 285);

  // Descargar PDF
  doc.save(`Recibo_Pierluissi_${data.receiptNumber}.pdf`);
}
