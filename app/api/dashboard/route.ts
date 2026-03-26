import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const [subscription, scores, userCharity, winners, latestDraw] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId: payload.userId } }),
      prisma.score.findMany({
        where: { userId: payload.userId },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.userCharity.findUnique({
        where: { userId: payload.userId },
        include: { charity: true },
      }),
      prisma.winner.findMany({
        where: {
          userId: payload.userId,
          draw: { status: 'completed' }, // only published draws
        },
        include: { draw: true },
      }),
      prisma.draw.findFirst({
        where: { status: 'completed' }, // only published draws
        orderBy: { date: 'desc' },
      }),
    ]);

    const totalWinnings = winners.reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({ subscription, scores, userCharity, totalWinnings, latestDraw, winners });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}