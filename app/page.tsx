"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 }, 
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }
  }),
};

// ─── Premium Components ───────────────────────────────────────────────────────

function LargeStatCard({ value, label, image, delay }: { value: string; label: string; image: string; delay: number }) {
  return (
    <motion.div 
      variants={fadeUp} custom={delay}
      className="group relative h-[320px] w-full overflow-hidden rounded-sm cursor-pointer border border-white/5" // Reduced from 380px to 320px
    >
      <Image 
        src={image} alt={label} fill 
        className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.7] group-hover:brightness-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-90" />
      <div className="absolute bottom-5 left-5">
        <div className="text-3xl font-light text-white mb-1 tracking-tighter italic">{value}</div> {/* Smaller text */}
        <div className="text-[8px] uppercase tracking-[0.4em] text-[#c8f04e] font-semibold">{label}</div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0f0d", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar/>
      
      {/* ── HERO SECTION ── */}
      {/* Changed h-[85vh] to h-screen to hide the About section below the fold */}
      <section ref={heroRef} className="relative h-screen flex flex-col justify-end overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1800&q=90"
            alt="Premium Fairway"
            fill priority className="object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/30 to-transparent" />
        </motion.div>

        {/* pb-4 pushes the text to the very bottom of the hero section */}
        <div className="relative z-10 w-full px-10 sm:px-12 pb-4 sm:pb-6 mb-8 ml-3"> 
          <motion.div style={{ opacity: textOpacity }} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-[#c8f04e]" />
              <span className="text-[#c8f04e] text-[10px] uppercase tracking-[0.5em] font-bold">Private Estate Member</span>
            </div>

            <h1 className="text-[clamp(2.5rem,7vw,5.8rem)] font-bold leading-[0.85] tracking-tighter mb-6"> {/* Scaled down more */}
              Play golf.<br />
              Win prizes.<br />
              <span className="text-[#c8f04e] italic font-light">Change lives.</span>
            </h1>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Link href="/auth/signup">
                <button className="bg-[#c8f04e] text-[#0a0f0d] font-bold px-7 py-3 rounded-full text-[14px] hover:scale-105 transition-all duration-500 shadow-xl shadow-[#c8f04e]/10">
                  JOIN THE CLUB
                </button>
              </Link>
              <div className="max-w-[200px]">
                <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] leading-loose">
                  ESTABLISHED PERFORMANCE <br /> DIRECT CHARITABLE IMPACT <br /> EXCLUSIVE MONTHLY DRAWS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DISCOVER OUR LEGACY (FURTHER REDUCED) ── */}
      <section className="py-16 px-8 sm:px-12"> {/* Reduced padding */}
        <div className="max-w-[1100px] mx-auto"> {/* Tightened container further to 1100px */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} 
            className="grid lg:grid-cols-2 gap-10 mb-12 items-end"
          >
            <motion.div variants={fadeUp}>
              <div className="text-[#c8f04e] text-[8px] uppercase tracking-[0.5em] mb-3">— ABOUT</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none mb-2"> {/* Smaller headings */}
                Discover <br /><span className="italic font-light text-white/60">Our Legacy</span>
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} className="text-white/30 text-sm leading-relaxed max-w-sm italic font-light"> {/* Smaller body text */}
              A bespoke platform engineered for those who demand excellence on the fairway and transparency in their giving.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4" 
          >
            <LargeStatCard value="100+" label="Events Yearly" delay={1} image="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200" />
            <LargeStatCard value="32" label="Tournaments Hosted" delay={2} image="https://images.unsplash.com/photo-1592919016381-f07ecd5a244a?w=1200" />
            <LargeStatCard value="85%" label="Retention Rate" delay={3} image="https://images.unsplash.com/photo-1622390764647-7917845f062c?w=1200" />
            <LargeStatCard value="40+" label="Years in Sport" delay={4} image="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200" />
          </motion.div>
        </div>
      </section>

      {/* ── CHARITY SECTION ── */}
      <section className="py-16 px-8 sm:px-12 bg-[#0d1411]">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-10">
            <h2 className="text-[#c8f04e] text-[8px] uppercase tracking-[0.5em] font-bold mb-2">Philanthropic Partners</h2>
            <p className="text-2xl font-bold tracking-tighter">Your choice. Their future.</p>
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
                whileHover={{ x: 8 }}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between py-5 border-b border-white/10 cursor-pointer transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-8">
                  <span className="text-white/20 font-mono text-[9px]">{charity.id}</span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight group-hover:text-[#c8f04e] transition-colors">{charity.name}</h3>
                    <p className="text-white/30 text-[7px] uppercase tracking-widest mt-1">{charity.area}</p>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 text-right">
                  <div className="text-base font-light italic text-[#c8f04e]">{charity.raised}</div>
                  <div className="text-[7px] uppercase tracking-widest text-white/20">Total Contributions</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-12 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-bold tracking-tighter italic">GOLF CHARITY<span className="text-[#c8f04e]">.</span></div>
          <div className="flex gap-8 text-[8px] uppercase tracking-[0.4em] text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[8px] uppercase tracking-[0.3em] text-white/10">
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