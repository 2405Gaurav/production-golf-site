'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Activity 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Animation Variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.7, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
    }
  })
};

interface ReportsData {
  totalUsers: number;
  activeSubscriptions: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  charityBreakdown: { name: string; total: number; supporters: number }[];
  drawStats: {
    totalDraws: number;
    totalWinners: number;
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
    pendingPayouts: number;
    paidPayouts: number;
  };
}

export default function ReportsAnalytics() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return (
    <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center">
      <p className="text-[10px] uppercase tracking-widest text-white/20 italic font-bold">Terminal Connection Failed</p>
    </div>
  );

  const statCards = [
    {
      label: 'Total Registered',
      value: data.totalUsers,
      sub: `${data.activeSubscriptions} active members`,
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Prize Ledger',
      value: `$${data.totalPrizePool.toLocaleString()}`,
      sub: `${data.drawStats.totalDraws} completed events`,
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      label: 'Charity Impact',
      value: `$${data.totalCharityContributions.toLocaleString()}`,
      sub: `Across ${data.charityBreakdown.length} entities`,
      icon: <Heart className="w-4 h-4" />,
    },
    {
      label: 'Winner Index',
      value: data.drawStats.totalWinners,
      sub: `${data.drawStats.pendingPayouts} awaiting settlement`,
      icon: <Trophy className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-10">
      
      {/* ── TOP STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-500 group"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#c8f04e]/10 flex items-center justify-center text-[#c8f04e]">
                {s.icon}
              </div>
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold group-hover:text-[#c8f04e] transition-colors">
                {s.label}
              </span>
            </div>
            <p className="text-3xl font-black text-white italic tracking-tighter mb-1">
              {s.value}
            </p>
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-medium">
              {s.sub}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* ── CHARITY BREAKDOWN ── */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="bg-white/[0.02] border-white/5 text-white p-8 rounded-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-4 h-4 text-[#c8f04e]" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold">Impact Analytics</h3>
              </div>
              <p className="text-2xl font-bold tracking-tighter italic">Philanthropic <span className="text-white/40">Routing</span></p>
            </div>
            
            <div className="space-y-6">
              {data.charityBreakdown.length === 0 ? (
                <p className="text-[10px] uppercase tracking-widest text-white/20 italic">No impact recorded.</p>
              ) : (
                data.charityBreakdown.map((c) => {
                  const pct = data.totalCharityContributions > 0 ? (c.total / data.totalCharityContributions) * 100 : 0;
                  return (
                    <div key={c.name} className="group/item">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white group-hover/item:text-[#c8f04e] transition-colors">{c.name}</span>
                          <span className="text-[8px] uppercase tracking-widest text-white/20 border border-white/5 px-2 py-0.5 rounded-full">
                            {c.supporters} Supporters
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#c8f04e] italic">
                          ${c.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-[3px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="bg-[#c8f04e] h-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* ── DRAW STATISTICS ── */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="bg-white/[0.02] border-white/5 text-white p-8 rounded-2xl h-full flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#c8f04e]" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold">Performance Delta</h3>
              </div>
              <p className="text-2xl font-bold tracking-tighter italic">Winner <span className="text-white/40">Distribution</span></p>
            </div>

            <div className="space-y-6 flex-1">
              {[
                { label: 'Tier 1 (5-Number)', count: data.drawStats.tier1Count, color: 'bg-[#c8f04e]' },
                { label: 'Tier 2 (4-Number)', count: data.drawStats.tier2Count, color: 'bg-white/40' },
                { label: 'Tier 3 (3-Number)', count: data.drawStats.tier3Count, color: 'bg-white/10' },
              ].map((t) => {
                const pct = data.drawStats.totalWinners > 0 ? (t.count / data.drawStats.totalWinners) * 100 : 0;
                return (
                  <div key={t.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.label}</span>
                      <span className="text-xs font-black text-white">{t.count}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-[3px] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={`${t.color} h-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payout Settlement Row */}
            <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="bg-[#141b18] border border-white/5 rounded-xl p-4 text-center group hover:border-amber-500/20 transition-all">
                <p className="text-2xl font-black text-amber-500 italic tracking-tighter">{data.drawStats.pendingPayouts}</p>
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mt-1 font-bold">Pending Settlement</p>
              </div>
              <div className="bg-[#141b18] border border-white/5 rounded-xl p-4 text-center group hover:border-[#c8f04e]/20 transition-all">
                <p className="text-2xl font-black text-[#c8f04e] italic tracking-tighter">{data.drawStats.paidPayouts}</p>
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mt-1 font-bold">Funds Disbursed</p>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}