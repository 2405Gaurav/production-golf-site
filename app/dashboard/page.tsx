'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldCheck, Trophy, Target, Heart, Zap, ArrowLeft, Home } from 'lucide-react';

import ScoresCard from '@/components/dashboard/Scorescard';
import CharityCard from '@/components/dashboard/Charitycard';
import WinningsCard from '@/components/dashboard/Winningscard';
import LatestDrawCard from '@/components/dashboard/Latestdrawcard';

declare global {
  interface Window { Razorpay: any; }
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const router = useRouter();

  const isSubscribed = data?.subscription?.status === 'active';

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) setData(await response.json());
      else if (response.status === 401) router.push('/auth/login');
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchCharities = useCallback(async () => {
    try {
      const response = await fetch('/api/charities');
      if (response.ok) {
        const d = await response.json();
        setCharities(d.charities);
      }
    } catch (error) {
      console.error('Charities Fetch Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchCharities();
  }, [fetchDashboardData, fetchCharities]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!window.Razorpay) { console.error('Razorpay SDK not loaded'); return; }
    setSubscribing(plan);
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!orderRes.ok) { setSubscribing(null); return; }

      const orderData = await orderRes.json();
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Golf Club Membership',
        order_id: orderData.orderId,
        theme: { color: '#c8f04e' },
        handler: async (response: any) => {
          try {
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
            if (verifyRes.ok) await fetchDashboardData();
          } catch (err) {
            console.error('Verify error:', err);
          } finally {
            setSubscribing(null);
          }
        },
        modal: { ondismiss: () => setSubscribing(null) },
      });
      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      setSubscribing(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  };

  const handleCancelSubscription = async () => {
    await fetch('/api/subscription', { method: 'DELETE' });
    setShowCancelConfirm(false);
    await fetchDashboardData();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-[#c8f04e] text-xs uppercase tracking-[0.5em] font-bold"
      >
        Verifying Credentials...
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white selection:bg-[#c8f04e] selection:text-[#0a0f0d]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-4 flex items-center justify-between gap-4">
          
          {/* Left: Home + Title */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2 text-white/30 hover:text-[#c8f04e] transition-colors duration-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-bold hidden sm:block">Home</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold leading-none mb-1">
                Member Dashboard
              </p>
              <div className="text-lg font-bold tracking-tighter italic leading-none">
                Fairway <span className="text-white/30">Access</span>
              </div>
            </div>
          </div>

          {/* Right: Status + Logout */}
          <div className="flex items-center gap-4 sm:gap-6">
            <AnimatePresence>
              {isSubscribed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="hidden sm:flex items-center gap-2 bg-[#c8f04e]/10 border border-[#c8f04e]/20 px-3 py-1.5 rounded-full"
                >
                  <ShieldCheck className="w-3 h-3 text-[#c8f04e]" />
                  <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#c8f04e] ">
                    {data?.subscription?.plan} Member
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white/20 hover:text-white hover:bg-white/5 text-[9px] uppercase tracking-widest gap-2 px-2 h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 pb-24">

        {/* ── UNSUBSCRIBED BANNER ── */}
        <AnimatePresence>
          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-10 bg-gradient-to-r from-[#141b18] via-[#141b18] to-[#0a0f0d] border border-white/5 border-l-2 border-l-[#c8f04e] p-6 sm:p-8 rounded-xl relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 text-[#c8f04e] mb-3">
                    <Zap className="w-3.5 h-3.5 fill-[#c8f04e]" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black">Membership Required</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 italic">Elevate your impact.</h2>
                  <p className="text-white/30 text-[10px] leading-relaxed uppercase tracking-widest font-medium">
                    Unlock full tracking, monthly draw eligibility, and your chosen charity dedication.
                  </p>
                </div>

                {/* Plan buttons with pricing hint */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => handleSubscribe('monthly')}
                    disabled={!!subscribing}
                    className="group relative flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 mb-1">Monthly</span>
                    <span className="text-lg font-black tracking-tight">₹299</span>
                    <span className="text-[8px] text-white/30 mt-0.5">per month</span>
                    {subscribing === 'monthly' && <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-widest bg-[#0a0f0d]/80 rounded-lg">Loading...</span>}
                  </button>
                  <button
                    onClick={() => handleSubscribe('yearly')}
                    disabled={!!subscribing}
                    className="group relative flex flex-col items-center justify-center bg-[#c8f04e] hover:bg-[#d8ff5e] text-[#0a0f0d] px-8 py-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-[8px] uppercase tracking-[0.3em] text-[#0a0f0d]/50 mb-1">Yearly · Save 30%</span>
                    <span className="text-lg font-black tracking-tight">₹2,499</span>
                    <span className="text-[8px] text-[#0a0f0d]/40 mt-0.5">per year</span>
                    {subscribing === 'yearly' && <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-widest bg-[#c8f04e]/90 rounded-lg">Loading...</span>}
                  </button>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#c8f04e]/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-12 gap-8 xl:gap-12">

          {/* LEFT: Main Content */}
          <div className="lg:col-span-8 space-y-10">

            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
              <SectionLabel icon={<Target className="w-3.5 h-3.5 text-[#c8f04e]" />} label="Stableford Entry" />
              <ScoresCard
                subscription={data?.subscription ?? null}
                scores={data?.scores ?? []}
                onRefresh={fetchDashboardData}
                onSubscribe={() => {}}
              />
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
              <SectionLabel icon={<Heart className="w-3.5 h-3.5 text-[#c8f04e]" />} label="Charitable Focus" />
              <CharityCard
                subscription={data?.subscription ?? null}
                charities={charities}
                userCharity={data?.userCharity ?? null}
                onRefresh={fetchDashboardData}
                onSubscribe={() => {}}
              />
            </motion.div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4 space-y-10">

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
              <SectionLabel icon={<Trophy className="w-3.5 h-3.5 text-[#c8f04e]" />} label="Winnings Archive" />
              <WinningsCard
                subscription={data?.subscription ?? null}
                winners={data?.winners ?? []}
                totalGross={data?.totalGross ?? 0}
                totalCharityDeduction={data?.totalCharityDeduction ?? 0}
                totalWinnings={data?.totalWinnings ?? 0}
                charityPercentage={data?.charityPercentage ?? 0}
                userCharity={data?.userCharity ?? null}
                onRefresh={fetchDashboardData}
                onSubscribe={() => {}}
              />
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <LatestDrawCard
                subscription={data?.subscription ?? null}
                latestDraw={data?.latestDraw ?? null}
                onSubscribe={() => {}}
              />
            </motion.div>

            {/* Cancel Subscription */}
            {isSubscribed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-4 font-medium">Membership Settings</p>

                <AnimatePresence mode="wait">
                  {!showCancelConfirm ? (
                    <motion.button
                      key="cancel-trigger"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-[11px] uppercase tracking-[0.3em] text-white/20 hover:text-red-400/70 transition-colors font-bold"
                    >
                      Terminate Plan →
                    </motion.button>
                  ) : (
                    <motion.div
                      key="cancel-confirm"
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-red-950/20 border border-red-500/10 rounded-lg p-4 space-y-3"
                    >
                      <p className="text-[10px] text-red-400/70 uppercase tracking-widest">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCancelSubscription}
                          className="text-[9px] uppercase tracking-widest text-red-400 border border-red-400/30 hover:bg-red-400/10 px-4 py-2 rounded-md transition-colors font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 px-4 py-2 transition-colors font-bold"
                        >
                          Keep Plan
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0f0d; }
        ::-webkit-scrollbar-thumb { background: #1a2421; }
      `}</style>
    </div>
  );
}

// Small reusable section label
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">{label}</span>
    </div>
  );
}