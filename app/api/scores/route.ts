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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { value, date } = scoreSchema.parse(body);

    // Get current scores ordered oldest first
    const existingScores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'asc' },
    });

    // If already 5 scores, delete the oldest one
    if (existingScores.length >= 5) {
      await prisma.score.delete({
        where: { id: existingScores[0].id },
      });
    }

    // Add new score
    const score = await prisma.score.create({
      data: {
        userId: payload.userId,
        value,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Return updated scores in reverse chronological order
    const updatedScores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ score, scores: updatedScores });
  } catch (error) {
    console.error('Score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


const patchSchema = z.object({
  scoreId: z.string(),
  value: z.number().min(1).max(45),
  date: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { scoreId, value, date } = patchSchema.parse(body);

    // Make sure the score belongs to this user
    const existing = await prisma.score.findUnique({ where: { id: scoreId } });
    if (!existing || existing.userId !== payload.userId) {
      return NextResponse.json({ error: 'Score not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.score.update({
      where: { id: scoreId },
      data: {
        value,
        date: date ? new Date(date) : existing.date,
      },
    });

    const updatedScores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ score: updated, scores: updatedScores });
  } catch (error) {
    console.error('Score update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const scores = await prisma.score.findMany({
      where: { userId: payload.userId },
      orderBy: { date: 'desc' }, // most recent first per PRD
    });

    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}