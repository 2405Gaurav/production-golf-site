'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SubscriptionGate from './Subscriptiongate';

interface LatestDrawCardProps {
  subscription: { status: string; plan?: string } | null;
  latestDraw: any;
  onSubscribe?: () => void;
}

export default function LatestDrawCard({ subscription, latestDraw, onSubscribe }: LatestDrawCardProps) {
  const cardContent = (
    <Card>
      <CardHeader>
        <CardTitle>Latest Draw</CardTitle>
      </CardHeader>
      <CardContent>
        {latestDraw ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">{latestDraw.month} Draw</p>
            <div className="flex gap-2 mb-4">
              {JSON.parse(latestDraw.numbers).map((number: number, index: number) => (
                <div
                  key={index}
                  className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold"
                >
                  {number}
                </div>
              ))}
            </div>
            <Badge variant="outline">{latestDraw.status}</Badge>
          </div>
        ) : (
          <p className="text-gray-500">No draws yet</p>
        )}
      </CardContent>
    </Card>
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