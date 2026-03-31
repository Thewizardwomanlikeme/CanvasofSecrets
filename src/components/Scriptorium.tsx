import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Brush, Wand2, History } from 'lucide-react';
import { invokePainting } from '../services/gemini';

export function Scriptorium() {
  const [text, setText] = useState('');
  const [isInvoking, setIsInvoking] = useState(false);
  const [painting, setPainting] = useState<string | null>(null);

  const handleInvoke = async () => {
    if (!text) return;
    setIsInvoking(true);
    try {
      const result = await invokePainting(text);
      if (result) setPainting(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInvoking(false);
    }
  };

  return (
    <div className="flex-1 pt-32 pb-24 px-8 md:px-16 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="mb-16 text-center lg:text-left">
          <h1 className="font-headline text-5xl md:text-7xl text-primary tracking-tighter mb-4">The Scriptorium</h1>
          <p className="font-body italic text-xl text-secondary max-w-2xl">Pen your secrets upon the eternal vellum and bind them to a visual soul.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-[16px] border-surface-highest shadow-2xl relative">
          {/* Corner Decorations */}
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-secondary z-10" />
          <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-secondary z-10" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-secondary z-10" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-secondary z-10" />

          {/* Left: Editor */}
          <div className="lg:col-span-7 bg-surface-low p-8 md:p-12 relative min-h-[500px] flex flex-col">
            <div className="absolute inset-0 paper-grain" />
            <div className="mb-6 flex items-center justify-between border-b border-primary/10 pb-4 relative z-10">
              <span className="font-headline text-xs uppercase tracking-[0.2em] opacity-50">Confidential Manuscript</span>
              <Wand2 className="text-secondary w-5 h-5" />
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-grow bg-transparent border-none focus:ring-0 font-manuscript italic text-2xl md:text-3xl text-primary leading-relaxed placeholder:text-primary/20 resize-none relative z-10"
              placeholder="Inscribe your arcana here..."
              spellCheck="false"
            />
            <div className="mt-8 flex gap-4 text-xs font-headline opacity-40 italic relative z-10">
              <span>Word Count: {text.split(/\s+/).filter(Boolean).length}</span>
              <span>|</span>
              <span>Sealing Status: {painting ? 'Ready' : 'Pending'}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-5 bg-primary flex flex-col text-surface">
            <div className="group flex-1 flex flex-col items-center justify-center p-8 text-center border-b border-surface/10 cursor-pointer hover:bg-tertiary transition-colors duration-700">
              <div className="mb-6 p-6 border border-secondary/30 group-hover:border-secondary transition-colors duration-700">
                <Upload className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-headline text-2xl mb-2">Upload Your Canvas</h3>
              <p className="font-body text-sm opacity-70 max-w-xs">Select a relic from your own archives to serve as the vessel for your message.</p>
            </div>

            <div 
              onClick={handleInvoke}
              className={`group flex-1 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-tertiary transition-colors duration-700 ${isInvoking ? 'animate-pulse pointer-events-none' : ''}`}
            >
              <div className="mb-6 p-6 border border-secondary/30 group-hover:border-secondary transition-colors duration-700">
                <Brush className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-headline text-2xl mb-2">{isInvoking ? 'Invoking...' : 'Invoke a Painting'}</h3>
              <p className="font-body text-sm opacity-70 max-w-xs">Describe a vision and let the ancient spirits manifest it into physical form.</p>
            </div>
          </div>
        </div>

        {painting && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 bg-surface-highest border border-secondary/20 flex flex-col items-center gap-6"
          >
            <img src={painting} alt="Invoked Painting" className="max-w-md w-full shadow-2xl border-8 border-primary" />
            <p className="font-body italic text-secondary">The spirits have answered. Your secret is bound.</p>
          </motion.div>
        )}

        <div className="mt-12 flex justify-end">
          <button className="flex items-center gap-4 bg-secondary text-surface px-10 py-5 group transition-all duration-500 hover:bg-secondary/90 active:translate-y-1">
            <span className="font-headline text-lg tracking-widest uppercase">Seal & Proceed</span>
            <History className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="mt-24 opacity-10 grayscale pointer-events-none">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_X9bZoClEHQ7d-UxrPvW3xI6IFkjA3vGK4me07ysL8Y14jjj4lwsyqLKflt8ObN7xxAVYBffpaVJv5FvSk4SeBsb8AbK2D436PGdUC_XF-4J4RuOtkkj2LCwO_tP0mdfOlyL8EG8cj4JAixMHseIJSgM56Ql91SaHwbfN8eKCu9fdC0t3ObeddfvVS9uYa62iy15dfPD-KTPwovCwEIuoeWQGo0dhHqzipCnm_BKERBUCSC4H_aj4uuGMqc4IwUwcW-2sdE9-br0" 
          alt="Antique Book"
          className="w-64 h-auto"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
