import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Prices in paise (INR × 100)
const PLANS = {
  monthly: { amount: 29900, description: 'Golf Club Monthly Subscription' },
  yearly:  { amount: 249900, description: 'Golf Club Yearly Subscription' },
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { plan } = await request.json();
    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selected = PLANS[plan as keyof typeof PLANS];

    // Receipt must be ≤ 40 chars — use last 8 chars of userId + timestamp suffix
    const shortId = payload.userId.slice(-8);
    const ts = Date.now().toString().slice(-8);
    const receipt = `rcpt_${shortId}_${ts}`; // e.g. rcpt_a1b2c3d4_12345678 = 24 chars

    const order = await razorpay.orders.create({
      amount: selected.amount,
      currency: 'INR',
      receipt,
      notes: {
        userId: payload.userId,
        plan,
        email: payload.email,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      description: selected.description,
      keyId: process.env.RAZORPAY_KEY_ID,
      userEmail: payload.email,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}