
import React, { useState, useRef } from 'react';
import { Camera } from './Camera';
import { encodeMessage } from '../utils/steganography';
import { deriveKeyFromEmbedding, encryptMessage } from '../utils/faceKey';
import { GoogleGenAI } from '@google/genai';
import { 
  PenTool, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Lock, 
  FileText,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const Inscribe: React.FC = () => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [faceEmbedding, setFaceEmbedding] = useState<Float32Array | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodedImage, setEncodedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setEncodedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRenaissanceImage = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: 'A high-detail Renaissance oil painting, scholarly portrait or alchemical landscape, rich textures, sfumato technique, dark walnut and gold tones, 1024x1024' }]
        }
      });
      
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        const base64 = `data:image/png;base64,${part.inlineData.data}`;
        setImage(base64);
        setEncodedImage(null);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to invoke the alchemical brush. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEncode = async () => {
    if (!message || !image || !faceEmbedding || !canvasRef.current) return;
    
    setIsEncoding(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image;
      
      await new Promise((resolve) => (img.onload = resolve));
      
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 1. Derive key from face
      const key = deriveKeyFromEmbedding(faceEmbedding);
      
      // 2. Encrypt message
      const encrypted = encryptMessage(message, key);
      
      // 3. Encode into image
      // We also store the face embedding (signature) in the payload
      // so we can compare it later.
      const result = encodeMessage(canvas, encrypted, key);
      setEncodedImage(result);
      
    } catch (err: any) {
      console.error('Encoding error:', err);
      setError(err.message || 'Failed to seal the secret.');
    } finally {
      setIsEncoding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-display text-primary tracking-tighter uppercase italic">Inscribe Arcana</h2>
        <p className="text-secondary/60 font-mono text-xs uppercase tracking-[0.3em]">Seal your whispers within the canvas</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Input */}
        <div className="space-y-8">
          <section className="space-y-4">
            <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest">
              <PenTool className="w-4 h-4" />
              The Secret Message
            </label>
            <div className="relative group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your secret here..."
                className="w-full h-48 p-6 bg-surface-low text-primary font-manuscript text-lg leading-relaxed rounded-none shadow-inner border-2 border-surface-highest focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all resize-none placeholder:italic placeholder:opacity-40"
                style={{
                  backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05)'
                }}
              />
              <div className="absolute bottom-4 right-4 text-primary/30 font-manuscript italic text-xs">
                {message.length} characters
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest">
              <ImageIcon className="w-4 h-4" />
              The Vessel (Image)
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-highest hover:bg-surface-highest/80 text-primary/80 rounded-none border border-primary/10 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-display">Upload</span>
              </button>
              <button
                onClick={generateRenaissanceImage}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-none border border-secondary/30 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="text-xs uppercase tracking-widest font-display">Invoke AI</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {image && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-none overflow-hidden border-4 border-primary/20 shadow-2xl"
              >
                <img src={image} alt="Vessel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent pointer-events-none" />
              </motion.div>
            )}
          </section>
        </div>

        {/* Right Column: Face Key & Action */}
        <div className="space-y-8">
          <section className="space-y-4">
            <label className="flex items-center gap-2 text-primary/80 font-display text-sm uppercase tracking-widest">
              <Lock className="w-4 h-4" />
              The Biometric Seal
            </label>
            <Camera onCapture={setFaceEmbedding} onReset={() => setFaceEmbedding(null)} />
          </section>

          <div className="pt-8 space-y-4">
            <button
              onClick={handleEncode}
              disabled={!message || !image || !faceEmbedding || isEncoding}
              className="w-full py-4 bg-wax hover:bg-wax/90 text-surface rounded-none font-display text-xl uppercase tracking-[0.2em] shadow-lg shadow-primary/40 transition-all disabled:opacity-50 disabled:grayscale group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isEncoding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                <span>Seal the Arcana</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {error && (
              <p className="text-wax text-center text-sm font-mono italic">{error}</p>
            )}

            <AnimatePresence>
              {encodedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-secondary/10 border border-secondary/30 rounded-none space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-display italic">The secret is sealed.</span>
                    <a
                      href={encodedImage}
                      download="vitra_arcana_sealed.png"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-surface rounded-none text-xs uppercase tracking-widest font-display transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                  <p className="text-secondary/60 text-[10px] font-mono leading-relaxed">
                    The image above contains your encrypted secret. Only your face can reveal it.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
