import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando base de datos y configurando entorno de producción real para U.E. Ramón Pierluissi Ramírez...');

  await prisma.payment.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.student.deleteMany();
  await prisma.representative.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.bcvRate.deleteMany();

  await prisma.schoolConfig.upsert({
    where: { id: 'default' },
    update: {
      name: 'U.E. Ramón Pierluissi Ramírez',
      rif: 'J-31489201-4',
      phone: '+58 414-7890123',
      email: 'admonpierluissi@gmail.com',
      address: 'Prebo II, Valencia, Carabobo',
      pagoMovilBank: 'Banesco (0134)',
      pagoMovilPhone: '0414-7890123',
      pagoMovilRif: 'J-31489201-4',
      zelleEmail: 'pagos@colegioramonpierluissi.com',
      zelleName: 'Colegio Ramón Pierluissi C.A.',
    },
    create: {
      id: 'default',
      name: 'U.E. Ramón Pierluissi Ramírez',
      rif: 'J-31489201-4',
      phone: '+58 414-7890123',
      email: 'admonpierluissi@gmail.com',
      address: 'Prebo II, Valencia, Carabobo',
      pagoMovilBank: 'Banesco (0134)',
      pagoMovilPhone: '0414-7890123',
      pagoMovilRif: 'J-31489201-4',
      zelleEmail: 'pagos@colegioramonpierluissi.com',
      zelleName: 'Colegio Ramón Pierluissi C.A.',
    },
  });

  let initialUsdRate = 75.51;
  let initialEurRate = 81.20;
  try {
    const [usdRes, eurRes] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetch('https://ve.dolarapi.com/v1/euros/oficial'),
    ]);
    const usdJson = await usdRes.json();
    const eurJson = await eurRes.json();
    if (usdJson.promedio) initialUsdRate = parseFloat(usdJson.promedio);
    if (eurJson.promedio) initialEurRate = parseFloat(eurJson.promedio);
  } catch (e) {
    console.log('Uso de tasas base de respaldo.');
  }

  await prisma.bcvRate.create({
    data: {
      rate: initialUsdRate,
      eurRate: initialEurRate,
    },
  });

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

  console.log('✅ Base de datos configurada para producción real con soporte dual USD/EUR.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
