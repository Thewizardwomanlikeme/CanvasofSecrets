import React from 'react';
import { motion } from 'motion/react';
import { UploadCloud, Lock, ShieldCheck, FileText } from 'lucide-react';

export function Vault() {
  return (
    <main className="flex-1 p-8 md:p-20 relative min-h-screen bg-tertiary overflow-hidden">
      <div className="absolute inset-0 z-[-1] opacity-20">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmoLfodklJ4AbEdCvDmxhWUxIg9GYDl1cZY5F5JCJLZ4KmjXlgx5kf3Qeyyr6VVIodLTW7FIh7Mg84e3if3JnT5D5C4zGf9POtc-YD6pJSNzHY05jhsvhkzgv7Xz06jkXvWmaRYHlaR8mbIG453iMye_SC1IRn12ClF9UuCuOLYZtvgYSgwCZrgGwAvfpzmkNL37r7REJNh-YafuKaaIr6LJX1K4d0RUl3q3s5OcKZrWYEMsKUzNegCCmj4XbujPjHTdBu3xGwijI" 
          alt="Stone Texture"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-12 mb-12">
          <h1 className="text-6xl md:text-8xl font-headline text-surface tracking-widest uppercase opacity-20 leading-none">The Vault</h1>
          <p className="text-secondary font-headline italic text-2xl -mt-6 ml-8">Sanctum of Revelations</p>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="relative aspect-[4/3] bg-primary border-[12px] border-primary-container flex items-center justify-center group cursor-pointer overflow-hidden shadow-2xl">
            <div className="absolute inset-4 border border-secondary/30 opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent pointer-events-none" />
            <div className="text-center p-12 z-10 flex flex-col items-center">
              <UploadCloud className="text-secondary w-16 h-16 mb-6 opacity-80" />
              <h3 className="text-surface font-headline text-xl tracking-widest uppercase mb-4">Deposit Manuscript</h3>
              <p className="text-surface/60 font-body max-w-sm mx-auto">Drop the ciphered parchment here to begin the decoding ritual. Only the worthy may proceed.</p>
            </div>
            
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-secondary/0 group-hover:border-secondary/50 transition-all duration-700" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-secondary/0 group-hover:border-secondary/50 transition-all duration-700" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-highest p-12 relative shadow-2xl"
          >
            <div className="absolute inset-0 paper-grain" />
            <div className="absolute -top-4 -right-4">
              <div className="w-16 h-16 bg-primary border-4 border-secondary rounded-full flex items-center justify-center shadow-lg">
                <Lock className="text-secondary w-8 h-8 fill-current" />
              </div>
            </div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-primary/40 mb-8 font-headline">Decoded Transcription</h4>
            <div className="space-y-6 relative z-10">
              <p className="text-3xl font-body italic leading-relaxed text-primary opacity-90">
                "The true gold is not forged in fire, but found in the silence between thoughts. Seek the third pillar where the shadow of the eagle falls at noon."
              </p>
              <p className="text-sm font-headline text-secondary tracking-widest uppercase">Location: 43.7696° N, 11.2558° E</p>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-primary/90 border border-secondary/20 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-[1px] bg-secondary" />
              <h5 className="text-xs uppercase tracking-widest text-secondary font-headline">Identity Verification</h5>
            </div>
            <div className="aspect-square bg-black/40 border border-surface-highest/30 mb-6 flex items-center justify-center relative overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJXWSLTF5go6R29D7q7hLe0TL0TCT_zOfo0c7uFcf6fdRDLZlA7VayiRSa0NrkqOrLp489XM601IKv2421Ae2ZwrkXVZlyaAwMGwRSm6XmftaPGl2rxsZ6ZLg2gA-NrHBHjYZ4Hm5IULIe0wyrfD0QkcX9jSxiWKactgGpZZkVofa3ZdYCk_CMQpyp5I3rRhF6beCaKMFCZIGy9RQb39gRd6YSvIHl_AEnP1IXC6wWlF3QB4FbWYLsF7O41Mp2Ceu3BH43h3KGX-0" 
                alt="Eye"
                className="opacity-30 grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-secondary shadow-[0_0_15px_#735c00]" />
            </div>
            <p className="text-surface/70 text-sm mb-6 text-center italic">Align your gaze with the lens. The Arcana requires a soul to witness.</p>
            <button className="w-full py-4 border border-secondary text-secondary uppercase tracking-[0.2em] text-xs font-bold hover:bg-secondary hover:text-primary transition-all duration-500">
              Initiate Scan
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-highest p-4 border border-primary/10 col-span-2">
              <span className="text-[10px] uppercase tracking-widest text-secondary block mb-2">Vault Status</span>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-headline text-primary italic">Sealed</span>
                <ShieldCheck className="text-primary/20 w-6 h-6" />
              </div>
            </div>
            <div className="bg-surface-highest p-4 border border-primary/10">
              <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">Ciphers</span>
              <span className="text-xl font-headline text-primary">12</span>
            </div>
            <div className="bg-surface-highest p-4 border border-primary/10">
              <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">Revealed</span>
              <span className="text-xl font-headline text-primary">3</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
