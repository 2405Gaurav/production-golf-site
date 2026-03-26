import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { userCharitySchema } from '@/lib/validations';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // const payload = verifyToken(token);

        const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userCharity = await prisma.userCharity.findUnique({
      where: { userId: payload.userId },
      include: { charity: true },
    });

    return NextResponse.json({ userCharity });
  } catch (error) {
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
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { charityId, percentage } = userCharitySchema.parse(body);

    const userCharity = await prisma.userCharity.upsert({
      where: { userId: payload.userId },
      update: { charityId, percentage },
      create: { userId: payload.userId, charityId, percentage },
      include: { charity: true },
    });

    return NextResponse.json({ userCharity });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}