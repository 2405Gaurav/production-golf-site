'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  LayoutDashboard, 
  Heart, 
  Users, 
  Trophy, 
  BarChart3, 
  LogOut, 
  Settings2, 
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Play
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import ReportsAnalytics from '@/components/admin/ReportAndAnalytic';
import AdminUsers from '@/components/admin/AdminUsers';

// Animation Variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.08, 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
    }
  })
};

export default function AdminPage() {
  const [charities, setCharities] = useState([]);
  const [winners, setWinners] = useState([]);
  const [newCharity, setNewCharity] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('random');
  const [draftDraw, setDraftDraw] = useState<any>(null);
  const [draftWinners, setDraftWinners] = useState<any[]>([]);
  const router = useRouter();

  const fetchWinners = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/winners');
      if (response.ok) {
        const data = await response.json();
        setWinners(data.winners);
      }
    } catch (error) { console.error(error); }
  }, []);

  const fetchCharities = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/charities');
      if (response.ok) {
        const data = await response.json();
        setCharities(data.charities);
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) { console.error(error); }
  }, [router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCharities(), fetchWinners()]);
    setLoading(false);
  }, [fetchCharities, fetchWinners]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Logic handlers preserved exactly as per input...
  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCharity),
    });
    if (response.ok) {
      setNewCharity({ name: '', description: '' });
      fetchCharities();
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
    }
  };

  const handleSimulate = async () => {
    const response = await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulate: true, mode: drawMode }),
    });
    const data = await response.json();
    alert(`Simulation Result: [${data.numbers.join(', ')}]`);
  };

  const handlePublish = async () => {
    if (!draftDraw) return;
    const response = await fetch('/api/admin/draw', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId: draftDraw.id }),
    });
    if (response.ok) {
      setDraftDraw(null);
      setDraftWinners([]);
      fetchWinners();
    }
  };

  const handleUpdateWinner = async (winnerId: string, status: string, proofId?: string, proofStatus?: string) => {
    const response = await fetch('/api/admin/winners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, status, proofId, proofStatus }),
    });
    if (response.ok) fetchWinners();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading && !charities.length) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <div className="text-[#c8f04e] text-xs uppercase tracking-[0.6em] font-bold animate-pulse">Initializing Terminal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white selection:bg-[#c8f04e] selection:text-[#0a0f0d]">
      
      {/* ── TOP NAV ── */}
      <nav className="border-b border-white/5 bg-[#0a0f0d]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12">
          <div className="flex justify-between items-center h-20">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c8f04e] flex items-center justify-center text-[#0a0f0d] font-black italic text-xs">A</div>
              <h1 className="text-xl font-bold tracking-tighter italic">ADMIN<span className="text-white/30 font-normal">PANEL</span></h1>
            </motion.div>
            <Button variant="ghost" onClick={handleLogout} className="text-white/40 hover:text-[#c8f04e] gap-2 text-[10px] uppercase tracking-widest px-0">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 sm:px-12 py-12">
        
        <Tabs defaultValue="draws" className="space-y-10">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-full h-14 flex items-center gap-2 max-w-fit px-2">
            {[
              { val: 'draws', label: 'Draws', icon: <Play className="w-3.5 h-3.5" /> },
              { val: 'charities', label: 'Charities', icon: <Heart className="w-3.5 h-3.5" /> },
              { val: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
              { val: 'winners', label: 'Claims', icon: <Trophy className="w-3.5 h-3.5" /> },
              { val: 'reports', label: 'Reports', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.val} 
                value={tab.val}
                className="rounded-full px-6 h-10 data-[state=active]:bg-[#c8f04e] data-[state=active]:text-black text-[10px] uppercase tracking-widest font-bold gap-2 transition-all"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── DRAW MANAGEMENT ── */}
          <TabsContent value="draws" className="outline-none">
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="max-w-4xl space-y-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 md:p-12">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tighter mb-2 italic">Monthly <span className="text-white/40">Draw Engine</span></h2>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-semibold leading-relaxed">System-wide number generation and prize distribution.</p>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <Label className="text-[10px] uppercase tracking-widest text-white/40">Algorithm Mode</Label>
                    <select
                      className="bg-transparent text-[#c8f04e] font-bold text-xs uppercase tracking-widest border-none outline-none cursor-pointer"
                      value={drawMode}
                      onChange={e => setDrawMode(e.target.value as 'random' | 'algorithmic')}
                    >
                      <option value="random">Pure Random</option>
                      <option value="algorithmic">Weighted Algorithmic</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleSimulate} className="border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest font-bold h-12 px-8">
                      Run Simulation
                    </Button>
                    <Button onClick={handleCreateDraw} disabled={!!draftDraw} className="bg-white text-black hover:bg-[#c8f04e] text-[10px] uppercase tracking-widest font-bold h-12 px-8">
                      Generate Draft
                    </Button>
                  </div>

                  {draftDraw && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-[#c8f04e]/20 bg-[#c8f04e]/5 rounded-xl p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4"><AlertCircle className="text-[#c8f04e] w-4 h-4 opacity-50" /></div>
                      <p className="text-[#c8f04e] text-[10px] uppercase tracking-[0.4em] font-black mb-4 italic">Draft Ready — Awaiting Publication</p>
                      
                      <div className="flex gap-3 mb-8">
                        {JSON.parse(draftDraw.numbers).map((n: number, i: number) => (
                          <div key={i} className="w-10 h-10 rounded-full border border-[#c8f04e] flex items-center justify-center font-black text-[#c8f04e]">{n}</div>
                        ))}
                      </div>

                      <div className="space-y-4 mb-8">
                        <p className="text-xs text-white/60">Identified <span className="text-white font-bold">{draftWinners.length} winner(s)</span> for this round.</p>
                        {draftWinners.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {draftWinners.map((w: any) => (
                              <div key={w.id} className="text-[10px] p-3 bg-black/40 rounded border border-white/5 flex justify-between">
                                <span className="text-white/40">{w.user?.email}</span>
                                <span className="text-[#c8f04e] font-bold">${w.amount?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button onClick={handlePublish} className="w-full bg-[#c8f04e] text-black font-black uppercase tracking-[0.3em] h-12 rounded-lg">
                        Publish Results to Estate
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── CHARITIES ── */}
          <TabsContent value="charities">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-bold tracking-tight mb-8 italic">New <span className="text-white/40">Entity</span></h3>
                <form onSubmit={handleCreateCharity} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Official Name</Label>
                    <Input className="bg-black border-white/5 text-white h-12" value={newCharity.name} onChange={e => setNewCharity({...newCharity, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Entity Mission</Label>
                    <Textarea className="bg-black border-white/5 text-white min-h-[120px]" value={newCharity.description} onChange={e => setNewCharity({...newCharity, description: e.target.value})} required />
                  </div>
                  <Button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest h-12">
                    <PlusCircle className="w-4 h-4 mr-2" /> Create Charity
                  </Button>
                </form>
              </motion.div>

              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-8 grid md:grid-cols-2 gap-4">
                {charities.map((c: any) => (
                  <div key={c.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:border-[#c8f04e]/30 transition-all duration-500 group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold tracking-tight group-hover:text-[#c8f04e] transition-colors">{c.name}</h3>
                      <Badge className="bg-white/5 text-white/40 border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1">
                        {c._count?.userCharities || 0} Supporters
                      </Badge>
                    </div>
                    <p className="text-xs text-white/30 leading-relaxed italic line-clamp-3 font-light">{c.description}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </TabsContent>

          {/* ── WINNERS & PROOFS ── */}
          <TabsContent value="winners">
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <div className="mb-10">
                <h2 className="text-2xl font-bold tracking-tighter mb-2 italic">Claims <span className="text-white/40">Ledger</span></h2>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Verification and payout settlement terminal.</p>
              </div>

              <Table>
                <TableHeader className="bg-white/5 border-none">
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">User</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Match</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Amount</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest font-bold">Proof</TableHead>
                    <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((w: any) => (
                    <TableRow key={w.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <TableCell className="text-xs font-medium">{w.user.email}</TableCell>
                      <TableCell className="text-xs"><Badge className="bg-[#c8f04e]/10 text-[#c8f04e] border-none uppercase text-[8px]">{w.matchType}</Badge></TableCell>
                      <TableCell className="text-xs font-bold">${w.amount.toFixed(2)}</TableCell>
                      <TableCell><Badge className={`border-none uppercase text-[8px] ${w.status === 'paid' ? 'bg-[#c8f04e] text-black' : 'bg-white/5 text-white/40'}`}>{w.status}</Badge></TableCell>
                      <TableCell>
                        {w.proof ? (
                          <div className="space-y-2">
                            <a href={w.proof.fileUrl.startsWith('http') ? w.proof.fileUrl : `https://${w.proof.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-widest text-[#c8f04e] border-b border-[#c8f04e]/20 pb-0.5 hover:text-white transition-colors">View File</a>
                            <Badge className={`block w-fit text-[7px] uppercase tracking-tighter border-none ${w.proof.status === 'approved' ? 'bg-[#c8f04e]/20 text-[#c8f04e]' : 'bg-white/10 text-white/40'}`}>{w.proof.status}</Badge>
                          </div>
                        ) : <span className="text-[8px] uppercase tracking-widest text-white/10 italic">Awaiting proof</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {w.proof && w.proof.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateWinner(w.id, 'pending', w.proof.id, 'approved')} className="h-8 px-4 bg-[#c8f04e] text-black text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">Approve</button>
                              <button onClick={() => handleUpdateWinner(w.id, 'pending', w.proof.id, 'rejected')} className="h-8 px-4 bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all">Reject</button>
                            </>
                          )}
                          {w.status === 'pending' && (
                            <button onClick={() => handleUpdateWinner(w.id, 'paid')} className="h-8 px-4 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-[#c8f04e] transition-all">Mark Paid</button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </TabsContent>

          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="reports"><ReportsAnalytics /></TabsContent>
        </Tabs>
      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f0d; }
        ::-webkit-scrollbar-thumb { background: #1a2421; }
      `}</style>
    </div>
  );
}