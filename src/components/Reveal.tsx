
import React, { useState, useRef } from 'react';
import { Camera } from './Camera';
import { decodeMessage } from '../utils/steganography';
import { deriveKeyFromEmbedding, decryptMessage } from '../utils/faceKey';
import { 
  Eye, 
  Upload, 
  Lock, 
  Unlock, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Reveal: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [faceEmbedding, setFaceEmbedding] = useState<Float32Array | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [secretMessage, setSecretMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setSecretMessage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDecode = async () => {
    if (!image || !faceEmbedding || !canvasRef.current) return;
    
    setIsDecoding(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image;
      
      await new Promise((resolve) => (img.onload = resolve));
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 1. Derive key from face
      const key = deriveKeyFromEmbedding(faceEmbedding);
      
      // 2. Decode from image
      // We pass the key signature to verify
      const encrypted = decodeMessage(canvas, key);
      
      if (!encrypted) {
        throw new Error('No secret found or face signature mismatch.');
      }
      
      // 3. Decrypt message
      const decrypted = decryptMessage(encrypted, key);
      
      if (decrypted) {
        setSecretMessage(decrypted);
      } else {
        throw new Error('Decryption failed. The key derived from your face is incorrect.');
      }
      
    } catch (err: any) {
      console.error('Decoding error:', err);
      setError(err.message || 'Failed to reveal the secret.');
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-display text-primary tracking-tighter uppercase italic">Reveal Arcana</h2>
        <p className="text-secondary/60 font-mono text-xs uppercase tracking-[0.3em]">Unlock the whispers hidden within the canvas</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Image Upload */}
        <div className="space-y-8">
          <section className="space-y-4">
            <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest">
              <Upload className="w-4 h-4" />
              The Encoded Vessel
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-square rounded-none overflow-hidden border-2 border-dashed border-primary/20 bg-surface-low hover:bg-surface-highest transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 ${image ? 'border-solid border-secondary/50' : ''}`}
            >
              {image ? (
                <img src={image} alt="Encoded Vessel" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-secondary/50" />
                  </div>
                  <span className="text-secondary/40 text-xs uppercase tracking-widest font-display">Upload Sealed Image</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </section>
        </div>

        {/* Right Column: Face Key & Action */}
        <div className="space-y-8">
          <section className="space-y-4">
            <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest">
              <Lock className="w-4 h-4" />
              The Biometric Key
            </label>
            <Camera onCapture={setFaceEmbedding} onReset={() => setFaceEmbedding(null)} />
          </section>

          <div className="pt-8 space-y-4">
            <button
              onClick={handleDecode}
              disabled={!image || !faceEmbedding || isDecoding}
              className="w-full py-4 bg-secondary hover:bg-secondary/90 text-surface rounded-none font-display text-xl uppercase tracking-[0.2em] shadow-lg shadow-secondary/40 transition-all disabled:opacity-50 disabled:grayscale group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isDecoding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Unlock className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                <span>Unlock Arcana</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-wax/10 border border-wax/30 rounded-none text-wax text-sm font-mono italic">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {secretMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-4"
          >
            <label className="flex items-center gap-2 text-secondary font-display text-sm uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              The Revealed Secret
            </label>
            <div 
              className="w-full p-12 bg-surface-low text-primary font-manuscript text-2xl leading-relaxed rounded-none shadow-2xl border-2 border-surface-highest relative overflow-hidden"
              style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative z-10 whitespace-pre-wrap italic"
              >
                {secretMessage}
              </motion.p>
              <div className="absolute bottom-4 right-4 text-primary/20 font-manuscript italic text-xs">
                Decoded via Vitra Arcana
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
