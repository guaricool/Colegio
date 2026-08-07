import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function sanitize(input: string): string {
  return input ? input.replace(/<[^>]*>?/gm, '').trim() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error al obtener lista de usuarios:', error);
    return NextResponse.json({ error: 'Error al consultar usuarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, firstName, lastName, password, role } = body;

    if (!email || !username || !firstName || !lastName || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const cleanEmail = sanitize(email).toLowerCase();
    const cleanUsername = sanitize(username).toLowerCase();
    const cleanFirstName = sanitize(firstName);
    const cleanLastName = sanitize(lastName);

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'El correo electrónico no es válido' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'El correo o nombre de usuario ya existe' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        password,
        role: role || 'COBRANZA',
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error('Error al crear usuario de personal:', error);
    return NextResponse.json({ error: 'Error al registrar nuevo usuario' }, { status: 500 });
  }
}
