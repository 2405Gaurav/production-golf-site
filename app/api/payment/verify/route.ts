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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = await request.json();

    // Verify the payment signature — this is the security check
    const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Activate subscription in DB
    const subscription = await prisma.subscription.upsert({
      where: { userId: payload.userId },
      update: {
        plan,
        status: 'active',
        startDate: new Date(),
      },
      create: {
        userId: payload.userId,
        plan,
        status: 'active',
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}