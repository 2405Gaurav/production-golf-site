export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload: any = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Always fetch subscription first
    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.userId },
    });

    const isActive = subscription?.status === 'active';

    // If not subscribed, return early — only send subscription so the
    // frontend can show the upgrade UI without leaking any real data
    if (!isActive) {
      return NextResponse.json({
        subscription,
        scores: [],
        userCharity: null,
        totalWinnings: 0,
        totalGross: 0,
        totalCharityDeduction: 0,
        charityPercentage: 0,
        latestDraw: null,
        winners: [],
      });
    }

    // Subscribed — fetch everything
    const [scores, userCharity, winners, latestDraw] = await Promise.all([
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
        where: { userId: payload.userId, draw: { status: 'completed' } },
        include: { draw: true, proof: true },
        orderBy: { id: 'desc' },
      }),
      prisma.draw.findFirst({
        where: { status: 'completed' },
        orderBy: { date: 'desc' },
      }),
    ]);

    const charityPercentage = userCharity?.percentage ?? 0;
    const winnersWithBreakdown = winners.map((winner: any) => {
      const charityDeduction = parseFloat(((winner.amount * charityPercentage) / 100).toFixed(2));
      const netAmount = parseFloat((winner.amount - charityDeduction).toFixed(2));
      return {
        ...winner,
        grossAmount: winner.amount,
        charityDeduction,
        charityPercentage,
        charityName: userCharity?.charity?.name ?? null,
        netAmount,
      };
    });

    const totalGross = winners.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);
    const totalCharityDeduction = parseFloat(((totalGross * charityPercentage) / 100).toFixed(2));
    const totalWinnings = parseFloat((totalGross - totalCharityDeduction).toFixed(2));

    return NextResponse.json({
      subscription, scores, userCharity, totalWinnings, totalGross,
      totalCharityDeduction, charityPercentage, latestDraw, winners: winnersWithBreakdown,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}