"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }
  }),
};

// ─── Premium Components ───────────────────────────────────────────────────────

function LargeStatCard({ value, label, image, delay }: { value: string; label: string; image: string; delay: number }) {
  return (
    <motion.div 
      variants={fadeUp} custom={delay}
      className="group relative h-[650px] w-full overflow-hidden rounded-sm cursor-pointer border border-white/5"
    >
      <Image 
        src={image} alt={label} fill 
        className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.7] group-hover:brightness-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-90" />
      <div className="absolute bottom-12 left-12">
        <div className="text-7xl font-light text-white mb-4 tracking-tighter italic">{value}</div>
        <div className="text-sm uppercase tracking-[0.4em] text-[#c8f04e] font-semibold">{label}</div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0f0d", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar/>
      {/* ── HERO SECTION ── */}
      <section ref={heroRef} className="relative h-screen flex flex-col justify-end overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1800&q=90"
            alt="Premium Fairway"
            fill priority className="object-cover brightness-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/40 to-transparent" />
        </motion.div>

        {/* Text moved more left and slightly more down */}
        <div className="relative z-10 w-full px-8 sm:px-16 pb-12 sm:pb-20">
          <motion.div style={{ opacity: textOpacity }} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-16 bg-[#c8f04e]" />
              <span className="text-[#c8f04e] text-xs uppercase tracking-[0.5em] font-bold">Private Estate Member</span>
            </div>

            <h1 className="text-[clamp(4rem,14vw,9rem)] font-bold leading-[0.8] tracking-tighter mb-12">
              Play golf.<br />
              Win prizes.<br />
              <span className="text-[#c8f04e] italic font-light">Change lives.</span>
            </h1>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-12">
              <Link href="/auth/signup">
                <button className="bg-[#c8f04e] text-[#0a0f0d] font-bold px-14 py-6 rounded-full text-sm hover:scale-105 transition-all duration-500 shadow-2xl shadow-[#c8f04e]/10">
                  JOIN THE CLUB
                </button>
              </Link>
              <div className="max-w-[300px]">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] leading-loose">
                  ESTABLISHED PERFORMANCE <br /> DIRECT CHARITABLE IMPACT <br /> EXCLUSIVE MONTHLY DRAWS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DISCOVER OUR LEGACY (ENLARGED IMAGES) ── */}
      <section className="py-40 px-8 sm:px-16">
        <div className="max-w-[1800px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="grid lg:grid-cols-2 gap-32 mb-32 items-end"
          >
            <motion.div variants={fadeUp}>
              <div className="text-[#c8f04e] text-xs uppercase tracking-[0.5em] mb-8">— ABOUT</div>
              <h2 className="text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-4">
                Discover <br /><span className="italic font-light text-white/60">Our Legacy</span>
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-white/30 text-xl leading-relaxed max-w-lg italic font-light">
              A bespoke platform engineered for those who demand excellence on the fairway and transparency in their giving.
            </motion.p>
          </motion.div>

          {/* Grid changed to 2-columns for larger impact */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <LargeStatCard value="100+" label="Events Yearly" delay={1} image="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200" />
            <LargeStatCard value="32" label="Tournaments Hosted" delay={2} image="https://images.unsplash.com/photo-1592919016381-f07ecd5a244a?w=1200" />
            <LargeStatCard value="85%" label="Retention Rate" delay={3} image="https://images.unsplash.com/photo-1622390764647-7917845f062c?w=1200" />
            <LargeStatCard value="40+" label="Years in Sport" delay={4} image="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200" />
          </motion.div>
        </div>
      </section>

      {/* ── NEW CHARITY FORMAT (LIST STYLE) ── */}
      <section className="py-40 px-8 sm:px-16 bg-[#0d1411]">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-24">
            <h2 className="text-[#c8f04e] text-xs uppercase tracking-[0.5em] font-bold mb-6">Philanthropic Partners</h2>
            <p className="text-5xl font-bold tracking-tighter">Your choice. Their future.</p>
          </div>

          <div className="border-t border-white/10">
            {[
              { id: "01", name: "Children's Cancer Fund", raised: "£12,400", area: "Global Health" },
              { id: "02", name: "Veterans Golf Society", raised: "£8,750", area: "Community Support" },
              { id: "03", name: "Green Earth Initiative", raised: "£6,200", area: "Sustainability" },
              { id: "04", name: "Mental Health Fairways", raised: "£4,100", area: "Mental Wellness" }
            ].map((charity) => (
              <motion.div 
                key={charity.id}
                whileHover={{ x: 20 }}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between py-12 border-b border-white/10 cursor-pointer transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-12">
                  <span className="text-white/20 font-mono text-sm">{charity.id}</span>
                  <div>
                    <h3 className="text-4xl font-bold tracking-tight group-hover:text-[#c8f04e] transition-colors">{charity.name}</h3>
                    <p className="text-white/30 text-xs uppercase tracking-widest mt-2">{charity.area}</p>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 text-right">
                  <div className="text-2xl font-light italic text-[#c8f04e]">{charity.raised}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/20">Total Contributions</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-24 px-16 border-t border-white/5">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-3xl font-bold tracking-tighter italic">GOLF CHARITY<span className="text-[#c8f04e]">.</span></div>
          <div className="flex gap-12 text-[10px] uppercase tracking-[0.4em] text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/10">
            © 2026 DIGITAL HEROES SELECTION PROCESS
          </div>
        </div>
      </footer>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f0d; }
        ::-webkit-scrollbar-thumb { background: #1a2421; }
        selection { background: #c8f04e; color: #0a0f0d; }
      `}</style>
    </div>
  );
}