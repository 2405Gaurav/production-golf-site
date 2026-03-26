// 1. CRITICAL: Add this to fix the "Dynamic Server Usage" error in Vercel build
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 2. In Next.js 13.5.1, cookies() is synchronous. Remove 'await' to avoid TS warnings.
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // 3. Cast payload to 'any' or your custom type to avoid "property does not exist" errors
    const payload: any = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const winners = await prisma.winner.findMany({
      include: { user: true, draw: true, proof: true },
      orderBy: { draw: { date: 'desc' } },
    });

    return NextResponse.json({ winners });
  } catch (error) {
    console.error('Admin winners error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload: any = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 4. Explicitly type the body to prevent "implicit any" on destructured properties
    const body = await request.json();
    const { winnerId, status, proofId, proofStatus } = body as {
      winnerId?: string;
      status?: any;
      proofId?: string;
      proofStatus?: any;
    };

    if (proofId && proofStatus) {
      await prisma.proof.update({ 
        where: { id: proofId }, 
        data: { status: proofStatus } 
      });
    }

    if (winnerId && status) {
      await prisma.winner.update({ 
        where: { id: winnerId }, 
        data: { status } 
      });
    }

    return NextResponse.json({ message: 'Update successful' });
  } catch (error) {
    console.error('Admin winner update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}