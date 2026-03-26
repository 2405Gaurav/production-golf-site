import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        scores: { orderBy: { date: 'desc' }, take: 5 },
        userCharity: { include: { charity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — edit profile, scores, or subscription for a user
export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { userId, action, ...payload } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // ── Edit profile (email) ──────────────────────────────────────────
    if (action === 'update_profile') {
      const { email } = payload;
      if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { email },
        select: { id: true, email: true, role: true },
      });
      return NextResponse.json({ user: updated });
    }

    // ── Edit scores ───────────────────────────────────────────────────
    if (action === 'update_scores') {
      const { scores } = payload; // number[]
      if (!Array.isArray(scores)) {
        return NextResponse.json({ error: 'scores must be an array' }, { status: 400 });
      }
      const invalid = scores.some((v) => v < 1 || v > 45);
      if (invalid) {
        return NextResponse.json({ error: 'All scores must be between 1 and 45' }, { status: 400 });
      }
      if (scores.length > 5) {
        return NextResponse.json({ error: 'Maximum 5 scores allowed' }, { status: 400 });
      }

      await prisma.score.deleteMany({ where: { userId } });
      await prisma.score.createMany({
        data: scores.map((value: number) => ({ userId, value })),
      });
      return NextResponse.json({ message: 'Scores updated' });
    }

    // ── Manage subscription ───────────────────────────────────────────
    if (action === 'update_subscription') {
      const { plan, status } = payload; // plan: monthly|yearly, status: active|inactive
      const validPlans = ['monthly', 'yearly'];
      const validStatuses = ['active', 'inactive'];

      if (plan && !validPlans.includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      if (status && !validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const existing = await prisma.subscription.findUnique({ where: { userId } });
      if (existing) {
        const updated = await prisma.subscription.update({
          where: { userId },
          data: { ...(plan && { plan }), ...(status && { status }) },
        });
        return NextResponse.json({ subscription: updated });
      } else {
        if (!plan) return NextResponse.json({ error: 'plan is required to create a subscription' }, { status: 400 });
        const created = await prisma.subscription.create({
          data: { userId, plan, status: status ?? 'active' },
        });
        return NextResponse.json({ subscription: created });
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — kept for legacy score replacement
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const { userId, scores } = body;

    await prisma.score.deleteMany({ where: { userId } });
    for (const val of scores) {
      await prisma.score.create({ data: { userId, value: parseInt(val) } });
    }

    return NextResponse.json({ message: 'Scores updated' });
  } catch (error) {
    console.error('Admin score update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}