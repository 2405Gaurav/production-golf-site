'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Calendar, Edit3, Save, X, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SubscriptionGate from './Subscriptiongate';

interface Score {
  id: string;
  value: number;
  date: string;
}

interface ScoresCardProps {
  subscription: { status: string; plan?: string } | null;
  scores: Score[];
  onRefresh: () => void;
  onSubscribe?: () => void;
}

export default function ScoresCard({ subscription, scores, onRefresh, onSubscribe }: ScoresCardProps) {
  const [newScore, setNewScore] = useState('');
  const [editingScore, setEditingScore] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = subscription?.status !== 'active';

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: parseInt(newScore) }),
      });
      if (response.ok) {
        setNewScore('');
        onRefresh();
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreEdit = async (scoreId: string) => {
    if (!editValue || isLocked) return;
    try {
      const response = await fetch('/api/scores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId, value: parseInt(editValue) }),
      });
      if (response.ok) {
        setEditingScore(null);
        setEditValue('');
        onRefresh();
      }
    } catch (error) {
      console.error('Error editing score:', error);
    }
  };

  const content = (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
      
      {/* Background Decorative Gradient */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#c8f04e]/5 blur-[60px] rounded-full pointer-events-none" />

      <div className={`relative z-10 transition-all duration-700 ${isLocked ? 'blur-md opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1 h-1 rounded-full bg-[#c8f04e]" />
             <h3 className="text-[10px] uppercase tracking-[0.4em] text-[#c8f04e] font-bold">Stableford Index</h3>
          </div>
          <p className="text-2xl font-bold tracking-tighter text-white">
            Performance <span className="italic font-light text-white/50">Ledger</span>
          </p>
        </div>

        {/* Score Submission Form */}
        <form onSubmit={handleScoreSubmit} className="mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                min="1"
                max="45"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Enter Score (1-45)"
                className="bg-[#141b18] border-white/5 text-white h-14 rounded-lg px-6 focus:border-[#c8f04e]/50 focus:ring-[#c8f04e]/10 transition-all"
                required
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-white/20 font-bold">Points</div>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-14 bg-[#c8f04e] hover:bg-[#d8ff5e] text-black font-bold px-8 rounded-lg shadow-xl shadow-[#c8f04e]/10 group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest">Post</span>
            </Button>
          </div>
        </form>

        {/* Score History List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {scores?.map((score, index) => (
              <motion.div 
                key={score.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group/item flex justify-between items-center p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl transition-all duration-300"
              >
                {editingScore === score.id ? (
                  <div className="flex gap-3 flex-1">
                    <Input
                      type="number"
                      min="1"
                      max="45"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-10 w-24 bg-black/40 border-white/10 text-[#c8f04e] font-bold"
                      autoFocus
                    />
                    <Button size="sm" className="h-10 bg-[#c8f04e] text-black hover:bg-white px-4" onClick={() => handleScoreEdit(score.id)}>
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-10 text-white/40 hover:text-white" onClick={() => setEditingScore(null)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-white italic leading-none">{score.value}</span>
                        <span className="text-[7px] uppercase tracking-[0.2em] text-[#c8f04e] font-bold mt-1">Pts</span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/5" />
                      <div className="flex items-center gap-2 text-white/30">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] uppercase tracking-widest font-medium">
                          {format(new Date(score.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditingScore(score.id); setEditValue(String(score.value)); }}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity p-2 text-white/20 hover:text-[#c8f04e]"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {(!scores || scores.length === 0) && (
            <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
               <Target className="w-5 h-5 text-white/10 mx-auto mb-3" />
               <p className="text-[9px] uppercase tracking-widest text-white/20 font-medium italic">Establishing Performance History...</p>
            </div>
          )}
        </div>
      </div>

      {/* ── EXCLUSIVE LOCKED OVERLAY ── */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-black/10">
          <div className="w-14 h-14 rounded-full bg-[#c8f04e]/10 flex items-center justify-center mb-6 border border-[#c8f04e]/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(200,240,78,0.1)]">
            <Lock className="w-5 h-5 text-[#c8f04e]" />
          </div>
          <h4 className="text-white text-base font-bold tracking-tight uppercase mb-2 italic">Performance Tracker Locked</h4>
          <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] max-w-[220px] leading-relaxed mb-8">
            Access the Rolling 5 score module and enter the prize pool by becoming an estate member.
          </p>
          <button 
            onClick={onSubscribe}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c8f04e] border-b border-[#c8f04e]/30 pb-1 hover:text-white hover:border-white transition-all"
          >
            Upgrade Membership →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <SubscriptionGate
      subscription={subscription}
      featureName="Golf Score Tracker"
      featureIcon="⛳"
      onSubscribe={onSubscribe}
    >
      {content}
    </SubscriptionGate>
  );
}