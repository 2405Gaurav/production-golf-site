export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const proofSchema = z.object({
  winnerId: z.string(),
  fileUrl: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload: any = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { winnerId, fileUrl } = proofSchema.parse(body);

    const winner = await prisma.winner.findUnique({ where: { id: winnerId } });

    if (!winner || winner.userId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 404 });
    }

    const proof = await prisma.proof.upsert({
      where: { winnerId },
      update: { fileUrl, status: 'pending' },
      create: { winnerId, fileUrl, status: 'pending' },
    });

    return NextResponse.json({ proof });
  } catch (error: any) {
    console.error('Proof upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}