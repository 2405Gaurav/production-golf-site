import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { charitySchema } from '@/lib/validations';

async function getAdminPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET() {
  try {
    const payload = await getAdminPayload();
    if (!payload) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const charities = await prisma.charity.findMany({
      include: { _count: { select: { userCharities: true } } },
    });

    return NextResponse.json({ charities });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getAdminPayload();
    if (!payload) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { name, description } = charitySchema.parse(body);

    const charity = await prisma.charity.create({ data: { name, description } });
    return NextResponse.json({ charity });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await getAdminPayload();
    if (!payload) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { id, name, description } = body;

    if (!id) return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });

    const { name: validName, description: validDesc } = charitySchema.parse({ name, description });

    const charity = await prisma.charity.update({
      where: { id },
      data: { name: validName, description: validDesc },
    });

    return NextResponse.json({ charity });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}