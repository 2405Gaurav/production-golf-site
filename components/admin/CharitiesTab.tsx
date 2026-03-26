'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { PlusCircle, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

interface Charity {
  id: string;
  name: string;
  description: string;
  _count?: { userCharities: number };
}

interface Props {
  charities: Charity[];
  onRefresh: () => void;
}

export default function CharitiesTab({ charities, onRefresh }: Props) {
  const [newCharity, setNewCharity] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Inline edit state: { [charityId]: { name, description } }
  const [editing, setEditing] = useState<Record<string, { name: string; description: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharity),
      });
      if (res.ok) {
        setNewCharity({ name: '', description: '' });
        onRefresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c: Charity) => {
    setEditing(prev => ({ ...prev, [c.id]: { name: c.name, description: c.description } }));
  };

  const cancelEdit = (id: string) => {
    setEditing(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleUpdate = async (id: string) => {
    const fields = editing[id];
    if (!fields) return;
    setSaving(id);
    try {
      const res = await fetch('/api/admin/charities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields }),
      });
      if (res.ok) {
        cancelEdit(id);
        onRefresh();
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-10 items-start">

      {/* ── CREATE FORM ── */}
      <motion.div
        custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold tracking-tight mb-8 italic">
          New <span className="text-white/40">Entity</span>
        </h3>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Official Name</Label>
            <Input
              className="bg-black border-white/5 text-white h-12"
              value={newCharity.name}
              onChange={e => setNewCharity({ ...newCharity, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Entity Mission</Label>
            <Textarea
              className="bg-black border-white/5 text-white min-h-[120px]"
              value={newCharity.description}
              onChange={e => setNewCharity({ ...newCharity, description: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={creating}
            className="w-full bg-white text-black font-bold uppercase tracking-widest h-12 hover:bg-[#c8f04e] transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {creating ? 'Creating...' : 'Create Charity'}
          </Button>
        </form>
      </motion.div>

      {/* ── CHARITY CARDS ── */}
      <motion.div
        custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="lg:col-span-8 grid md:grid-cols-2 gap-4"
      >
        {charities.map((c) => {
          const isEditing = !!editing[c.id];
          const editFields = editing[c.id];
          const isSaving = saving === c.id;

          return (
            <div
              key={c.id}
              className={`p-6 bg-white/[0.02] border rounded-xl transition-all duration-500 group ${
                isEditing ? 'border-[#c8f04e]/30 bg-[#c8f04e]/[0.02]' : 'border-white/5 hover:border-[#c8f04e]/20'
              }`}
            >
              {!isEditing ? (
                /* ── VIEW MODE ── */
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold tracking-tight group-hover:text-[#c8f04e] transition-colors flex-1 mr-3">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-white/5 text-white/40 border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1">
                        {c._count?.userCharities ?? 0} Supporters
                      </Badge>
                      <button
                        onClick={() => startEdit(c)}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#c8f04e]/20 hover:text-[#c8f04e] flex items-center justify-center transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed italic line-clamp-3 font-light">
                    {c.description}
                  </p>
                </>
              ) : (
                /* ── EDIT MODE ── */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-widest text-[#c8f04e]/60">Name</Label>
                    <Input
                      className="bg-black border-[#c8f04e]/20 text-white h-10 text-sm focus:border-[#c8f04e]/50"
                      value={editFields.name}
                      onChange={e => setEditing(prev => ({ ...prev, [c.id]: { ...prev[c.id], name: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-widest text-[#c8f04e]/60">Mission</Label>
                    <Textarea
                      className="bg-black border-[#c8f04e]/20 text-white text-sm min-h-[90px] focus:border-[#c8f04e]/50"
                      value={editFields.description}
                      onChange={e => setEditing(prev => ({ ...prev, [c.id]: { ...prev[c.id], description: e.target.value } }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdate(c.id)}
                      disabled={isSaving}
                      className="flex-1 h-9 bg-[#c8f04e] text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#d8ff5e] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => cancelEdit(c.id)}
                      disabled={isSaving}
                      className="h-9 px-4 bg-white/5 text-white/40 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {charities.length === 0 && (
          <div className="md:col-span-2 py-20 text-center text-white/10 text-[10px] uppercase tracking-[0.4em]">
            No charities registered yet.
          </div>
        )}
      </motion.div>
    </div>
  );
}