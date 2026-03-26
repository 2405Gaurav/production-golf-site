'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Score {
  id: string;
  value: number;
  date: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  subscription: { plan: string; status: string; startDate: string } | null;
  scores: Score[];
  userCharity: { percentage: number; charity: { name: string } } | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Edit state
  const [editEmail, setEditEmail] = useState('');
  const [editScores, setEditScores] = useState<string[]>([]);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDialog = (user: User) => {
    setSelectedUser(user);
    setEditEmail(user.email);
    setEditScores(user.scores.map((s) => String(s.value)));
    setEditPlan(user.subscription?.plan ?? '');
    setEditStatus(user.subscription?.status ?? '');
    setSaveError('');
    setDialogOpen(true);
  };

  const patch = async (action: string, payload: object) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser!.id, action, ...payload }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Unknown error');
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setSaveError('');
    try {
      // Profile
      if (editEmail !== selectedUser.email) {
        await patch('update_profile', { email: editEmail });
      }

      // Scores
      const originalScores = selectedUser.scores.map((s) => String(s.value));
      const scoresChanged =
        editScores.join(',') !== originalScores.join(',');
      if (scoresChanged) {
        const parsed = editScores
          .filter((v) => v.trim() !== '')
          .map((v) => parseInt(v));
        await patch('update_scores', { scores: parsed });
      }

      // Subscription
      if (
        editPlan !== (selectedUser.subscription?.plan ?? '') ||
        editStatus !== (selectedUser.subscription?.status ?? '')
      ) {
        await patch('update_subscription', {
          plan: editPlan || undefined,
          status: editStatus || undefined,
        });
      }

      await fetchUsers();
      setDialogOpen(false);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addScoreRow = () => {
    if (editScores.length < 5) setEditScores([...editScores, '']);
  };

  const removeScoreRow = (i: number) => {
    setEditScores(editScores.filter((_, idx) => idx !== i));
  };

  const updateScoreRow = (i: number, val: string) => {
    const next = [...editScores];
    next[i] = val;
    setEditScores(next);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Scores</TableHead>
                <TableHead>Charity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.subscription ? (
                      <div className="space-y-0.5">
                        <Badge
                          variant={u.subscription.status === 'active' ? 'default' : 'outline'}
                        >
                          {u.subscription.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{u.subscription.plan}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.scores.length > 0 ? (
                      <span className="text-sm">{u.scores.map((s) => s.value).join(', ')}</span>
                    ) : (
                      <span className="text-xs text-gray-400">No scores</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.userCharity ? (
                      <div>
                        <p className="text-xs font-medium">{u.userCharity.charity.name}</p>
                        <p className="text-xs text-gray-500">{u.userCharity.percentage}%</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openDialog(u)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="scores" className="flex-1">Golf Scores</TabsTrigger>
              <TabsTrigger value="subscription" className="flex-1">Subscription</TabsTrigger>
            </TabsList>

            {/* Profile tab */}
            <TabsContent value="profile" className="space-y-4 pt-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Role:</span> {selectedUser?.role}</p>
                <p>
                  <span className="font-medium">Joined:</span>{' '}
                  {selectedUser?.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : '—'}
                </p>
                {selectedUser?.userCharity && (
                  <p>
                    <span className="font-medium">Charity:</span>{' '}
                    {selectedUser.userCharity.charity.name} ({selectedUser.userCharity.percentage}%)
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Scores tab */}
            <TabsContent value="scores" className="space-y-4 pt-4">
              <p className="text-sm text-gray-500">Edit up to 5 scores (1–45 each).</p>
              <div className="space-y-2">
                {editScores.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                    <Input
                      type="number"
                      min="1"
                      max="45"
                      value={val}
                      onChange={(e) => updateScoreRow(i, e.target.value)}
                      className="h-8 w-24"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-red-500 hover:text-red-700"
                      onClick={() => removeScoreRow(i)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {editScores.length < 5 && (
                <Button size="sm" variant="outline" onClick={addScoreRow}>
                  + Add Score
                </Button>
              )}
            </TabsContent>

            {/* Subscription tab */}
            <TabsContent value="subscription" className="space-y-4 pt-4">
              <div>
                <Label>Plan</Label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                >
                  <option value="">— No subscription —</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {editPlan && (
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              {selectedUser?.subscription && (
                <p className="text-xs text-gray-400">
                  Started:{' '}
                  {new Date(selectedUser.subscription.startDate).toLocaleDateString()}
                </p>
              )}
            </TabsContent>
          </Tabs>

          {saveError && (
            <p className="text-sm text-red-600 mt-2">{saveError}</p>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}