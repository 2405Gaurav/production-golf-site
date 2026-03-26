'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Wallet, Heart, ArrowUpRight, CheckCircle2, CloudUpload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
  
  const isLocked = subscription?.status !== 'active';

  const cardContent = (
    <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative overflow-hidden transition-all duration-700 ${isLocked ? 'blur-md opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
      
      {/* Decorative Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c8f04e]/5 blur-[60px] rounded-full" />

      <div className="relative z-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1 h-1 rounded-full bg-[#c8f04e]" />
             <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold">Financial Ledger</h3>
          </div>
          <p className="text-2xl font-bold tracking-tighter text-white">
            Winnings <span className="italic font-light text-white/50">& Rewards</span>
          </p>
        </div>

        {/* ── SUMMARY TOTALS ── */}
        <div className="bg-[#141b18] border border-white/5 rounded-xl p-6 mb-10 space-y-4">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/30 font-bold">
            <span>Gross Prize Pool</span>
            <span className="text-white">${totalGross?.toFixed(2) ?? '0.00'}</span>
          </div>

          {(totalCharityDeduction ?? 0) > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#c8f04e]/60">
                <Heart className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Legacy Contribution</span>
              </div>
              <span className="text-[10px] font-bold text-[#c8f04e]/60">− ${totalCharityDeduction?.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-4 border-t border-white/5 flex justify-between items-end">
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-1">Available for Withdrawal</div>
              <div className="text-4xl font-black text-[#c8f04e] italic leading-none tracking-tighter">
                ${totalWinnings?.toFixed(2) ?? '0.00'}
              </div>
            </div>
            <Wallet className="w-8 h-8 text-white/5 mb-1" />
          </div>
        </div>

        {/* ── PER-WINNER BREAKDOWN ── */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {winners?.map((winner, index) => (
              <motion.div 
                key={winner.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-[#c8f04e]/20 text-[#c8f04e] text-[9px] uppercase tracking-widest px-2.5 py-1 bg-[#c8f04e]/5">
                      {winner.matchType}
                    </Badge>
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">{winner.draw?.month} Draw</span>
                  </div>
                  <div className={`text-[9px] uppercase tracking-[0.3em] font-black ${winner.status === 'paid' ? 'text-[#c8f04e]' : 'text-amber-500 italic'}`}>
                    {winner.status}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                   <div className="text-[10px] text-white/30 uppercase tracking-widest italic">Net Distribution</div>
                   <div className="text-xl font-bold text-white tracking-tight">${winner.netAmount.toFixed(2)}</div>
                </div>

                {winner.status !== 'paid' && (
                  <div className="pt-4 border-t border-white/5">
                    <Label className="text-[9px] uppercase tracking-[0.3em] text-white/20 ml-1">Claim Verification (Screenshot URL)</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Enter proof path..."
                        className="bg-[#141b18] border-white/5 text-white h-10 rounded-lg px-4 text-xs focus:border-[#c8f04e]/50 placeholder:text-white/5"
                        onBlur={async (e) => {
                          if (e.target.value) {
                            try {
                              const res = await fetch('/api/winners/proof', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ winnerId: winner.id, fileUrl: e.target.value }),
                              });
                              if (res.ok) onRefresh();
                            } catch (err) { console.error(err); }
                          }
                        }}
                      />
                      <Button size="sm" className="h-10 bg-white text-black hover:bg-[#c8f04e] transition-colors px-4">
                        <CloudUpload className="w-4 h-4" />
                      </Button>
                    </div>
                    {winner.proof && (
                      <div className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#c8f04e] font-bold italic">
                        <CheckCircle2 className="w-3 h-3" /> Proof Status: {winner.proof.status}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {(!winners || winners.length === 0) && (
            <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
               <Trophy className="w-6 h-6 text-white/10 mx-auto mb-3" />
               <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium italic">Establishing Payout Ledger...</p>
            </div>
          )}
        </div>
      </div>
    </div>
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