'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-sm text-gray-500">Failed to load reports.</p>;

  const statCards = [
    {
      label: 'Total Users',
      value: data.totalUsers,
      sub: `${data.activeSubscriptions} active subscriptions`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      dot: 'bg-blue-500',
    },
    {
      label: 'Total Prize Pool',
      value: `$${data.totalPrizePool.toFixed(2)}`,
      sub: `${data.drawStats.totalDraws} draws completed`,
      color: 'text-green-600',
      bg: 'bg-green-50',
      dot: 'bg-green-500',
    },
    {
      label: 'Charity Contributions',
      value: `$${data.totalCharityContributions.toFixed(2)}`,
      sub: `Across ${data.charityBreakdown.length} charities`,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      dot: 'bg-amber-500',
    },
    {
      label: 'Draw Statistics',
      value: data.drawStats.totalWinners,
      sub: `${data.drawStats.pendingPayouts} pending · ${data.drawStats.paidPayouts} paid`,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      dot: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className={`inline-flex items-center gap-1.5 mb-3`}>
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Charity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Charity Contribution Totals</CardTitle>
            <CardDescription>Cumulative donations routed from winner payouts</CardDescription>
          </CardHeader>
          <CardContent>
            {data.charityBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400">No charity contributions yet.</p>
            ) : (
              <div className="space-y-3">
                {data.charityBreakdown.map((c) => {
                  const pct =
                    data.totalCharityContributions > 0
                      ? (c.total / data.totalCharityContributions) * 100
                      : 0;
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{c.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {c.supporters} supporter{c.supporters !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-amber-600">
                          ${c.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Draw Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Draw Statistics</CardTitle>
            <CardDescription>Winner tier breakdown across all completed draws</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Tier 1 Winners', count: data.drawStats.tier1Count, color: 'bg-yellow-400' },
                { label: 'Tier 2 Winners', count: data.drawStats.tier2Count, color: 'bg-gray-300' },
                { label: 'Tier 3 Winners', count: data.drawStats.tier3Count, color: 'bg-orange-300' },
              ].map((t) => {
                const pct =
                  data.drawStats.totalWinners > 0
                    ? (t.count / data.drawStats.totalWinners) * 100
                    : 0;
                return (
                  <div key={t.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{t.label}</span>
                      <span className="text-sm font-semibold text-gray-800">{t.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`${t.color} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-orange-600">{data.drawStats.pendingPayouts}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pending Payouts</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{data.drawStats.paidPayouts}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Paid Out</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}