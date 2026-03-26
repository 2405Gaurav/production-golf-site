import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// Disable body parsing — we need the raw body for signature verification
export const dynamic = 'force-dynamic';

function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Always verify webhook authenticity first
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;

    console.log('Razorpay webhook received:', eventType);

    switch (eventType) {
      // Payment captured — activate subscription
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const userId = payment.notes?.userId;
        const plan = payment.notes?.plan;

        if (userId && plan) {
          await prisma.subscription.upsert({
            where: { userId },
            update: { plan, status: 'active', startDate: new Date() },
            create: { userId, plan, status: 'active' },
          });
          console.log(`Subscription activated for user ${userId} on plan ${plan}`);
        }
        break;
      }

      // Payment failed — mark inactive if previously active
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const userId = payment.notes?.userId;

        if (userId) {
          await prisma.subscription.updateMany({
            where: { userId, status: 'active' },
            data: { status: 'inactive' },
          });
          console.log(`Subscription deactivated for user ${userId} due to payment failure`);
        }
        break;
      }

      // Subscription charged (recurring) — keep active
      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;

        if (userId) {
          await prisma.subscription.updateMany({
            where: { userId },
            data: { status: 'active' },
          });
        }
        break;
      }

      // Subscription cancelled
      case 'subscription.cancelled':
      case 'subscription.completed': {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;

        if (userId) {
          await prisma.subscription.updateMany({
            where: { userId },
            data: { status: 'inactive' },
          });
          console.log(`Subscription cancelled/completed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}