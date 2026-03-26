export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const scoreSchema = z.object({
  value: z.number().min(1).max(45),
  date: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload: any = await verifyToken(token);
    const body = await request.json();
    const { value, date } = scoreSchema.parse(body);

    const existingScores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'asc' },
    });

    if (existingScores.length >= 5) {
      await prisma.score.delete({ where: { id: existingScores[0].id } });
    }

    await prisma.score.create({
      data: { userId: payload.userId, value, date: date ? new Date(date) : new Date() },
    });

    const updatedScores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ scores: updatedScores });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload: any = await verifyToken(token);

    const scores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}