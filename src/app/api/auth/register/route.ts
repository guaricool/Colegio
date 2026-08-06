import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, firstName, lastName, password, role } = body;

    if (!email || !username || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (Correo, Usuario, Nombre, Apellido y Contraseña)' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Verificar si el correo o usuario ya existe
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'El correo electrónico o nombre de usuario ya está registrado' }, { status: 400 });
    }

    // Definir rol (Si es cpierluissis@gmail.com asignar SUPER_ADMIN automáticamente)
    let assignedRole = role || 'ADMIN';
    if (cleanEmail === 'cpierluissis@gmail.com') {
      assignedRole = 'SUPER_ADMIN';
    }

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        firstName,
        lastName,
        password,
        role: assignedRole,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
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
    console.error('Error en registro de usuario:', error);
    return NextResponse.json({ error: 'Error al registrar el usuario' }, { status: 500 });
  }
}
