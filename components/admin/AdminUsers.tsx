'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  UserCog, 
  Mail, 
  ShieldCheck, 
  Trophy, 
  Heart, 
  Plus, 
  Trash2, 
  Save, 
  X,
  CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
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

// Animation Variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.05, 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
    }
  })
};

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  subscription: { plan: string; status: string; startDate: string } | null;
  scores: { id: string; value: number; date: string }[];
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

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
      throw new Error(err.error ?? 'Modification failed');
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setSaveError('');
    try {
      if (editEmail !== selectedUser.email) await patch('update_profile', { email: editEmail });
      const originalScores = selectedUser.scores.map((s) => String(s.value));
      if (editScores.join(',') !== originalScores.join(',')) {
        const parsed = editScores.filter((v) => v.trim() !== '').map((v) => parseInt(v));
        await patch('update_scores', { scores: parsed });
      }
      if (editPlan !== (selectedUser.subscription?.plan ?? '') || editStatus !== (selectedUser.subscription?.status ?? '')) {
        await patch('update_subscription', { plan: editPlan || undefined, status: editStatus || undefined });
      }
      await fetchUsers();
      setDialogOpen(false);
    } catch (e: any) { setSaveError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
      <div className="text-[#c8f04e] text-[10px] uppercase tracking-[0.5em] font-bold animate-pulse">Scanning Member Directory...</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter italic">Member <span className="text-white/40 font-normal">Directory</span></h2>
            <p className="text-[10px] uppercase tracking-widest text-white/20 mt-1">Official Estate Registry</p>
          </div>
          <Badge className="bg-[#c8f04e]/10 text-[#c8f04e] border-none uppercase text-[8px] tracking-widest px-3 py-1">
            {users.length} Identities
          </Badge>
        </div>

        <Table>
          <TableHeader className="bg-white/5 border-none">
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-widest font-bold px-8 h-14">Identity</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Clearance</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Subscription</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Ledger</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Impact</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, idx) => (
              <motion.tr 
                key={u.id}
                variants={fadeUp}
                custom={idx + 2}
                className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
              >
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 group-hover:bg-[#c8f04e] group-hover:text-black transition-all">
                      {u.email[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-white/80">{u.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`border-none uppercase text-[8px] tracking-widest ${u.role === 'admin' ? 'bg-[#c8f04e] text-black' : 'bg-white/5 text-white/40'}`}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.subscription ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${u.subscription.status === 'active' ? 'bg-[#c8f04e]' : 'bg-white/20'}`} />
                        <span className="text-[10px] font-black uppercase text-white tracking-tighter">{u.subscription.status}</span>
                      </div>
                      <p className="text-[8px] uppercase tracking-widest text-white/20">{u.subscription.plan}</p>
                    </div>
                  ) : <span className="text-[8px] uppercase tracking-widest text-white/10 italic">—</span>}
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-1">
                      {u.scores.length > 0 ? u.scores.slice(0, 3).map((s, i) => (
                        <div key={i} className="text-[10px] font-bold text-white/40">{s.value}{i < 2 && u.scores.length > 1 ? ',' : ''}</div>
                      )) : <span className="text-[8px] uppercase tracking-widest text-white/10 italic">Empty</span>}
                      {u.scores.length > 3 && <span className="text-[8px] text-white/20">+{u.scores.length - 3}</span>}
                   </div>
                </TableCell>
                <TableCell>
                  {u.userCharity ? (
                    <div>
                      <p className="text-[10px] font-bold text-white tracking-tight">{u.userCharity.charity.name}</p>
                      <p className="text-[8px] uppercase tracking-widest text-[#c8f04e]">{u.userCharity.percentage}% Dedication</p>
                    </div>
                  ) : <span className="text-[8px] uppercase tracking-widest text-white/10 italic">Unset</span>}
                </TableCell>
                <TableCell className="text-right px-8">
                  <button 
                    onClick={() => openDialog(u)}
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-[#c8f04e] transition-colors"
                  >
                    Modify —
                  </button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* ── EDIT DIALOG (ESTATE OVERRIDE) ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-[#0a0f0d] border border-white/10 text-white p-0 overflow-hidden rounded-2xl shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tighter italic">Member <span className="text-white/40 font-normal">Profile</span></DialogTitle>
              <div className="text-[9px] uppercase tracking-[0.4em] text-[#c8f04e] mt-1 font-bold">Secure Modification Terminal</div>
            </DialogHeader>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-transparent border-b border-white/5 w-full flex justify-start h-14 px-8 gap-8 rounded-none">
              {[
                { val: 'profile', icon: <Mail className="w-3 h-3" />, label: 'Identity' },
                { val: 'scores', icon: <Trophy className="w-3 h-3" />, label: 'Ledger' },
                { val: 'subscription', icon: <CreditCard className="w-3 h-3" />, label: 'Plan' },
              ].map(t => (
                <TabsTrigger 
                  key={t.val} 
                  value={t.val} 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-[#c8f04e] data-[state=active]:border-b-2 data-[state=active]:border-[#c8f04e] rounded-none px-0 h-14 text-[9px] uppercase tracking-[0.2em] font-bold gap-2 text-white/30 transition-all border-b-2 border-transparent"
                >
                  {t.icon} {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-8">
              <TabsContent value="profile" className="space-y-8 mt-0 outline-none">
                <div className="space-y-3">
                  <Label className="text-[9px] uppercase tracking-[0.3em] text-white/40 ml-1">Official Email</Label>
                  <Input 
                    className="bg-[#141b18] border-white/5 text-white h-12 focus:border-[#c8f04e]/50" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)} 
                    type="email" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="text-[7px] uppercase tracking-[0.3em] text-white/20 mb-1">Clearance</div>
                      <div className="text-xs font-bold text-white uppercase">{selectedUser?.role}</div>
                   </div>
                   <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="text-[7px] uppercase tracking-[0.3em] text-white/20 mb-1">Enlisted</div>
                      <div className="text-xs font-bold text-white">{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}</div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="scores" className="space-y-6 mt-0 outline-none">
                <p className="text-[10px] uppercase tracking-widest text-white/30 italic">Modify Member Round History (1–45 pts)</p>
                <div className="space-y-3">
                  {editScores.map((val, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      <span className="text-[9px] font-mono text-white/20 w-4">{i + 1}</span>
                      <Input
                        type="number" min="1" max="45"
                        value={val}
                        onChange={(e) => {
                          const next = [...editScores];
                          next[i] = e.target.value;
                          setEditScores(next);
                        }}
                        className="h-10 w-24 bg-black/40 border-white/5 text-[#c8f04e] font-black italic"
                      />
                      <button 
                        onClick={() => setEditScores(editScores.filter((_, idx) => idx !== i))}
                        className="ml-auto p-2 text-white/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                {editScores.length < 5 && (
                  <Button variant="ghost" className="text-[9px] uppercase tracking-widest text-[#c8f04e] hover:bg-[#c8f04e]/5" onClick={() => setEditScores([...editScores, ''])}>
                    <Plus className="w-3 h-3 mr-2" /> Add Score Row
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="subscription" className="space-y-8 mt-0 outline-none">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[9px] uppercase tracking-[0.3em] text-white/40 ml-1">Tier Selection</Label>
                    <select
                      className="w-full bg-[#141b18] border border-white/5 rounded-lg px-4 h-12 text-xs text-white outline-none focus:border-[#c8f04e]/50 transition-all appearance-none"
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                    >
                      <option value="">No Active Tier</option>
                      <option value="monthly">Monthly Membership</option>
                      <option value="yearly">Yearly Estate Pass</option>
                    </select>
                  </div>
                  {editPlan && (
                    <div className="space-y-3">
                      <Label className="text-[9px] uppercase tracking-[0.3em] text-white/40 ml-1">Access Status</Label>
                      <select
                        className="w-full bg-[#141b18] border border-white/5 rounded-lg px-4 h-12 text-xs text-white outline-none focus:border-[#c8f04e]/50 transition-all appearance-none"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="active">Clearance: Active</option>
                        <option value="inactive">Clearance: Revoked</option>
                      </select>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-8 bg-white/[0.02] border-t border-white/5">
            {saveError && <p className="text-[9px] uppercase tracking-widest text-red-400 font-bold mb-6 italic">{saveError}</p>}
            <DialogFooter className="gap-4">
              <Button variant="ghost" className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-[#c8f04e] text-black font-black uppercase tracking-[0.3em] text-[10px] h-12 px-8 rounded-lg shadow-xl shadow-[#c8f04e]/10"
              >
                {saving ? 'Synchronizing...' : (
                  <span className="flex items-center gap-2">Commit Changes <Save className="w-4 h-4" /></span>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}