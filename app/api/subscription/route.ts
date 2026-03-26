import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const payload = await requireUser();
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.userId },
    });

    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireUser();
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { plan } = await request.json();
    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: payload.userId },
      update: { plan, status: 'active', startDate: new Date() },
      create: { userId: payload.userId, plan, status: 'active' },
    });

    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const payload = await requireUser();
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const existing = await prisma.subscription.findUnique({
      where: { userId: payload.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const subscription = await prisma.subscription.update({
      where: { userId: payload.userId },
      data: { status: 'inactive' },
    });

    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}