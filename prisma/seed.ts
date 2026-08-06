import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Configurando usuarios administrativos y entorno de producción para U.E. Ramón Pierluissi Ramírez...');

  // Crear usuario SuperAdmin por defecto (cpierluissis@gmail.com) con acceso total 100%
  await prisma.user.upsert({
    where: { email: 'cpierluissis@gmail.com' },
    update: {
      role: 'SUPER_ADMIN',
      username: 'cpierluissis',
      firstName: 'Carlos',
      lastName: 'Pierluissi',
    },
    create: {
      email: 'cpierluissis@gmail.com',
      username: 'cpierluissis',
      firstName: 'Carlos',
      lastName: 'Pierluissi',
      password: 'admin123superpassword', // En producción cambiar o usar hash
      role: 'SUPER_ADMIN',
    },
  });

  // Configuración Oficial Real de la Institución
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

  const hasBcvRate = await prisma.bcvRate.findFirst();
  if (!hasBcvRate) {
    await prisma.bcvRate.create({
      data: {
        rate: initialUsdRate,
        eurRate: initialEurRate,
      },
    });
  }

  console.log('✅ SuperAdmin registrado (cpierluissis@gmail.com) y base de datos lista.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
