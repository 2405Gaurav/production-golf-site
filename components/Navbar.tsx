"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type AuthState = { role: string } | null | 'loading';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [auth, setAuth] = useState<AuthState>('loading');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setAuth(data ? { role: data.user.role } : null))
      .catch(() => setAuth(null));
  }, []);

  useEffect(() => {
    const refetch = () => {
      fetch('/api/auth/me')
        .then(r => r.ok ? r.json() : null)
        .then(data => setAuth(data ? { role: data.user.role } : null))
        .catch(() => setAuth(null));
    };
    window.addEventListener('auth-changed', refetch);
    return () => window.removeEventListener('auth-changed', refetch);
  }, []);

  const isAdmin = auth !== 'loading' && auth?.role === 'admin';
  const isUser  = auth !== 'loading' && auth?.role === 'user';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "py-3 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/5"
          : "py-6 bg-transparent"
      }`}
    >
      {/* Increased max-w to 1750px to push items to the ends */}
      <div className="max-w-[1750px] mx-auto px-6 sm:px-10 flex items-center justify-between">
        
        {/* Logo at the left end */}
        <Link href="/" className="group">
          <div className="text-lg sm:text-xl font-bold tracking-tighter italic text-white flex items-center gap-1">
            GOLF CHARITY
            <span className="text-[#c8f04e] group-hover:scale-125 transition-transform duration-300">.</span>
          </div>
        </Link>

        {/* Navigation at the right end */}
        <div className="flex items-center gap-6 sm:gap-10">

          {auth === 'loading' && (
            <div className="w-20 h-3 rounded-full bg-white/5 animate-pulse" />
          )}

          {auth === null && (
            <>
              <Link
                href="/auth/login"
                className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60 hover:text-[#c8f04e] transition-colors"
              >
                Sign In
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#c8f04e] text-[#0a0f0d] px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#c8f04e]/10 hover:bg-[#d8ff5e] transition-colors"
                >
                  Join Now
                </motion.button>
              </Link>
            </>
          )}

          {isUser && (
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#c8f04e] text-[#0a0f0d] px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#c8f04e]/10 hover:bg-[#d8ff5e] transition-colors"
              >
                Dashboard
              </motion.button>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin"
                className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60 hover:text-[#c8f04e] transition-colors"
              >
                Admin
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#c8f04e] text-[#0a0f0d] px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#c8f04e]/10 hover:bg-[#d8ff5e] transition-colors"
                >
                  Dashboard
                </motion.button>
              </Link>
            </>
          )}

        </div>
      </div>
    </motion.nav>
  );
}