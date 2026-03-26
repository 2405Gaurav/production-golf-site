'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface DashboardData {
  subscription: any;
  scores: any[];
  userCharity: any;
  totalWinnings: number;
  latestDraw: any;
  winners: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [charities, setCharities] = useState([]);
  const [newScore, setNewScore] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
    fetchCharities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharities = async () => {
    try {
      const response = await fetch('/api/charities');
      if (response.ok) {
        const result = await response.json();
        setCharities(result.charities);
      }
    } catch (error) {
      console.error('Error fetching charities:', error);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: parseInt(newScore) }),
      });

      if (response.ok) {
        setNewScore('');
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const handleCharitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId: selectedCharity, percentage }),
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating charity:', error);
    }
  };

  const handleSubscriptionUpdate = async (plan: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

 const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.replace('/');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-green-800">⛳ Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.subscription ? (
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={data.subscription.status === 'active' ? 'default' : 'secondary'}>
                      {data.subscription.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {data.subscription.plan} plan since {format(new Date(data.subscription.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant={data.subscription.plan === 'monthly' ? 'default' : 'outline'}
                      onClick={() => handleSubscriptionUpdate('monthly')}
                    >
                      Monthly
                    </Button>
                    <Button
                      variant={data.subscription.plan === 'yearly' ? 'default' : 'outline'}
                      onClick={() => handleSubscriptionUpdate('yearly')}
                    >
                      Yearly
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">No active subscription</p>
                  <div className="space-x-2">
                    <Button onClick={() => handleSubscriptionUpdate('monthly')}>
                      Subscribe Monthly
                    </Button>
                    <Button onClick={() => handleSubscriptionUpdate('yearly')}>
                      Subscribe Yearly
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Your Golf Scores</CardTitle>
                <CardDescription>Submit your latest scores (1-45). Only your best 5 scores are kept.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScoreSubmit} className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="45"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      placeholder="Enter score (1-45)"
                      required
                    />
                    <Button type="submit">Add Score</Button>
                  </div>
                </form>
                
                <div className="space-y-2">
                  {data?.scores?.map((score) => (
                    <div key={score.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{score.value}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(score.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  ))}
                  {(!data?.scores || data.scores.length === 0) && (
                    <p className="text-gray-500 text-sm">No scores yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Charity Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Charity Support</CardTitle>
                <CardDescription>Choose a charity and set your contribution percentage</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.userCharity ? (
                  <div className="mb-4 p-4 bg-green-50 rounded">
                    <p className="font-medium">{data.userCharity.charity.name}</p>
                    <p className="text-sm text-gray-600">{data.userCharity.percentage}% of winnings</p>
                  </div>
                ) : null}
                
                <form onSubmit={handleCharitySubmit} className="space-y-4">
                  <div>
                    <Label>Select Charity</Label>
                    <Select value={selectedCharity} onValueChange={setSelectedCharity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a charity" />
                      </SelectTrigger>
                      <SelectContent>
                        {charities.map((charity: any) => (
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
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Winnings */}
            <Card>
              <CardHeader>
                <CardTitle>Your Winnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ${data?.totalWinnings?.toFixed(2) || '0.00'}
                </div>
                <div className="space-y-4">
                  {data?.winners?.map((winner) => (
                    <div key={winner.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-lg">${winner.amount.toFixed(2)}</span>
                          <Badge variant="outline" className="ml-2 uppercase">{winner.matchType}</Badge>
                        </div>
                        <Badge variant={winner.status === 'paid' ? 'default' : 'secondary'}>
                          {winner.status}
                        </Badge>
                      </div>

                      {winner.status !== 'paid' && (
                        <div className="border-t pt-4">
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
                                    if (res.ok) fetchDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                            />
                            <Button size="sm" className="h-8">Upload</Button>
                          </div>
                          {winner.proof && (
                            <p className="mt-2 text-xs text-blue-600">
                              Proof submitted: {winner.proof.status}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!data?.winners || data.winners.length === 0) && (
                    <p className="text-gray-500 text-sm">No winnings yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Draw */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Draw</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.latestDraw ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {data.latestDraw.month} Draw
                    </p>
                    <div className="flex gap-2 mb-4">
                      {JSON.parse(data.latestDraw.numbers).map((number: number, index: number) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                    <Badge variant="outline">{data.latestDraw.status}</Badge>
                  </div>
                ) : (
                  <p className="text-gray-500">No draws yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}