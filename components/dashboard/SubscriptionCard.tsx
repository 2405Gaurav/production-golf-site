'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, addMonths, addYears } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
}

interface SubscriptionCardProps {
  subscription: Subscription | null;
  onUpdate: () => void;
}

const PLANS = {
  monthly: { label: 'Monthly', price: '$9.99/mo', renewsFn: (d: Date) => addMonths(d, 1) },
  yearly:  { label: 'Yearly',  price: '$99.99/yr', renewsFn: (d: Date) => addYears(d, 1) },
};

export default function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isActive = subscription?.status === 'active';
  const planInfo = subscription ? PLANS[subscription.plan as keyof typeof PLANS] : null;
  const startDate = subscription ? new Date(subscription.startDate) : null;
  const renewalDate = planInfo && startDate ? planInfo.renewsFn(startDate) : null;

  const handleSubscribe = async (plan: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) { onUpdate(); setOpen(false); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription', { method: 'DELETE' });
      if (res.ok) { setConfirmCancel(false); onUpdate(); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      {/* ── Collapsed pill header ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium text-gray-800">
            {subscription
              ? `${planInfo?.label ?? subscription.plan} · ${isActive ? 'Active' : 'Inactive'}`
              : 'No subscription'}
          </span>
          {isActive && renewalDate && (
            <span className="text-xs text-gray-400 hidden sm:inline">
              · renews {format(renewalDate, 'MMM dd')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <Badge variant="default" className="text-xs py-0">
              {planInfo?.price}
            </Badge>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* ── Expanded panel ── */}
      {open && (
        <div className="border-t px-4 py-4 space-y-4 bg-gray-50">

          {/* Current status */}
          {subscription ? (
            <div className={`rounded-md p-3 text-sm ${isActive ? 'bg-green-50 border border-green-200' : 'bg-rose-50 border border-rose-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">
                    {planInfo?.label} — {planInfo?.price}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Started {startDate ? format(startDate, 'MMM dd, yyyy') : '—'}
                  </p>
                  {isActive && renewalDate && (
                    <p className="text-xs text-gray-500">
                      Renews {format(renewalDate, 'MMM dd, yyyy')}
                    </p>
                  )}
                  {!isActive && (
                    <p className="text-xs text-rose-600 font-medium mt-0.5">
                      Lapsed — reactivate to regain access
                    </p>
                  )}
                </div>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              No active plan. Subscribe to join monthly draws.
            </p>
          )}

          {/* Plan picker */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {subscription ? 'Switch Plan' : 'Choose Plan'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PLANS).map(([key, p]) => {
                const isCurrent = isActive && subscription?.plan === key;
                return (
                  <button
                    key={key}
                    disabled={loading || isCurrent}
                    onClick={() => handleSubscribe(key)}
                    className={`rounded-md border p-3 text-left transition-all text-sm ${
                      isCurrent
                        ? 'border-green-500 bg-green-50 cursor-default'
                        : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 cursor-pointer'
                    } disabled:opacity-60`}
                  >
                    <p className="font-semibold text-gray-800">{p.label}</p>
                    <p className="text-green-700 font-bold">{p.price}</p>
                    {key === 'yearly' && (
                      <p className="text-xs text-amber-600 mt-0.5">Save ~17%</p>
                    )}
                    {isCurrent && (
                      <p className="text-xs text-green-600 mt-0.5 font-medium">✓ Current</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { label: 'Gateway', value: 'Stripe (PCI-compliant)' },
              { label: 'Access', value: 'Restricted without plan' },
              { label: 'Lifecycle', value: 'Renewal, cancellation & lapsed' },
              { label: 'Validation', value: 'Real-time on every request' },
            ].map((i) => (
              <div key={i.label} className="bg-white rounded p-2 border">
                <p className="font-semibold text-gray-500">{i.label}</p>
                <p className="text-gray-400 leading-snug">{i.value}</p>
              </div>
            ))}
          </div>

          {/* Cancel */}
          {isActive && (
            <div className="border-t pt-3">
              {confirmCancel ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Cancel your subscription? Access will be restricted immediately.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={handleCancel} disabled={loading}>
                      {loading ? 'Cancelling…' : 'Yes, cancel'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmCancel(false)} disabled={loading}>
                      Keep it
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs text-gray-400 hover:text-rose-500 underline underline-offset-2 transition-colors"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}