'use client';

import { motion } from 'framer-motion';
import { Trophy, Calendar, Lock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SubscriptionGate from './Subscriptiongate';

interface LatestDrawCardProps {
  subscription: { status: string; plan?: string } | null;
  latestDraw: any;
  onSubscribe?: () => void;
}

export default function LatestDrawCard({ subscription, latestDraw, onSubscribe }: LatestDrawCardProps) {
  const isLocked = subscription?.status !== 'active';

  const cardContent = (
    <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-500 hover:border-white/10 group">
      
      {/* Background Decorative Element */}
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#c8f04e]/5 blur-[50px] rounded-full pointer-events-none" />

      <div className={`p-8 transition-all duration-700 ${isLocked ? 'blur-md opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1 h-1 rounded-full bg-[#c8f04e]" />
               <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold">Monthly Draw</h3>
            </div>
            <p className="text-2xl font-bold tracking-tighter text-white">
              The <span className="italic font-light text-white/50">Results</span>
            </p>
          </div>
          {latestDraw && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Calendar className="w-3 h-3 text-white/30" />
              <span className="text-[9px] uppercase tracking-widest text-white/60 font-medium">
                {latestDraw.month}
              </span>
            </div>
          )}
        </div>

        {latestDraw ? (
          <div className="space-y-8">
            {/* Draw Numbers */}
            <div className="flex justify-between items-center gap-3">
              {JSON.parse(latestDraw.numbers).map((number: number, index: number) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="relative group/num flex-1 aspect-square max-w-[60px] bg-[#c8f04e] text-[#0a0f0d] rounded-full flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(200,240,78,0.2)]"
                >
                  {number}
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-110 opacity-0 group-hover/num:opacity-100 transition-all duration-300" />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${latestDraw.status === 'published' ? 'bg-[#c8f04e]' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold italic">
                  Status: {latestDraw.status}
                </span>
              </div>
              
              <button className="text-[9px] uppercase tracking-[0.2em] text-[#c8f04e] hover:text-white transition-colors flex items-center gap-1 font-bold">
                VIEW ARCHIVE <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            <Trophy className="w-6 h-6 text-white/10 mx-auto mb-3" />
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium italic">Establishing Monthly Ledger...</p>
          </div>
        )}
      </div>

      {/* ── EXCLUSIVE LOCKED OVERLAY ── */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-black/10">
          <div className="w-14 h-14 rounded-full bg-[#c8f04e]/10 flex items-center justify-center mb-6 border border-[#c8f04e]/20 group-hover:scale-110 transition-transform duration-500">
            <Lock className="w-5 h-5 text-[#c8f04e]" />
          </div>
          <h4 className="text-white text-base font-bold tracking-tight uppercase mb-2 italic">Draw Ledger Locked</h4>
          <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] max-w-[220px] leading-relaxed mb-8">
            Join the estate to view current results and enter the upcoming monthly draw.
          </p>
          <button 
            onClick={onSubscribe}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c8f04e] border-b border-[#c8f04e]/30 pb-1 hover:text-white hover:border-white transition-all"
          >
            Access Membership →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <SubscriptionGate
      subscription={subscription}
      featureName="Monthly Draws"
      featureIcon="🎰"
      onSubscribe={onSubscribe}
    >
      {cardContent}
    </SubscriptionGate>
  );
}