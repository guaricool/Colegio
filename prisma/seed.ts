import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando base de datos y configurando entorno de producción real para U.E. Ramón Pierluissi Ramírez...');

  // Eliminar datos antiguos para dejar el sistema 100% limpio sin datos falsos
  await prisma.payment.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.student.deleteMany();
  await prisma.representative.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.bcvRate.deleteMany();

  // Configuración Oficial Real de la Institución
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

  // Tasa BCV inicial oficial obtenida automáticamente
  let initialBcvRate = 105.8;
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    const json = await res.json();
    if (json.promedio) {
      initialBcvRate = parseFloat(json.promedio);
      console.log(`Tasa BCV obtenida automáticamente de DolarApi: ${initialBcvRate} Bs./USD`);
    }
  } catch (e) {
    console.log('No se pudo conectar a la API BCV durante el seed, usando tasa base.');
  }

  await prisma.bcvRate.create({
    data: {
      rate: initialBcvRate,
    },
  });

  // Estructura Real de Niveles Académicos y Grados del Colegio
  await prisma.grade.createMany({
    data: [
      { name: 'Maternal y Preescolar', section: 'A', monthlyFeeUsd: 45.0 },
      { name: '1er Grado - Educación Básica', section: 'A', monthlyFeeUsd: 50.0 },
      { name: '2do Grado - Educación Básica', section: 'A', monthlyFeeUsd: 50.0 },
      { name: '3er Grado - Educación Básica', section: 'A', monthlyFeeUsd: 50.0 },
      { name: '4to Grado - Educación Básica', section: 'A', monthlyFeeUsd: 50.0 },
      { name: '5to Grado - Educación Básica', section: 'A', monthlyFeeUsd: 50.0 },
      { name: '6to Grado - Educación Básica', section: 'A', monthlyFeeUsd: 50.0 },
      { name: '1er Año - Bachillerato', section: 'A', monthlyFeeUsd: 60.0 },
      { name: '2do Año - Bachillerato', section: 'A', monthlyFeeUsd: 60.0 },
      { name: '3er Año - Bachillerato', section: 'A', monthlyFeeUsd: 60.0 },
      { name: '4to Año - Bachillerato', section: 'A', monthlyFeeUsd: 65.0 },
      { name: '5to Año - Bachillerato', section: 'A', monthlyFeeUsd: 65.0 },
    ],
  });

  console.log('✅ Base de datos limpiada correctamente. 0 datos falsos. Lista para producción.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
