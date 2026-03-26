import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        scores: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        userCharity: {
          include: { charity: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, scores } = body; // Simplified score updates

    // Clear and re-insert scores (for simplicity)
    await prisma.score.deleteMany({
      where: { userId },
    });

    for (const val of scores) {
      await prisma.score.create({
        data: {
          userId,
          value: parseInt(val),
        },
      });
    }

    return NextResponse.json({ message: 'Scores updated' });
  } catch (error) {
    console.error('Admin score update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
