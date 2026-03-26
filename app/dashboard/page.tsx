'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScoresCard from '@/components/dashboard/Scorescard';
import CharityCard from '@/components/dashboard/Charitycard';
import WinningsCard from '@/components/dashboard/Winningscard';
import LatestDrawCard from '@/components/dashboard/Latestdrawcard';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface WinnerWithBreakdown {
  id: string;
  matchType: string;
  status: string;
  grossAmount: number;
  charityDeduction: number;
  charityPercentage: number;
  charityName: string | null;
  netAmount: number;
  draw: any;
  proof?: { status: string } | null;
}

interface DashboardData {
  subscription: any;
  scores: any[];
  userCharity: any;
  totalWinnings: number;
  totalGross: number;
  totalCharityDeduction: number;
  charityPercentage: number;
  latestDraw: any;
  winners: WinnerWithBreakdown[];
}

const PLANS = {
  monthly: { label: 'Monthly', price: '₹299/mo', description: 'Billed every month. Cancel anytime.' },
  yearly:  { label: 'Yearly',  price: '₹2,499/yr', description: 'Billed annually. Save ~30%.' },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null); // plan being processed
  const router = useRouter();

  const isSubscribed = data?.subscription?.status === 'active';

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        setData(await response.json());
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchCharities = useCallback(async () => {
    try {
      const response = await fetch('/api/charities');
      if (response.ok) {
        const result = await response.json();
        setCharities(result.charities);
      }
    } catch (error) {
      console.error('Error fetching charities:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchCharities();
  }, [fetchDashboardData, fetchCharities]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setSubscribing(plan);
    try {
      // Step 1: Create order on backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!orderRes.ok) {
        alert('Failed to initiate payment. Please try again.');
        return;
      }

      const orderData = await orderRes.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Golf Club',
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: {
          email: orderData.userEmail,
        },
        theme: {
          color: '#15803d', // green-700
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify payment on backend and activate subscription
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              plan,
            }),
          });

          if (verifyRes.ok) {
            // Step 4: Refresh dashboard — gates unlock immediately
            await fetchDashboardData();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setSubscribing(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setSubscribing(null);
      });
      rzp.open();
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      const response = await fetch('/api/subscription', { method: 'DELETE' });
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const scrollToSubscribe = () => {
    document.getElementById('subscription-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Razorpay checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-gray-50">
        {/* Sticky Nav */}
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-green-800">⛳ Dashboard</h1>
              <div className="flex items-center gap-3">
                {!isSubscribed && (
                  <Button
                    size="sm"
                    className="bg-green-700 hover:bg-green-800 text-white"
                    onClick={scrollToSubscribe}
                  >
                    🔓 Subscribe to unlock features
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Subscription Section ── */}
          <div id="subscription-section" className="mb-10 scroll-mt-24">
            <Card className={isSubscribed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {isSubscribed ? '✅ Active Subscription' : '🔒 No Active Subscription'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isSubscribed
                        ? `You are on the ${data?.subscription?.plan} plan. All features are unlocked.`
                        : 'Choose a plan to unlock scores, draws, charity giving, and winnings.'}
                    </CardDescription>
                  </div>
                  {isSubscribed && (
                    <Badge className="bg-green-600 text-white capitalize">
                      {data?.subscription?.plan}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isSubscribed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    Cancel Subscription
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Monthly */}
                    <div className="flex-1 border border-gray-200 rounded-lg p-5 bg-white">
                      <p className="font-semibold text-gray-800 text-base">{PLANS.monthly.label}</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">{PLANS.monthly.price}</p>
                      <p className="text-sm text-gray-500 mt-1 mb-4">{PLANS.monthly.description}</p>
                      <Button
                        className="w-full bg-green-700 hover:bg-green-800 text-white"
                        disabled={subscribing !== null}
                        onClick={() => handleSubscribe('monthly')}
                      >
                        {subscribing === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
                      </Button>
                    </div>

                    {/* Yearly */}
                    <div className="flex-1 border-2 border-green-600 rounded-lg p-5 bg-white relative">
                      <span className="absolute -top-3 left-4 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Best Value
                      </span>
                      <p className="font-semibold text-gray-800 text-base">{PLANS.yearly.label}</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">{PLANS.yearly.price}</p>
                      <p className="text-sm text-gray-500 mt-1 mb-4">{PLANS.yearly.description}</p>
                      <Button
                        className="w-full bg-green-700 hover:bg-green-800 text-white"
                        disabled={subscribing !== null}
                        onClick={() => handleSubscribe('yearly')}
                      >
                        {subscribing === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Feature Grid ── */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ScoresCard
                subscription={data?.subscription ?? null}
                scores={data?.scores ?? []}
                onRefresh={fetchDashboardData}
                onSubscribe={scrollToSubscribe}
              />
              <CharityCard
                subscription={data?.subscription ?? null}
                charities={charities}
                userCharity={data?.userCharity ?? null}
                onRefresh={fetchDashboardData}
                onSubscribe={scrollToSubscribe}
              />
            </div>
            <div className="space-y-8">
              <WinningsCard
                subscription={data?.subscription ?? null}
                winners={data?.winners ?? []}
                totalGross={data?.totalGross ?? 0}
                totalCharityDeduction={data?.totalCharityDeduction ?? 0}
                totalWinnings={data?.totalWinnings ?? 0}
                charityPercentage={data?.charityPercentage ?? 0}
                userCharity={data?.userCharity ?? null}
                onRefresh={fetchDashboardData}
                onSubscribe={scrollToSubscribe}
              />
              <LatestDrawCard
                subscription={data?.subscription ?? null}
                latestDraw={data?.latestDraw ?? null}
                onSubscribe={scrollToSubscribe}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}