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

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [totalUsers, activeSubscriptions, winners, charities, draws] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.winner.findMany({
        include: { user: { include: { userCharity: { include: { charity: true } } } } },
      }),
      prisma.charity.findMany({
        include: { _count: { select: { userCharities: true } } },
      }),
      prisma.draw.findMany({ where: { status: 'completed' } }),
    ]);

    // FIX: Explicitly type 'sum' and 'w' to prevent "Implicit Any" error
    const totalPrizePool = winners.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

    let totalCharityContributions = 0;
    const charityTotalsMap: Record<string, { name: string; total: number; supporters: number }> = {};

    charities.forEach((charity: any) => {
      charityTotalsMap[charity.id] = {
        name: charity.name,
        total: 0,
        supporters: charity._count.userCharities,
      };
    });

    winners.forEach((winner: any) => {
      const userCharity = winner.user?.userCharity;
      if (userCharity && userCharity.charityId) {
        const deduction = parseFloat(((winner.amount * userCharity.percentage) / 100).toFixed(2));
        totalCharityContributions += deduction;
        if (charityTotalsMap[userCharity.charityId]) {
          charityTotalsMap[userCharity.charityId].total += deduction;
        }
      }
    });

    const charityBreakdown = Object.values(charityTotalsMap)
      .map((c: any) => ({ ...c, total: parseFloat(c.total.toFixed(2)) }))
      .sort((a: any, b: any) => b.total - a.total);

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalPrizePool: parseFloat(totalPrizePool.toFixed(2)),
      totalCharityContributions: parseFloat(totalCharityContributions.toFixed(2)),
      charityBreakdown,
      drawStats: {
        totalDraws: draws.length,
        totalWinners: winners.length,
        tier1Count: winners.filter((w: any) => w.matchType === 'tier1').length,
        tier2Count: winners.filter((w: any) => w.matchType === 'tier2').length,
        tier3Count: winners.filter((w: any) => w.matchType === 'tier3').length,
        pendingPayouts: winners.filter((w: any) => w.status === 'pending').length,
        paidPayouts: winners.filter((w: any) => w.status === 'paid').length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}