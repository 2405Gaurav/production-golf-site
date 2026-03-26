export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload: any = await verifyToken(token);
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = await request.json();

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: payload.userId },
      update: { plan, status: 'active', startDate: new Date(), razorpayPaymentId, razorpayOrderId },
      create: { userId: payload.userId, plan, status: 'active', razorpayPaymentId, razorpayOrderId },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}