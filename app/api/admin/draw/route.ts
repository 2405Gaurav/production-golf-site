import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const simulate = body?.simulate === true;
    const mode = body?.mode || 'random'; // 'random' or 'algorithmic'

    const currentMonth = format(new Date(), 'yyyy-MM');
    const existingDraw = await prisma.draw.findFirst({
      where: { month: currentMonth, status: { not: 'draft' } },
    });

    if (existingDraw && !simulate) {
      return NextResponse.json({ error: 'Draw already exists for this month' }, { status: 400 });
    }

    // Get all scores to use for algorithmic mode
    const allScores = await prisma.score.findMany({
      select: { value: true },
    });

    const numbers = generateNumbers(mode, allScores.map((s:any) => s.value));

    if (simulate) {
      return NextResponse.json({
        simulated: true,
        mode,
        numbers,
        message: `Simulation (${mode} mode) — not saved`,
      });
    }

    // Get rollover from last completed draw
    const previousDraw = await prisma.draw.findFirst({
      where: { status: 'completed' },
      orderBy: { date: 'desc' },
    });
    const rolloverAmount = previousDraw?.rolloverAmount ?? 0;

    // Create draw in DRAFT state — admin must publish separately
    const draw = await prisma.draw.create({
      data: {
        month: currentMonth,
        numbers: JSON.stringify(numbers),
        status: 'draft', // not visible to users yet
        rolloverAmount: 0,
      },
    });

    // Process entries and winners (saved but not visible until published)
    const eligibleUsers = await prisma.user.findMany({
      where: { subscription: { status: 'active' } },
      include: { scores: { orderBy: { date: 'desc' }, take: 5 } },
    });

    for (const user of eligibleUsers) {
      if (user.scores.length === 5) {
        await prisma.entry.create({
          data: {
            userId: user.id,
            drawId: draw.id,
            scoresSnapshot: JSON.stringify(user.scores.map((s: { value: number }) => s.value)),
          },
        });
      }
    }

    await processWinners(draw.id, numbers, eligibleUsers.length, rolloverAmount);

    // Preview results for admin before publishing
    const winners = await prisma.winner.findMany({
      where: { drawId: draw.id },
      include: { user: { select: { email: true } } },
    });

    return NextResponse.json({
      draw,
      numbers,
      mode,
      winners, // admin can review before publishing
      message: 'Draw created as DRAFT. Review and publish when ready.',
    });
  } catch (error) {
    console.error('Draw error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Publish endpoint — admin confirms and makes results visible
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { drawId } = await request.json();

    const draw = await prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw || draw.status !== 'draft') {
      return NextResponse.json({ error: 'No draft draw found' }, { status: 404 });
    }

    // Publish — users can now see results on their dashboard
    await prisma.draw.update({
      where: { id: drawId },
      data: { status: 'completed' },
    });

    return NextResponse.json({ message: 'Draw published successfully. Winners notified.' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateNumbers(mode: string, allScores: number[]): number[] {
  if (mode === 'algorithmic' && allScores.length > 0) {
    // Count frequency of each score value
    const frequency: Record<number, number> = {};
    for (const score of allScores) {
      frequency[score] = (frequency[score] || 0) + 1;
    }

    // Weight: less frequent scores get higher weight (harder to match = bigger prize tension)
    const weighted: number[] = [];
    for (let i = 1; i <= 45; i++) {
      const freq = frequency[i] || 0;
      const weight = Math.max(1, 10 - freq); // rare scores weighted higher
      for (let w = 0; w < weight; w++) {
        weighted.push(i);
      }
    }

    // Pick 5 unique numbers from weighted pool
    const picked = new Set<number>();
    let attempts = 0;
    while (picked.size < 5 && attempts < 1000) {
      const idx = Math.floor(Math.random() * weighted.length);
      picked.add(weighted[idx]);
      attempts++;
    }

    // Fallback to random if not enough unique numbers
    while (picked.size < 5) {
      picked.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(picked);
  }

  // Default: pure random
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
}

async function processWinners(
  drawId: string,
  winningNumbers: number[],
  subscriberCount: number,
  rolloverAmount: number
) {
  const entries = await prisma.entry.findMany({ where: { drawId } });
  const totalPool = subscriberCount * 10 + rolloverAmount;

  const tier1: string[] = [];
  const tier2: string[] = [];
  const tier3: string[] = [];

  for (const entry of entries) {
    const userScores: number[] = JSON.parse(entry.scoresSnapshot);
    const matches = userScores.filter(s => winningNumbers.includes(s)).length;
    if (matches === 5) tier1.push(entry.userId);
    else if (matches === 4) tier2.push(entry.userId);
    else if (matches === 3) tier3.push(entry.userId);
  }

  const create = async (userIds: string[], matchType: string, pool: number) => {
    if (!userIds.length) return;
    const amount = pool / userIds.length;
    for (const userId of userIds) {
      await prisma.winner.create({
        data: { userId, drawId, matchType, amount, status: 'pending' },
      });
    }
  };

  await Promise.all([
    create(tier1, 'tier1', totalPool * 0.4),
    create(tier2, 'tier2', totalPool * 0.35),
    create(tier3, 'tier3', totalPool * 0.25),
  ]);

  const newRollover = tier1.length === 0 ? totalPool * 0.4 : 0;

  await prisma.draw.update({
    where: { id: drawId },
    data: { rolloverAmount: newRollover }, // status stays 'draft' until published
  });
}