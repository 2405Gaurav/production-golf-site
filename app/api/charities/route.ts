import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const charities = await prisma.charity.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ charities });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}