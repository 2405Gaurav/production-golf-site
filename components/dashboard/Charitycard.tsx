'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, CheckCircle2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubscriptionGate from './Subscriptiongate';

interface Charity {
  id: string;
  name: string;
}

interface UserCharity {
  percentage: number;
  charity: { name: string };
}

interface CharityCardProps {
  subscription: { status: string; plan?: string } | null;
  charities: Charity[];
  userCharity: UserCharity | null;
  onRefresh: () => void;
  onSubscribe?: () => void;
}

export default function CharityCard({
  subscription,
  charities,
  userCharity,
  onRefresh,
  onSubscribe,
}: CharityCardProps) {
  const [selectedCharity, setSelectedCharity] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLocked = subscription?.status !== 'active';

  const handleCharitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId: selectedCharity, percentage }),
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating charity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const content = (
    <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative overflow-hidden transition-all duration-700 ${isLocked ? 'blur-[2px] opacity-40 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Decorative Element */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c8f04e]/5 blur-[60px] rounded-full" />

      <div className="relative z-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1 h-1 rounded-full bg-[#c8f04e]" />
             <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold">Foundation Selection</h3>
          </div>
          <p className="text-2xl font-bold tracking-tighter text-white">
            Direct Your <span className="italic font-light text-white/50">Impact</span>
          </p>
        </div>

        {/* Current Selection Status */}
        <AnimatePresence mode="wait">
          {userCharity ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 p-6 bg-[#141b18] border border-white/5 rounded-xl flex items-center justify-between group hover:border-[#c8f04e]/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c8f04e]/10 flex items-center justify-center">
                   <Heart className="w-5 h-5 text-[#c8f04e] fill-[#c8f04e]/20" />
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1">Current Partner</div>
                  <div className="text-base font-bold tracking-tight text-white">{userCharity.charity.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[#c8f04e] italic leading-none">{userCharity.percentage}%</div>
                <div className="text-[7px] uppercase tracking-widest text-white/20 mt-1">Contribution</div>
              </div>
            </motion.div>
          ) : (
            <div className="mb-10 p-8 border border-dashed border-white/5 rounded-xl text-center bg-white/[0.01]">
               <Globe className="w-5 h-5 text-white/10 mx-auto mb-3" />
               <p className="text-[9px] uppercase tracking-widest text-white/20 font-medium italic">Assign a partner to activate charitable giving</p>
            </div>
          )}
        </AnimatePresence>

        {/* Update Form */}
        <form onSubmit={handleCharitySubmit} className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[9px] uppercase tracking-[0.3em] text-white/30 ml-1">Foundation</Label>
              <Select value={selectedCharity} onValueChange={setSelectedCharity}>
                <SelectTrigger className="bg-[#141b18] border-white/5 text-white h-14 rounded-lg px-5 focus:ring-[#c8f04e]/20 border-b-2 border-b-transparent focus:border-b-[#c8f04e]/50 transition-all">
                  <SelectValue placeholder="Select Estate Partner" />
                </SelectTrigger>
                <SelectContent className="bg-[#141b18] border-white/10 text-white">
                  {charities.map((charity) => (
                    <SelectItem key={charity.id} value={charity.id} className="focus:bg-[#c8f04e] focus:text-black cursor-pointer">
                      {charity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] uppercase tracking-[0.3em] text-white/30 ml-1">Win Percentage</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="10"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="bg-[#141b18] border-white/5 text-white h-14 rounded-lg px-5 focus:border-[#c8f04e]/30"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 font-bold text-xs">%</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!selectedCharity || isUpdating || isLocked}
            className="w-full h-14 bg-white hover:bg-[#c8f04e] text-black font-bold text-[10px] uppercase tracking-[0.4em] rounded-lg transition-all duration-500 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isUpdating ? 'SYNCHRONIZING...' : 'COMMIT SELECTION'}
              {!isUpdating && <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
            </span>
          </Button>
        </form>
      </div>

      {/* Unsubscribed Exclusive Badge Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-black/20 backdrop-blur-[1px]">
           <div className="w-12 h-12 rounded-full bg-[#c8f04e]/10 flex items-center justify-center mb-4 border border-[#c8f04e]/20">
              <Lock className="w-5 h-5 text-[#c8f04e]" />
           </div>
           <h4 className="text-white text-sm font-bold tracking-tight uppercase mb-2 italic">Philanthropy Module</h4>
           <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Active membership is required to direct your winnings toward charitable impact.</p>
        </div>
      )}
    </div>
  );

  return (
    <SubscriptionGate
      subscription={subscription}
      featureName="Philanthropic Impact"
      featureIcon="🤝" // Passed as string to fix TypeScript error
      onSubscribe={onSubscribe}
    >
      {content}
    </SubscriptionGate>
  );
}