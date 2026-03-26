'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SubscriptionGate from './Subscriptiongate';

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

interface WinningsCardProps {
  subscription: { status: string; plan?: string } | null;
  winners: WinnerWithBreakdown[];
  totalGross: number;
  totalCharityDeduction: number;
  totalWinnings: number;
  charityPercentage: number;
  userCharity: any;
  onRefresh: () => void;
  onSubscribe?: () => void;
}

export default function WinningsCard({
  subscription,
  winners,
  totalGross,
  totalCharityDeduction,
  totalWinnings,
  charityPercentage,
  userCharity,
  onRefresh,
  onSubscribe,
}: WinningsCardProps) {
  const cardContent = (
    <Card>
      <CardHeader>
        <CardTitle>Your Winnings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Totals */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Prize Money</span>
            <span className="font-medium">${totalGross?.toFixed(2) ?? '0.00'}</span>
          </div>

          {(totalCharityDeduction ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-rose-600">
              <span>
                Charity Donation ({charityPercentage}%
                {userCharity?.charity?.name ? ` → ${userCharity.charity.name}` : ''})
              </span>
              <span className="font-medium">− ${totalCharityDeduction?.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Net Winnings</span>
            <span className="text-2xl font-bold text-green-600">
              ${totalWinnings?.toFixed(2) ?? '0.00'}
            </span>
          </div>
        </div>

        {/* Per-Winner Breakdown */}
        <div className="space-y-4">
          {winners?.map((winner) => (
            <div key={winner.id} className="p-4 bg-white border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="uppercase text-xs">{winner.matchType}</Badge>
                  <span className="text-xs text-gray-500">{winner.draw?.month}</span>
                </div>
                <Badge variant={winner.status === 'paid' ? 'default' : 'secondary'}>
                  {winner.status}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Prize</span>
                  <span>${winner.grossAmount.toFixed(2)}</span>
                </div>
                {winner.charityDeduction > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>
                      Charity ({winner.charityPercentage}%
                      {winner.charityName ? ` → ${winner.charityName}` : ''})
                    </span>
                    <span>− ${winner.charityDeduction.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-1.5 flex justify-between font-semibold text-green-700">
                  <span>You receive</span>
                  <span>${winner.netAmount.toFixed(2)}</span>
                </div>
              </div>

              {winner.status !== 'paid' && (
                <div className="border-t pt-3">
                  <Label className="text-xs uppercase text-gray-500">Claim Proof (URL or Dummy String)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Enter proof URL..."
                      className="h-8 text-sm"
                      onBlur={async (e) => {
                        if (e.target.value) {
                          try {
                            const res = await fetch('/api/winners/proof', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ winnerId: winner.id, fileUrl: e.target.value }),
                            });
                            if (res.ok) onRefresh();
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                    <Button size="sm" className="h-8">Upload</Button>
                  </div>
                  {winner.proof && (
                    <p className="mt-2 text-xs text-blue-600">Proof submitted: {winner.proof.status}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {(!winners || winners.length === 0) && (
            <p className="text-gray-500 text-sm">No winnings yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SubscriptionGate
      subscription={subscription}
      featureName="Winnings & Payouts"
      featureIcon="🏆"
      onSubscribe={onSubscribe}
    >
      {cardContent}
    </SubscriptionGate>
  );
}