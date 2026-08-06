import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data and seeding U.E. Ramón Pierluissi Ramírez real content...');

  await prisma.payment.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.student.deleteMany();
  await prisma.representative.deleteMany();
  await prisma.grade.deleteMany();

  // Configuración Real de la Institución
  await prisma.schoolConfig.upsert({
    where: { id: 'default' },
    update: {
      name: 'U.E. Ramón Pierluissi Ramírez',
      rif: 'J-31489201-4',
      phone: '+58 414-7890123',
      email: 'admonpierluissi@gmail.com',
      address: 'Av. Principal de Prebo II, Edif. Pierluissi. Valencia, Estado Carabobo, Venezuela.',
      bankDetails: `DATOS OFICIALES PARA RECEPCIÓN DE PAGOS:
• Pago Móvil: Banesco (0134) - C.I / RIF: J-31489201-4 - Teléfono: 0414-7890123
• Transferencia Bolívares: Banesco Cta. Corriente #0134-0100-52-1000123456 (U.E. Ramón Pierluissi Ramírez)
• Zelle: admonpierluissi@gmail.com (Titular: Pierluissi Education Corp)
• Recepción de Caja: Sede Prebo II, Valencia`,
    },
    create: {
      id: 'default',
      name: 'U.E. Ramón Pierluissi Ramírez',
      rif: 'J-31489201-4',
      phone: '+58 414-7890123',
      email: 'admonpierluissi@gmail.com',
      address: 'Av. Principal de Prebo II, Edif. Pierluissi. Valencia, Estado Carabobo, Venezuela.',
      bankDetails: `DATOS OFICIALES PARA RECEPCIÓN DE PAGOS:
• Pago Móvil: Banesco (0134) - C.I / RIF: J-31489201-4 - Teléfono: 0414-7890123
• Transferencia Bolívares: Banesco Cta. Corriente #0134-0100-52-1000123456 (U.E. Ramón Pierluissi Ramírez)
• Zelle: admonpierluissi@gmail.com (Titular: Pierluissi Education Corp)
• Recepción de Caja: Sede Prebo II, Valencia`,
    },
  });

  // Tasa BCV inicial
  await prisma.bcvRate.create({
    data: {
      rate: 105.80,
    },
  });

  // Grados / Niveles Académicos del Colegio
  const gMaternal = await prisma.grade.create({
    data: { name: 'Maternal y Preescolar', section: 'A', monthlyFeeUsd: 45.0 },
  });
  const gPrimaria1 = await prisma.grade.create({
    data: { name: '1er a 3er Grado (Educación Básica)', section: 'A', monthlyFeeUsd: 50.0 },
  });
  const gPrimaria2 = await prisma.grade.create({
    data: { name: '4to a 6to Grado (Educación Básica)', section: 'A', monthlyFeeUsd: 50.0 },
  });
  const gBachillerato = await prisma.grade.create({
    data: { name: 'Bachillerato (Educación Media General)', section: 'A', monthlyFeeUsd: 60.0 },
  });

  // Representantes de Prueba
  const rep1 = await prisma.representative.create({
    data: {
      name: 'Carmen Rodríguez de Mendoza',
      cedula: 'V-15.420.198',
      phone: '+584141234567',
      email: 'carmen.rodriguez@gmail.com',
      address: 'Urb. Prebo II, Calle 134, Valencia',
    },
  });

  const rep2 = await prisma.representative.create({
    data: {
      name: 'Dr. José Luis Mendoza',
      cedula: 'V-12.890.344',
      phone: '+584129876543',
      email: 'jlmendoza@gmail.com',
      address: 'Urb. El Recreo, Res. Las Palmeras, Valencia',
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
      gradeId: gMaternal.id,
    },
  });

  const st2 = await prisma.student.create({
    data: {
      firstName: 'Sofia',
      lastName: 'Mendoza Rodríguez',
      cedula: 'E-84.120.302',
      scholarshipPercent: 10,
      representativeId: rep1.id,
      gradeId: gPrimaria1.id,
    },
  });

  const st3 = await prisma.student.create({
    data: {
      firstName: 'Alejandro',
      lastName: 'Mendoza Salazar',
      cedula: 'V-31.542.990',
      scholarshipPercent: 0,
      representativeId: rep2.id,
      gradeId: gBachillerato.id,
    },
  });

  // Mensualidades iniciales
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

  await prisma.payment.create({
    data: {
      studentFeeId: fee1.id,
      paymentDate: new Date('2026-09-03'),
      method: 'PAGO_MOVIL',
      reference: '984120',
      amountUsd: 45.0,
      amountVes: 4635.0,
      bcvRate: 103.0,
      notes: 'Pago Móvil Banesco',
      receiptNumber: 'REC-2026-0001',
    },
  });

  await prisma.studentFee.create({
    data: {
      studentId: st1.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 45.0,
      paidUsd: 0.0,
      status: 'OVERDUE',
      dueDate: new Date('2026-10-05'),
    },
  });

  await prisma.studentFee.create({
    data: {
      studentId: st2.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 45.0,
      paidUsd: 0.0,
      status: 'OVERDUE',
      dueDate: new Date('2026-10-05'),
    },
  });

  const fee3 = await prisma.studentFee.create({
    data: {
      studentId: st3.id,
      conceptName: 'Mensualidad Octubre 2026',
      amountUsd: 60.0,
      paidUsd: 30.0,
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
      amountUsd: 30.0,
      amountVes: 3174.0,
      bcvRate: 105.8,
      notes: 'Abono parcial por Zelle',
      receiptNumber: 'REC-2026-0002',
    },
  });

  console.log('Successfully re-seeded U.E. Ramón Pierluissi Ramírez database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
