'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

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

  if (isActive) return <>{children}</>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Top banner — always visible, never blurred */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{featureIcon}</span>
          <span className="font-semibold text-gray-700 text-sm">{featureName}</span>
          <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <Lock size={10} />
            Locked
          </span>
        </div>
        {onSubscribe && (
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white text-xs h-8 px-3"
            onClick={onSubscribe}
          >
            Subscribe to Unlock ↑
          </Button>
        )}
      </div>

      {/* Blurred content preview — fades out at the bottom */}
      <div
        className="pointer-events-none select-none"
        style={{
          filter: 'blur(6px)',
          opacity: 0.35,
          maxHeight: '200px',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
        }}
      >
        {children}
      </div>
    </div>
  );
}