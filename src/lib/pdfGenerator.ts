import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUsd, formatVes, formatDate } from './utils';

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

  // Encabezado Membretado
  doc.setFillColor(30, 58, 138); // Azul marino elegante (#1e3a8a)
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(data.schoolName.toUpperCase(), 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`RIF: ${data.schoolRif}  |  Telf: ${data.schoolPhone}`, 14, 22);
  doc.text(`Dirección: ${data.schoolAddress}`, 14, 27);

  // Título de Recibo
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('COMPROBANTE DE PAGO DIGITAL', 14, 45);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Recibo: ${data.receiptNumber}`, 140, 45);
  doc.text(`Fecha: ${formatDate(data.paymentDate)}`, 140, 51);
  doc.text(`Tasa BCV Aplicada: ${data.bcvRate.toFixed(2)} Bs./USD`, 140, 57);

  // Cuadro Datos del Representante y Estudiante
  autoTable(doc, {
    startY: 63,
    head: [['DATOS DEL REPRESENTANTE', 'DATOS DEL ESTUDIANTE']],
    body: [
      [
        `Nombre: ${data.representativeName}\nCédula: ${data.representativeCedula}`,
        `Estudiante: ${data.studentName}\nGrado/Sección: ${data.studentGrade}`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Detalle del Pago
  const methodMap: Record<string, string> = {
    PAGO_MOVIL: 'Pago Móvil',
    ZELLE: 'Zelle',
    TRANSFERENCIA_VES: 'Transferencia Bancaria (VES)',
    EFECTIVO_USD: 'Efectivo USD',
    EFECTIVO_VES: 'Efectivo Bolívares',
  };

  const methodLabel = methodMap[data.method] || data.method;

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [['CONCEPTO / MENSUALIDAD', 'MÉTODO PAGO', 'REFERENCIA', 'MONTO ($)', 'MONTO (BS.)']],
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
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Observaciones si existen
  let currentY = (doc as any).lastAutoTable.finalY + 12;
  if (data.notes) {
    doc.setFontSize(9);
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
  doc.text('Firma Autorizada / Sello Colegio', 25, currentY + 30);
  doc.text('Firma y Conformidad del Representante', 137, currentY + 30);

  doc.text('Este documento es un comprobante de pago electrónico emitido por el Colegio Ramón Pierluissi.', 14, 285);

  // Descargar PDF
  doc.save(`Recibo_${data.receiptNumber}.pdf`);
}
