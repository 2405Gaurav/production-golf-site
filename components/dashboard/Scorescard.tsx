'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
        onRefresh();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const handleScoreEdit = async (scoreId: string) => {
    if (!editValue) return;
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
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error editing score:', error);
    }
  };

  const cardContent = (
    <Card>
      <CardHeader>
        <CardTitle>Your Golf Scores</CardTitle>
        <CardDescription>Submit your latest scores (1–45). Only your best 5 scores are kept.</CardDescription>
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
          {scores?.map((score) => (
            <div key={score.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              {editingScore === score.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    type="number"
                    min="1"
                    max="45"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-8 w-24"
                    autoFocus
                  />
                  <Button size="sm" className="h-8" onClick={() => handleScoreEdit(score.id)}>Save</Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingScore(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{score.value}</span>
                    <span className="text-sm text-gray-500">{format(new Date(score.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => { setEditingScore(score.id); setEditValue(String(score.value)); }}
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          ))}
          {(!scores || scores.length === 0) && (
            <p className="text-gray-500 text-sm">No scores yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SubscriptionGate
      subscription={subscription}
      featureName="Golf Score Tracker"
      featureIcon="⛳"
      onSubscribe={onSubscribe}
    >
      {cardContent}
    </SubscriptionGate>
  );
}