'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lock, ShieldAlert } from 'lucide-react';

interface SubscriptionGateProps {
  subscription: { status: string; plan?: string } | null;
  children: ReactNode;
  featureName: string;
  featureIcon?: string;
  onSubscribe?: () => void;
}

export default function SubscriptionGate({
  subscription,
  children,
  featureName,
  featureIcon = '🔒',
  onSubscribe,
}: SubscriptionGateProps) {
  const isActive = subscription?.status === 'active';

  // If active, return the children without any extra container/blur
  if (isActive) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1411]/40 backdrop-blur-md overflow-hidden relative group">
      
      {/* ── HEADER: SECURITY CLEARANCE ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">
            {featureIcon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">{featureName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-[#c8f04e] animate-pulse" />
              <span className="text-[8px] uppercase tracking-widest text-[#c8f04e] font-black italic">
                Membership Required
              </span>
            </div>
          </div>
        </div>

        {onSubscribe && (
          <Button
            size="sm"
            onClick={onSubscribe}
            className="bg-[#c8f04e] hover:bg-[#d8ff5e] text-[#0a0f0d] text-[9px] font-black uppercase tracking-widest h-9 px-5 rounded-full shadow-lg shadow-[#c8f04e]/5 transition-all active:scale-95"
          >
            Unlock Now ↑
          </Button>
        )}
      </div>

      {/* ── BLURRED CONTENT PREVIEW ── */}
      <div className="relative">
        <div
          className="pointer-events-none select-none"
          style={{
            filter: 'blur(12px) grayscale(0.5)',
            opacity: 0.15,
            maxHeight: '320px',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
          }}
        >
          {children}
        </div>

        {/* Subtle Center Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-4 opacity-20">
                <ShieldAlert className="w-12 h-12 text-white" strokeWidth={1} />
                <span className="text-[9px] uppercase tracking-[0.5em] text-white font-medium">Estate Access Restricted</span>
            </div>
        </div>
      </div>

      {/* Background Decorative Glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#c8f04e]/5 blur-[60px] rounded-full pointer-events-none" />
    </div>
  );
}