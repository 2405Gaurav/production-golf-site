'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleCharitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  const cardContent = (
    <Card>
      <CardHeader>
        <CardTitle>Charity Support</CardTitle>
        <CardDescription>Choose a charity and set your contribution percentage</CardDescription>
      </CardHeader>
      <CardContent>
        {userCharity && (
          <div className="mb-4 p-4 bg-green-50 rounded">
            <p className="font-medium">{userCharity.charity.name}</p>
            <p className="text-sm text-gray-600">{userCharity.percentage}% of winnings</p>
          </div>
        )}

        <form onSubmit={handleCharitySubmit} className="space-y-4">
          <div>
            <Label>Select Charity</Label>
            <Select value={selectedCharity} onValueChange={setSelectedCharity}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a charity" />
              </SelectTrigger>
              <SelectContent>
                {charities.map((charity) => (
                  <SelectItem key={charity.id} value={charity.id}>
                    {charity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contribution Percentage (min 10%)</Label>
            <Input
              type="number"
              min="10"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
            />
          </div>
          <Button type="submit">Update Charity</Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <SubscriptionGate
      subscription={subscription}
      featureName="Charity Contributions"
      featureIcon="🤝"
      onSubscribe={onSubscribe}
    >
      {cardContent}
    </SubscriptionGate>
  );
}