import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier = email or username

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Correo/Usuario y contraseña requeridos' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Buscar usuario por correo o nombre de usuario
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado o credenciales inválidas' }, { status: 401 });
    }

    // Verificar contraseña (en desarrollo o producción)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: `Bienvenido, ${user.firstName} ${user.lastName}`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error en login de administrador:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
