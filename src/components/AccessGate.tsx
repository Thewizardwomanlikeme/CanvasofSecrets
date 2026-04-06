
import React, { useState } from 'react';
import { useAuth } from '../context/VitraAuthContext';
import { Camera } from './Camera';
import { deriveKeyAndSketch, deriveKeyWithSketch, encryptMessage, decryptMessage } from '../utils/faceKey';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserPlus, LockOpen, Loader2, PenTool, ShieldAlert } from 'lucide-react';

const CHALLENGE_MESSAGE = "[IDENTITY_VERIFIED]";

export const AccessGate: React.FC = () => {
  const { profile, enroll, login, burnIdentity } = useAuth();
  const [name, setName] = useState('');
  const [faceEmbedding, setFaceEmbedding] = useState<Float32Array | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Decide if we are in Enroll or Login mode
  // If profile is missing identityToken (old version), we force a new Enrollment (Upgrade)
  const mode = (profile && profile.identityToken) ? 'LOGIN' : 'ENROLL';

  const handleAction = async () => {
    if (!faceEmbedding) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      if (mode === 'ENROLL') {
        if (!name.trim()) throw new Error('Specify your scholarly title (Name).');
        
        // Derive Sketch from initial face scan
        const { key, sketch } = deriveKeyAndSketch(faceEmbedding);
        // Create a challenge-response token
        const identityToken = encryptMessage(CHALLENGE_MESSAGE, key);
        enroll(name, sketch, identityToken);
      } else {
        // Biometric Login: Use stored sketch to reconstruct key
        if (!profile?.sketch || !profile?.identityToken) throw new Error('Biometric credentials incomplete.');
        
        const key = deriveKeyWithSketch(faceEmbedding, profile.sketch);
        const decrypted = decryptMessage(profile.identityToken, key);
        
        // If key reconstruction allows decryption of the identity token, we log in
        if (decrypted === CHALLENGE_MESSAGE) {
          login();
        } else {
          throw new Error('Biometric mismatch. Identity verification failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'The ritual of access failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-surface flex items-center justify-center p-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 paper-grain opacity-50" />
      <div className="absolute inset-0 bg-gradient-radial from-secondary/5 to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-surface-low border-2 border-primary/10 shadow-[0_40px_100px_rgba(39,19,16,0.15)] relative p-12 space-y-12"
      >
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 text-secondary font-headline uppercase tracking-[0.4em] text-xs pb-2 border-b border-secondary/20">
            {mode === 'ENROLL' ? <UserPlus className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
            {mode === 'ENROLL' ? 'Identity Foundation' : 'Access the Sanctum'}
          </div>
          <h2 className="text-5xl font-headline text-primary tracking-tighter leading-tight italic">
            {mode === 'ENROLL' ? 'The Great Enrollment' : 'The Rite of Return'}
          </h2>
          <p className="text-primary/60 font-body text-lg italic">
            {mode === 'ENROLL' 
              ? 'Foundation of your secret-cipher within Vitra.' 
              : `Awaiting your presence, Scholar ${profile?.name}.`}
          </p>
        </header>

        <div className="space-y-8">
          {mode === 'ENROLL' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest px-1">
                <PenTool className="w-4 h-4" />
                Scholarly Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full p-6 bg-surface-highest text-primary font-manuscript text-xl leading-relaxed rounded-none shadow-inner border-2 border-surface-highest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all placeholder:opacity-30"
              />
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest px-1">
              <ShieldCheck className="w-4 h-4" />
              Biometric Presence
            </label>
            <div className="rounded-xl overflow-hidden ring-4 ring-primary/5 shadow-2xl">
              <Camera 
                onCapture={(emb) => setFaceEmbedding(Array.isArray(emb) ? emb[0] : emb)} 
                onReset={() => setFaceEmbedding(null)} 
              />
            </div>
          </div>

          <div className="pt-4 space-y-6">
            <button
              onClick={handleAction}
              disabled={!faceEmbedding || (mode === 'ENROLL' && !name.trim()) || isVerifying}
              className="w-full py-6 bg-wax hover:bg-wax/90 text-surface rounded-none font-headline text-2xl uppercase tracking-[0.2em] shadow-lg shadow-primary/40 transition-all disabled:opacity-30 disabled:grayscale group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isVerifying ? <Loader2 className="w-8 h-8 animate-spin" /> : <LockOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />}
                <span>{mode === 'ENROLL' ? 'Found Identity' : 'Unlock Sanctum'}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {error && (
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-wax font-mono text-sm italic py-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
                
                {mode === 'LOGIN' && (
                  <button
                    onClick={() => {
                        if (confirm("This will permanently clear your current identity. Are you sure?")) {
                          burnIdentity();
                        }
                    }}
                    className="w-full text-[10px] text-primary/40 hover:text-wax/60 uppercase tracking-widest font-mono transition-colors border-t border-primary/5 pt-4 cursor-pointer"
                  >
                    Biometric Credentials Incomplete? Reset Identity
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="pt-8 border-t border-primary/5 text-center">
          <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.3em] leading-relaxed">
            Identity anchored purely in biology. <br />
            No secrets touch the cloud. No soul is forgotten.
          </p>
        </footer>
      </motion.div>
    </div>
  );
};
