import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Configuración del Colegio
  await prisma.schoolConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Colegio Ramón Pierluissi',
      rif: 'J-31489201-4',
      phone: '+58 414-7890123',
      email: 'admin@colegioramonpierluissi.com',
      address: 'Calle Principal, Sector El Colegio, Estado Carabobo, Venezuela',
      bankDetails: `DATOS PARA PAGOS:
• Pago Móvil: Banesco (0134) - C.I: 14.582.910 - Teléfono: 0414-7890123
• Transferencia VES: Banesco Cta Corriente #0134-0100-52-1000123456 (Titular: Colegio Ramón Pierluissi C.A.)
• Zelle: pagos@colegioramonpierluissi.com (Titular: Ramon Pierluissi Corp)
• Efectivo: Recepción de caja en sede escolar`,
    },
  });

  // Tasa BCV inicial
  await prisma.bcvRate.create({
    data: {
      rate: 105.80,
    },
  });

  // Grados
  const g1 = await prisma.grade.create({
    data: { name: '1er Grado', section: 'A', monthlyFeeUsd: 45.0 },
  });
  const g2 = await prisma.grade.create({
    data: { name: '3er Grado', section: 'A', monthlyFeeUsd: 45.0 },
  });
  const g3 = await prisma.grade.create({
    data: { name: '1er Año Bachillerato', section: 'A', monthlyFeeUsd: 55.0 },
  });
  const g4 = await prisma.grade.create({
    data: { name: '5to Año Bachillerato', section: 'A', monthlyFeeUsd: 65.0 },
  });

  // Representantes
  const rep1 = await prisma.representative.create({
    data: {
      name: 'Carmen Rodríguez',
      cedula: 'V-15.420.198',
      phone: '+584141234567',
      email: 'carmen.rodriguez@email.com',
      address: 'Urbanización La Alegría, Casa 45',
    },
  });

  const rep2 = await prisma.representative.create({
    data: {
      name: 'José Luis Mendoza',
      cedula: 'V-12.890.344',
      phone: '+584129876543',
      email: 'jlmendoza@email.com',
      address: 'Residencias Los Jarales, Apto 4B',
    },
  });

  const rep3 = await prisma.representative.create({
    data: {
      name: 'Beatriz Salazar',
      cedula: 'V-18.234.567',
      phone: '+584245551234',
      email: 'bsalazar@email.com',
      address: 'Sector El Trabal, Av. 3',
    },
  });

  // Estudiantes
  const st1 = await prisma.student.create({
    data: {
      firstName: 'Mateo',
      lastName: 'Mendoza Rodríguez',
      cedula: 'E-84.120.301',
      scholarshipPercent: 0,
      representativeId: rep1.id,
      gradeId: g1.id,
    },
  });

  const st2 = await prisma.student.create({
    data: {
      firstName: 'Sofia',
      lastName: 'Mendoza Rodríguez',
      cedula: 'E-84.120.302',
      scholarshipPercent: 10, // Beca del 10% por hermanos
      representativeId: rep1.id,
      gradeId: g2.id,
    },
  });

  const st3 = await prisma.student.create({
    data: {
      firstName: 'Alejandro',
      lastName: 'Mendoza Salazar',
      cedula: 'V-31.542.990',
      scholarshipPercent: 0,
      representativeId: rep2.id,
      gradeId: g3.id,
    },
  });

  const st4 = await prisma.student.create({
    data: {
      firstName: 'Valeria',
      lastName: 'Salazar',
      cedula: 'V-30.881.200',
      scholarshipPercent: 0,
      representativeId: rep3.id,
      gradeId: g4.id,
    },
  });

  // Cobros / Mensualidades
  // Mateo (1er Grado: $45)
  const fee1 = await prisma.studentFee.create({
    data: {
      studentId: st1.id,
      conceptName: 'Mensualidad Septiembre 2026',
      amountUsd: 45.0,
      paidUsd: 45.0,
      status: 'PAID',
      dueDate: new Date('2026-09-05'),
    },
  });

  const fee2 = await prisma.studentFee.create({
    data: {
      studentId: st1.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 45.0,
      paidUsd: 0.0,
      status: 'OVERDUE',
      dueDate: new Date('2026-10-05'),
    },
  });

  // Pago de Septiembre para Mateo
  await prisma.payment.create({
    data: {
      studentFeeId: fee1.id,
      paymentDate: new Date('2026-09-03'),
      method: 'PAGO_MOVIL',
      reference: '984120',
      amountUsd: 45.0,
      amountVes: 4635.0, // 45 * 103.0
      bcvRate: 103.0,
      notes: 'Pago Móvil Banesco',
      receiptNumber: 'REC-2026-0001',
    },
  });

  // Sofia (3er Grado: $45 - 10% beca = $40.50)
  await prisma.studentFee.create({
    data: {
      studentId: st2.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 40.5,
      paidUsd: 0.0,
      status: 'OVERDUE',
      dueDate: new Date('2026-10-05'),
    },
  });

  // Alejandro (1er Año: $55)
  const fee3 = await prisma.studentFee.create({
    data: {
      studentId: st3.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 55.0,
      paidUsd: 20.0,
      status: 'PARTIAL',
      dueDate: new Date('2026-10-05'),
    },
  });

  await prisma.payment.create({
    data: {
      studentFeeId: fee3.id,
      paymentDate: new Date('2026-10-04'),
      method: 'ZELLE',
      reference: 'ZEL-994102',
      amountUsd: 20.0,
      amountVes: 2116.0,
      bcvRate: 105.8,
      notes: 'Abono parcial por Zelle',
      receiptNumber: 'REC-2026-0002',
    },
  });

  // Valeria (5to Año: $65)
  await prisma.studentFee.create({
    data: {
      studentId: st4.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 65.0,
      paidUsd: 0.0,
      status: 'PENDING',
      dueDate: new Date('2026-10-15'),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
