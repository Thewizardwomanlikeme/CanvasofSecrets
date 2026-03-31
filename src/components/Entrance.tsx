import React from 'react';
import { motion } from 'motion/react';
import { Lock, History, Eye, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Entrance() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-8 md:px-24 relative overflow-hidden">
      {/* Hero Decorative Frame */}
      <div className="absolute inset-8 border border-secondary/20 pointer-events-none" />
      
      <section className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col gap-8"
        >
          <span className="text-secondary font-headline tracking-[0.4em] uppercase text-xs">Entrance MCCCCLII</span>
          <h1 className="font-headline text-6xl md:text-8xl text-primary leading-tight tracking-tighter">
            Canvas of <br /> <span className="italic font-light">Whispers</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-primary/70 max-w-lg leading-relaxed italic">
            "Whisper your secrets into the eternal glass. What is hidden in Vitra, remains sacred in Arcana."
          </p>
          
          <div className="mt-8 flex flex-wrap gap-6 relative z-10">
            <button 
              onClick={() => navigate('/inscribe')}
              className="wax-seal-shadow bg-wax text-surface font-headline px-10 py-6 text-lg tracking-widest transition-transform active:scale-95 hover:bg-red-900 flex items-center gap-3"
            >
              Inscribe Secret
              <Lock className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/reveal')}
              className="bg-surface-highest text-primary font-headline px-10 py-6 text-lg tracking-widest transition-transform active:scale-95 hover:bg-surface-low border border-primary/10 flex items-center gap-3"
            >
              Reveal Arcana
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative order-first lg:order-last"
        >
          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-secondary/5 rounded-full blur-[100px] animate-pulse" />
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3ZvDkYvg7M6Fl_c0VzRzc2zhmeSKa74B_7pZGLZ4HGUSuCZjkvYOcvGkVY87Dlb6bvbCGy8EK84Fzt1GIcu72aLCGgZh-dqHvoqa_3492AUtxk5qSmsH7HPclWPgnNYFd3eWsN-RyFM1G3BPQkrvOA1j3RlxIf8-TZwA37tC2vWVG5qlPJTjDt2Uf-OHiEpawhO1QjzQVJPo3_jzdiAot0f4k0aukVJJRDxsPoHwEyIpiGdaRYMIsN6TkOTBnBEXi3qFJPg00n4" 
              alt="Da Vinci Sketch"
              className="w-full h-full object-contain mix-blend-multiply opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full glass-lens flex items-center justify-center">
              <span className="text-[0.6rem] text-primary/40 font-mono text-center px-4 leading-none uppercase tracking-widest">
                Secreta <br /> Vitrum <br /> Arcanum <br /> MCCCCLII
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid */}
      <section className="max-w-7xl w-full mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-10 bg-surface-low flex flex-col gap-4 border-l-4 border-secondary">
          <History className="text-secondary w-10 h-10" />
          <h3 className="font-headline text-2xl text-primary">Ink of Ages</h3>
          <p className="text-primary/60 leading-relaxed">Cryptographic journals forged in the fires of Florentine alchemy. Accessible only to the worthy.</p>
        </div>
        <div className="p-10 bg-surface-highest flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity" />
          <Eye className="text-secondary w-10 h-10" />
          <h3 className="font-headline text-2xl text-primary">The Vitra Lens</h3>
          <p className="text-primary/60 leading-relaxed">Revealing truths hidden in plain sight. Use the glass to decipher the unwritten laws of the guild.</p>
        </div>
        <div className="p-10 bg-surface-low flex flex-col gap-4 border-r-4 border-secondary/40">
          <BookOpen className="text-secondary w-10 h-10" />
          <h3 className="font-headline text-2xl text-primary">Grand Ledger</h3>
          <p className="text-primary/60 leading-relaxed">A permanent record of secrets, bound in vellum and secured by the geometry of the ancients.</p>
        </div>
      </section>
    </div>
  );
}
