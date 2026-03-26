'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import CharitiesTab from '@/components/admin/CharitiesTab';
import {  
  Heart, 
  Users, 
  Trophy, 
  BarChart3, 
  LogOut,  
  AlertCircle,
  Play,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import ReportsAnalytics from '@/components/admin/ReportAndAnalytic';
import AdminUsers from '@/components/admin/AdminUsers';
import Link from 'next/link';

// Animation Variants - Scaled down Y movement
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.08, 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    }
  })
};

export default function AdminPage() {
  const [charities, setCharities] = useState([]);
  const [winners, setWinners] = useState([]);
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
        <div className="text-[#c8f04e] text-[10px] uppercase tracking-[0.5em] font-bold animate-pulse">Initializing Terminal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white selection:bg-[#c8f04e] selection:text-[#0a0f0d]">
      
      {/* ── TOP NAV ── (Scaled Down Height) */}
     <nav className="border-b border-white/5 bg-[#0a0f0d]/80 backdrop-blur-xl sticky top-0 z-50">
  <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
    <div className="grid grid-cols-3 items-center h-16">

      {/* LEFT */}
      <div className="flex items-center">
        <Link
          href="/"
          className="group flex items-center gap-2 text-white/30 hover:text-[#c8f04e] transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold hidden sm:block">
            Home
          </span>
        </Link>
      </div>

      {/* CENTER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2.5"
      >
        <div className="w-7 h-7 rounded-full bg-[#c8f04e] flex items-center justify-center text-[#0a0f0d] font-black italic text-[11px]">
          A
        </div>
        <h1 className="text-lg font-bold tracking-tight italic">
          ADMIN<span className="text-white/30 font-normal"> PANEL</span>
        </h1>
      </motion.div>

      {/* RIGHT */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-white/40 hover:text-[#c8f04e] gap-2 text-[10px] uppercase tracking-[0.25em] px-0 hover:bg-transparent"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </Button>
      </div>

    </div>
  </div>
</nav>

      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8"> {/* Reduced padding */}
        
        <Tabs defaultValue="draws" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-full h-11 flex items-center gap-1.5 max-w-fit px-1.5">
            {[
              { val: 'draws', label: 'Draws', icon: <Play className="w-3 h-3" /> },
              { val: 'charities', label: 'Charities', icon: <Heart className="w-3 h-3" /> },
              { val: 'users', label: 'Users', icon: <Users className="w-3 h-3" /> },
              { val: 'winners', label: 'Claims', icon: <Trophy className="w-3 h-3" /> },
              { val: 'reports', label: 'Reports', icon: <BarChart3 className="w-3 h-3" /> },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.val} 
                value={tab.val}
                className="rounded-full px-4 h-8 data-[state=active]:bg-[#c8f04e] data-[state=active]:text-black text-[8.5px] uppercase tracking-widest font-bold gap-2 transition-all"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── DRAW MANAGEMENT ── */}
         <TabsContent value="draws" className="outline-none">
  <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="max-w-3xl space-y-6">
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 md:p-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tighter mb-1.5 italic">
          Monthly <span className="text-white/40">Draw Engine</span>
        </h2>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-semibold leading-relaxed">
          System-wide number generation and prize distribution.
        </p>
      </div>

      <div className="space-y-6">
        {/* IMPROVED DROPDOWN SECTION */}
        <div className="flex items-center gap-5 p-3.5 bg-black/40 rounded-lg border border-white/10 max-w-sm">
          <Label className="text-[9px] uppercase tracking-widest text-white/40 shrink-0">Algorithm Mode</Label>
          <div className="relative flex-1">
            <select
              className="w-full bg-transparent text-[#c8f04e] font-bold text-[10px] uppercase tracking-widest border-none outline-none cursor-pointer appearance-none pr-4"
              value={drawMode}
              onChange={e => setDrawMode(e.target.value as 'random' | 'algorithmic')}
              style={{ backgroundColor: 'transparent' }}
            >
              {/* Note: Native options have limited styling, but adding classes helps in some browsers */}
              <option value="random" className="bg-[#121212] text-white">Pure Random</option>
              <option value="algorithmic" className="bg-[#121212] text-white">Weighted Algorithmic</option>
            </select>
            {/* Custom Arrow for the dropdown */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-3 h-3 text-[#c8f04e]" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {/* VISIBILITY FIX: Changed Run Simulation from outline to a visible subtle background */}
          <Button 
            variant="ghost" 
            onClick={handleSimulate} 
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-[9px] uppercase tracking-widest font-bold h-10 px-6 transition-all"
          >
            Run Simulation
          </Button>
          
          <Button 
            onClick={handleCreateDraw} 
            disabled={!!draftDraw} 
            className="bg-white text-black hover:bg-[#c8f04e] disabled:opacity-50 text-[9px] uppercase tracking-widest font-bold h-10 px-6"
          >
            Generate Draft
          </Button>
        </div>

        {/* Draft section */}
        {draftDraw && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="border border-[#c8f04e]/30 bg-[#c8f04e]/[0.03] rounded-xl p-6 relative overflow-hidden mt-4 shadow-[0_0_20px_rgba(200,240,78,0.05)]"
          >
            <div className="absolute top-0 right-0 p-3"><AlertCircle className="text-[#c8f04e] w-3.5 h-3.5 opacity-50" /></div>
            <p className="text-[#c8f04e] text-[9px] uppercase tracking-[0.4em] font-black mb-4 italic flex items-center gap-2">
              <span className="w-1 h-1 bg-[#c8f04e] rounded-full animate-ping" />
              Draft Ready — Confirm Results
            </p>
            
            <div className="flex gap-2.5 mb-6">
              {JSON.parse(draftDraw.numbers).map((n: number, i: number) => (
                <div key={i} className="w-8 h-8 rounded-full border border-[#c8f04e] flex items-center justify-center font-black text-[#c8f04e] text-xs">{n}</div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-[10px] text-white/60">Identified <span className="text-white font-bold">{draftWinners.length} winner(s)</span></p>
              {draftWinners.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {draftWinners.map((w: any) => (
                    <div key={w.id} className="text-[9px] p-2 bg-black/60 rounded border border-white/5 flex justify-between items-center">
                      <span className="text-white/40 truncate max-w-[120px]">{w.user?.email}</span>
                      <span className="text-[#c8f04e] font-bold">£{w.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handlePublish} className="w-full bg-[#c8f04e] text-black font-black uppercase tracking-[0.3em] h-10 text-[9px] rounded-lg hover:bg-white transition-colors">
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
            <CharitiesTab charities={charities} onRefresh={fetchCharities} />
          </TabsContent>

          {/* ── WINNERS & PROOFS ── */}
          <TabsContent value="winners">
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="bg-white/[0.02] border border-white/5 rounded-xl p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tighter mb-1 italic">Claims <span className="text-white/40">Ledger</span></h2>
                <p className="text-[9px] uppercase tracking-widest text-white/30">Verification and payout settlement terminal.</p>
              </div>

              <Table>
                <TableHeader className="bg-white/5 border-none">
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase tracking-widest font-bold">User</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest font-bold">Match</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest font-bold">Amount</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest font-bold">Status</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest font-bold">Proof</TableHead>
                    <TableHead className="text-right text-[9px] uppercase tracking-widest font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((w: any) => (
                    <TableRow key={w.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <TableCell className="text-[11px] font-medium py-3">{w.user.email}</TableCell>
                      <TableCell className="py-3"><Badge className="bg-[#c8f04e]/10 text-[#c8f04e] border-none uppercase text-[7.5px]">{w.matchType}</Badge></TableCell>
                      <TableCell className="text-[11px] font-bold py-3">£{w.amount.toFixed(2)}</TableCell>
                      <TableCell className="py-3"><Badge className={`border-none uppercase text-[7.5px] ${w.status === 'paid' ? 'bg-[#c8f04e] text-black' : 'bg-white/5 text-white/40'}`}>{w.status}</Badge></TableCell>
                      <TableCell className="py-3">
                        {w.proof ? (
                          <div className="space-y-1">
                            <a href={w.proof.fileUrl.startsWith('http') ? w.proof.fileUrl : `https://${w.proof.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase tracking-widest text-[#c8f04e] hover:text-white transition-colors">View File</a>
                            <Badge className={`block w-fit text-[6.5px] uppercase tracking-tighter border-none ${w.proof.status === 'approved' ? 'bg-[#c8f04e]/20 text-[#c8f04e]' : 'bg-white/10 text-white/40'}`}>{w.proof.status}</Badge>
                          </div>
                        ) : <span className="text-[7.5px] uppercase tracking-widest text-white/10 italic">Awaiting proof</span>}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex justify-end gap-1.5">
                          {w.proof && w.proof.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateWinner(w.id, 'pending', w.proof.id, 'approved')} className="h-7 px-3 bg-[#c8f04e] text-black text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">Approve</button>
                              <button onClick={() => handleUpdateWinner(w.id, 'pending', w.proof.id, 'rejected')} className="h-7 px-3 bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all">Reject</button>
                            </>
                          )}
                          {w.status === 'pending' && (
                            <button onClick={() => handleUpdateWinner(w.id, 'paid')} className="h-7 px-3 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-[#c8f04e] transition-all">Mark Paid</button>
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
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0f0d; }
        ::-webkit-scrollbar-thumb { background: #1a2421; }
      `}</style>
    </div>
  );
}