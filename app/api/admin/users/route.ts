export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { userId, action, ...payload } = body;

    if (action === 'update_scores') {
      const { scores } = payload;
      if (!Array.isArray(scores)) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

      await prisma.score.deleteMany({ where: { userId } });
      // FIX: Type the map variable
      await prisma.score.createMany({
        data: scores.map((val: number) => ({ userId, value: val })),
      });
      return NextResponse.json({ message: 'Updated' });
    }
    // ... rest of your patch logic
    return NextResponse.json({ message: 'Success' });
  } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, scores } = await request.json();
    await prisma.score.deleteMany({ where: { userId } });
    
    // FIX: cast scores as any[] to allow iteration without TS error
    for (const val of (scores as any[])) {
      await prisma.score.create({ 
        data: { userId, value: typeof val === 'string' ? parseInt(val) : val } 
      });
    }
    return NextResponse.json({ message: 'Success' });
  } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}