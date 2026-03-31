
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, getFaceEmbedding } from '../utils/faceKey';
import { Camera as CameraIcon, CheckCircle, RefreshCcw } from 'lucide-react';

interface CameraProps {
  onCapture: (embedding: Float32Array) => void;
  onReset?: () => void;
  label?: string;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onReset, label }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Failed to access camera. Please check permissions.');
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !isReady) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const embedding = await getFaceEmbedding(videoRef.current);
      
      if (embedding) {
        onCapture(embedding);
        setCaptured(true);
      } else {
        setError('No face detected. Please ensure your face is visible.');
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError('An error occurred during face scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setCaptured(false);
    setError(null);
    if (onReset) onReset();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-amber-900/50 shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${captured ? 'opacity-50' : 'opacity-100'}`}
        />
        
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <RefreshCcw className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="text-amber-200 text-xs uppercase tracking-widest font-mono">Scanning Essence...</span>
            </div>
          </div>
        )}
        
        {captured && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-900/20">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <span className="text-emerald-200 text-sm font-serif italic">Identity Authenticated</span>
            </div>
          </div>
        )}
        
        {/* Scanning HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none border border-amber-500/20">
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/40" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-mono bg-red-900/20 px-3 py-1 rounded border border-red-900/50">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        {!captured ? (
          <button
            onClick={handleCapture}
            disabled={!isReady || isScanning}
            className="flex items-center gap-2 px-6 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-100 rounded-full border border-amber-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <CameraIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm uppercase tracking-widest font-serif">{label || 'Capture Face Key'}</span>
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700/50 transition-all group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm uppercase tracking-widest font-serif">Reset Key</span>
          </button>
        )}
      </div>
    </div>
  );
};
