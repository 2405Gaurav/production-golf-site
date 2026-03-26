'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Fixed Animation Variants with explicit typing
const fadinScale: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

   // login.tsx & signup.tsx - replace the success block
if (response.ok) {
  const data = await response.json();
  // Dispatch event so Navbar re-checks auth
  window.dispatchEvent(new Event('auth-changed'));
  if (data.user.role === 'admin') {
    router.replace('/admin');
  } else {
    router.replace('/dashboard');
  }
} else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f0d] selection:bg-[#c8f04e] selection:text-[#0a0f0d]">
      
      {/* ── BACK TO HOME ── */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 lg:left-auto lg:right-8 z-50 flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-[#c8f04e] transition-colors group"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      
      {/* ── LEFT SIDE: CINEMATIC IMAGE ── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* Golf + Charity Image: A misty, cinematic course representation */}
          <Image 
            src="https://images.unsplash.com/photo-1591491640784-3232eb748d4b?w=1600&q=90" 
            alt="The Gift of the Game" 
            fill 
            className="object-cover grayscale-[0.4] brightness-[0.5]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0f0d]/70" />
        <div className="absolute bottom-16 left-16 z-10">
          <motion.div custom={4} variants={fadinScale} initial="hidden" animate="visible">
            <div className="text-3xl font-bold tracking-tighter italic text-white mb-2 uppercase">
              Impact<span className="text-[#c8f04e]">.</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-medium max-w-[200px] leading-loose">
              Every round logged funds a legacy.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT SIDE: SIGN UP FORM ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-20 relative">
        
        <motion.div 
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px]"
        >
          {/* Header Section */}
          <div className="mb-14">
            <motion.h1 custom={0} variants={fadinScale} className="text-6xl font-bold tracking-tighter text-white mb-4">
              Apply <span className="italic font-light text-white/50">Now</span>
            </motion.h1>
            <motion.p custom={1} variants={fadinScale} className="text-[11px] uppercase tracking-[0.4em] text-white/30 font-semibold">
              Join the club and start making a difference
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Input Email */}
            <motion.div custom={2} variants={fadinScale} className="space-y-3">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.4em] text-white/40 ml-1 font-bold">
                Account Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@estate.com"
                className="bg-[#141b18] border-white/5 text-white h-16 rounded-sm px-6 text-base focus:border-[#c8f04e]/50 focus:ring-1 focus:ring-[#c8f04e]/20 transition-all duration-300 placeholder:text-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            {/* Input Password */}
            <motion.div custom={3} variants={fadinScale} className="space-y-3">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.4em] text-white/40 ml-1 font-bold">
                Set Security Code
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-[#141b18] border-white/5 text-white h-16 rounded-sm px-6 text-base focus:border-[#c8f04e]/50 focus:ring-1 focus:ring-[#c8f04e]/20 transition-all duration-300 placeholder:text-white/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </motion.div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold px-1">{error}</p>
            )}

            {/* Submit Button */}
            <motion.div custom={4} variants={fadinScale} className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-16 bg-[#c8f04e] hover:bg-[#d8ff5e] text-[#0a0f0d] font-black text-[11px] uppercase tracking-[0.4em] rounded-sm transition-all duration-500 shadow-2xl shadow-[#c8f04e]/10 active:scale-95"
                disabled={loading}
              >
                {loading ? 'Processing Application...' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          {/* Footer Reveal */}
          <motion.div 
            custom={5} 
            variants={fadinScale}
            className="mt-16 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6"
          >
            <p className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-medium">
              Already have an account?
            </p>
            <Link href="/auth/login" className="group flex items-center gap-2 text-[#c8f04e] font-bold text-[11px] uppercase tracking-[0.3em] hover:text-white transition-colors">
              Sign In 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}