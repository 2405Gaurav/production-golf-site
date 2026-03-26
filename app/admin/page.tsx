'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ReportsAnalytics from '@/components/admin/ReportAndAnalytic';
import AdminUsers from '@/components/admin/AdminUsers';

export default function AdminPage() {
  const [charities, setCharities] = useState([]);
 
  const [winners, setWinners] = useState([]);
  const [newCharity, setNewCharity] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('random');
const [draftDraw, setDraftDraw] = useState<any>(null);
const [draftWinners, setDraftWinners] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchCharities(),
     
      fetchWinners()
    ]);
    setLoading(false);
  };

  const fetchCharities = async () => {
    try {
      const response = await fetch('/api/admin/charities');
      if (response.ok) {
        const data = await response.json();
        setCharities(data.charities);
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching charities:', error);
    }
  };

 

  const fetchWinners = async () => {
    try {
      const response = await fetch('/api/admin/winners');
      if (response.ok) {
        const data = await response.json();
        setWinners(data.winners);
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
    }
  };

  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharity),
      });

      if (response.ok) {
        setNewCharity({ name: '', description: '' });
        fetchCharities();
      }
    } catch (error) {
      console.error('Error creating charity:', error);
    }
  };

 const handleCreateDraw = async () => {
  const response = await fetch('/api/admin/draw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: drawMode }),
  });
  const data = await response.json();
  if (response.ok) {
    setDraftDraw(data.draw);
    setDraftWinners(data.winners);
    alert(`Draft created! Numbers: [${data.numbers.join(', ')}]\n${data.winners.length} winner(s) found. Review and publish.`);
  } else {
    alert(data.error);
  }
};
const handleSimulate = async () => {
  const response = await fetch('/api/admin/draw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulate: true, mode: drawMode }),
  });
  const data = await response.json();
  alert(`Simulation (${data.mode}): Numbers would be [${data.numbers.join(', ')}]`);
};
const handlePublish = async () => {
  if (!draftDraw) return;
  const response = await fetch('/api/admin/draw', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drawId: draftDraw.id }),
  });
  if (response.ok) {
    alert('Draw published! Winners can now see results on their dashboard.');
    setDraftDraw(null);
    setDraftWinners([]);
    fetchWinners();
  }
};

  const handleUpdateWinner = async (winnerId: string, status: string, proofId?: string, proofStatus?: string) => {
    try {
      const response = await fetch('/api/admin/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, status, proofId, proofStatus }),
      });

      if (response.ok) {
        fetchWinners();
      }
    } catch (error) {
      console.error('Error updating winner:', error);
    }
  };
  
  

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading && !charities.length ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-red-800">🛠️ Admin Panel</h1>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="draws" className="space-y-4">
          <TabsList>
            <TabsTrigger value="draws">Draw Management</TabsTrigger>
            <TabsTrigger value="charities">Charities</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="winners">Winners & Proofs</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

      <TabsContent value="draws">
  <Card>
    <CardHeader>
      <CardTitle>Draw Management</CardTitle>
      <CardDescription>Generate, simulate, and publish the monthly draw</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center gap-4">
        <Label>Draw Mode</Label>
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={drawMode}
          onChange={e => setDrawMode(e.target.value as 'random' | 'algorithmic')}
        >
          <option value="random">Random</option>
          <option value="algorithmic">Algorithmic (weighted by score frequency)</option>
        </select>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSimulate}>
          Simulate (preview only)
        </Button>
        <Button onClick={handleCreateDraw} disabled={!!draftDraw}>
          Generate Draft Draw
        </Button>
      </div>

      {draftDraw && (
        <div className="border rounded-lg p-4 bg-yellow-50 space-y-3">
          <p className="font-medium text-yellow-800">Draft ready — review before publishing</p>
          <p className="text-sm">Numbers: <strong>[{JSON.parse(draftDraw.numbers).join(', ')}]</strong></p>
          <p className="text-sm">Winners found: <strong>{draftWinners.length}</strong></p>
          {draftWinners.length > 0 && (
            <ul className="text-sm space-y-1">
              {draftWinners.map((w: any) => (
                <li key={w.id}>
                  {w.user?.email} — {w.matchType} — ${w.amount?.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={handlePublish}>
            Publish Results
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

          <TabsContent value="charities">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add Charity</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCharity} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={newCharity.name} onChange={e => setNewCharity({...newCharity, name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={newCharity.description} onChange={e => setNewCharity({...newCharity, description: e.target.value})} required />
                    </div>
                    <Button type="submit">Create Charity</Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Available Charities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {charities.map((c: any) => (
                    <div key={c.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold">{c.name}</h3>
                        <Badge variant="secondary">{c._count?.userCharities || 0} supporters</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{c.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
  <AdminUsers />
</TabsContent>
          <TabsContent value="reports">
  <ReportsAnalytics />
</TabsContent>

          <TabsContent value="winners">
            <Card>
              <CardHeader>
                <CardTitle>Winners & Prize Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winners.map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell>{w.user.email}</TableCell>
                        <TableCell>{w.matchType}</TableCell>
                        <TableCell>${w.amount.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={w.status === 'paid' ? 'default' : 'outline'}>{w.status}</Badge></TableCell>
                        <TableCell>
                          {w.proof ? (
                            <div className="space-y-1">
    <a
      href={w.proof.fileUrl.startsWith('http') ? w.proof.fileUrl : `https://${w.proof.fileUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-600 hover:underline block truncate max-w-[120px]"
      title={w.proof.fileUrl}
    >
      {w.proof.fileUrl}
    </a>

    <Badge variant={w.proof.status === 'approved' ? 'default' : 'outline'}>
      {w.proof.status}
    </Badge>
  </div>
                          ) : 'No proof'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                             {w.proof && w.proof.status === 'pending' && (
                               <>
                                 <Button size="sm" onClick={() => handleUpdateWinner(w.id, 'pending', w.proof.id, 'approved')}>Approve Proof</Button>
                                 <Button size="sm" variant="destructive" onClick={() => handleUpdateWinner(w.id, 'pending', w.proof.id, 'rejected')}>Reject</Button>
                               </>
                             )}
                             {w.status === 'pending' && (
                               <Button size="sm" variant="outline" onClick={() => handleUpdateWinner(w.id, 'paid')}>Mark Paid</Button>
                             )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}