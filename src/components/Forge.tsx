import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Fingerprint, Scan } from 'lucide-react';

export function Forge() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  return (
    <main className="flex-1 pt-32 pb-24 px-8 md:px-20 min-h-screen relative overflow-hidden bg-tertiary text-surface">
      <div className="absolute inset-0 paper-grain opacity-5" />
      
      {/* Decorative Circles */}
      <div className="absolute top-20 right-20 w-96 h-96 border border-secondary opacity-10 astronomical-rotation pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 border-l border-t border-secondary opacity-5 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        <div className="text-center mb-16">
          <span className="text-secondary font-headline italic text-lg block mb-2 tracking-widest">Opus Alchemicum</span>
          <h1 className="text-5xl md:text-7xl font-headline tracking-widest uppercase mb-4">The Forge</h1>
          <div className="h-px w-32 bg-secondary mx-auto" />
        </div>

        <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
          {/* Astro Chart Background */}
          <div className="absolute inset-0 astronomical-rotation opacity-20">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjzUtM4PNlsl7OBlXbfcoJSgmWXLgj420n9uzTQCxwlZp_s8Oss7GO1uUxb3p1EGI0DCrZVhuhYLac7EgiTtjMl4FreXcVIMaTWInm84X1wxXED7Dji8v2N8ZfIlOIuV22Za0JYZnG9v17B9zBVYTvPbWvP782zoJFUM7XfyPz8yoVRkE6nfSKS2JzwWpr24hTagKpdJwja3fkdC9CzdlnOIDv6beRVvHCPRa3QxG9KTSEvNQBcIDc5J7a1aH68YzwKtf6Sb0O08g" 
              alt="Astro Chart"
              className="w-full h-full grayscale sepia brightness-50 contrast-125"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Webcam Frame */}
          <div className="relative z-20 w-3/4 h-3/4 rounded-full border-[8px] border-primary shadow-[0_0_100px_rgba(115,92,0,0.3)] overflow-hidden bg-tertiary">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbFIIuKbytIm3cMtIY7gX5Ku4CrARR0V6bT8jrUWKJ2N2fU-LTtrecoUyA6cfgclDqsdrfRNW8xFvo4TC8Yw_iizIbeiABZvuyuOmseH6ORVJdXYpITQsBy0n2GKNEDBvWrzWWCcpXqAO50yRxneOLi5cHMiyyfleS0m186m5tXKMDNFsy7A1ceke0ZYNrOnduWlVayM5B3bux5nM_1p7SXOweHGgFzj1xAVK37cqm8S_n47D8OmWLBW17MmScbVQU2ke_-tpVwrQ" 
              alt="Subject"
              className="w-full h-full object-cover grayscale brightness-50 contrast-150 mix-blend-luminosity"
              referrerPolicy="no-referrer"
            />
            
            {/* Scanning HUD */}
            <div className="absolute inset-0 border-2 border-secondary/30 rounded-full animate-pulse pointer-events-none" />
            <motion.div 
              animate={{ top: isScanning ? '100%' : '0%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-secondary shadow-[0_0_10px_#735C00]" 
            />
          </div>

          {/* Peripheral Icons */}
          <div className="absolute top-10 left-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-surface-highest/10 backdrop-blur-md flex items-center justify-center border border-surface-highest/20">
              <User className="text-secondary w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Face Mapping</span>
          </div>

          <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-surface-highest/10 backdrop-blur-md flex items-center justify-center border border-surface-highest/20">
              <Fingerprint className="text-secondary w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Cryptic Hash</span>
          </div>

          {/* Status Overlay */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 bg-primary/80 backdrop-blur-xl border border-secondary/40 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 bg-secondary rounded-full ${isScanning ? 'animate-ping' : ''}`} />
              <p className="text-sm font-headline text-secondary tracking-widest italic">
                {isScanning ? `Analyzing Biometric Ledger... ${progress}%` : 'Awaiting Essence...'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 w-full max-w-md flex flex-col items-center gap-8">
          <button 
            onClick={startScan}
            disabled={isScanning}
            className="w-full py-6 bg-secondary text-primary font-headline text-lg tracking-[0.3em] uppercase relative overflow-hidden group disabled:opacity-50"
          >
            <span className="relative z-10 font-bold">Scan Your Essence</span>
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-primary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary" />
          </button>
          <p className="text-center opacity-40 font-body text-sm leading-relaxed max-w-xs italic">
            By submitting your likeness, the soul’s geometry is translated into an unbreakable cipher. Proceed with scholarly caution.
          </p>
        </div>
      </div>
    </main>
  );
}
