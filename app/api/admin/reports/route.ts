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

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalUsers,
      activeSubscriptions,
      winners,
      userCharities,
      charities,
      draws,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.winner.findMany({
        include: {
          user: { include: { userCharity: { include: { charity: true } } } },
        },
      }),
      prisma.userCharity.findMany({ include: { charity: true } }),
      prisma.charity.findMany({
        include: { _count: { select: { userCharities: true } } },
      }),
      prisma.draw.findMany({ where: { status: 'completed' } }),
    ]);

    // Total prize pool = sum of all winner gross amounts
    const totalPrizePool = winners.reduce((sum, w) => sum + w.amount, 0);

    // Charity contributions: for each winner, apply their charity percentage
    let totalCharityContributions = 0;
    const charityTotalsMap: Record<string, { name: string; total: number; supporters: number }> = {};

    for (const charity of charities) {
      charityTotalsMap[charity.id] = {
        name: charity.name,
        total: 0,
        supporters: charity._count.userCharities,
      };
    }

    for (const winner of winners) {
      const userCharity = winner.user?.userCharity;
      if (userCharity && userCharity.charityId) {
        const deduction = parseFloat(
          ((winner.amount * userCharity.percentage) / 100).toFixed(2)
        );
        totalCharityContributions += deduction;
        if (charityTotalsMap[userCharity.charityId]) {
          charityTotalsMap[userCharity.charityId].total += deduction;
        }
      }
    }

    const charityBreakdown = Object.values(charityTotalsMap)
      .map((c) => ({ ...c, total: parseFloat(c.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);

    // Draw stats
    const tier1Count = winners.filter((w) => w.matchType === 'tier1').length;
    const tier2Count = winners.filter((w) => w.matchType === 'tier2').length;
    const tier3Count = winners.filter((w) => w.matchType === 'tier3').length;
    const pendingPayouts = winners.filter((w) => w.status === 'pending').length;
    const paidPayouts = winners.filter((w) => w.status === 'paid').length;

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalPrizePool: parseFloat(totalPrizePool.toFixed(2)),
      totalCharityContributions: parseFloat(totalCharityContributions.toFixed(2)),
      charityBreakdown,
      drawStats: {
        totalDraws: draws.length,
        totalWinners: winners.length,
        tier1Count,
        tier2Count,
        tier3Count,
        pendingPayouts,
        paidPayouts,
      },
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}