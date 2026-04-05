
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, getFaceEmbedding, euclideanDistance } from '../utils/faceKey';
import { Camera as CameraIcon, CheckCircle, RefreshCcw, Upload, AlertTriangle } from 'lucide-react';

interface CameraProps {
  onCapture: (embedding: Float32Array | Float32Array[]) => void;
  onStabilityChange?: (isStable: boolean) => void;
  onReset?: () => void;
  label?: string;
  stages?: string[];
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onReset, onStabilityChange, label, stages }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [embeddings, setEmbeddings] = useState<Float32Array[]>([]);
  const [isBypassMode, setIsBypassMode] = useState(false);

  const activeStages = stages || [label || 'Capture Face Key'];

  useEffect(() => {
    let stream: MediaStream | null = null;
    let scanInterval: any;
    let previousEmbedding: Float32Array | null = null;

    const startVideo = async () => {
      try {
        await loadModels();
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Failed to access camera. Enabling manual bypass mode.');
        setIsBypassMode(true);
      }
    };

    startVideo();

    // Continuous scanning for stability indicator
    scanInterval = setInterval(async () => {
      if (!videoRef.current || !isReady || isScanning || captured || isBypassMode) return;
      
      try {
        const currentEmbedding = await getFaceEmbedding(videoRef.current);
        if (currentEmbedding) {
          if (previousEmbedding) {
            const dist = euclideanDistance(previousEmbedding, currentEmbedding);
            if (onStabilityChange) {
              onStabilityChange(dist < 0.65);
            }
            if (dist >= 0.65) {
               // Update baseline if it moved too much
               previousEmbedding = currentEmbedding;
            }
          } else {
            previousEmbedding = currentEmbedding;
            if (onStabilityChange) onStabilityChange(false);
          }
        } else {
          previousEmbedding = null;
          if (onStabilityChange) onStabilityChange(false);
        }
      } catch (err) {
        // silently ignore continuous scan errors to avoid UI noise
      }
    }, 600);

    return () => {
      if (scanInterval) clearInterval(scanInterval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (onStabilityChange) onStabilityChange(false);
    };
  }, [isReady, captured, isScanning, onStabilityChange]);

  const handleCapture = async () => {
    if (!videoRef.current || !isReady) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const embedding = await getFaceEmbedding(videoRef.current);
      
      if (embedding) {
        if (stages) {
          const newEmbeddings = [...embeddings, embedding];
          if (newEmbeddings.length === stages.length) {
            setCaptured(true);
            onCapture(newEmbeddings);
          } else {
            setEmbeddings(newEmbeddings);
            setCurrentStageIndex(c => c + 1);
          }
        } else {
          onCapture(embedding);
          setCaptured(true);
        }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const imgUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imgUrl;
      await new Promise((resolve) => (img.onload = resolve));
      
      const embedding = await getFaceEmbedding(img);
      
      if (embedding) {
        if (stages) {
          const newEmbeddings = [...embeddings, embedding];
          if (newEmbeddings.length === stages.length) {
            setCaptured(true);
            onCapture(newEmbeddings);
          } else {
            setEmbeddings(newEmbeddings);
            setCurrentStageIndex(c => c + 1);
          }
        } else {
          onCapture(embedding);
          setCaptured(true);
        }
      } else {
        setError('No face detected in the uploaded photo.');
      }
      
      URL.revokeObjectURL(imgUrl);
    } catch (err) {
      console.error('Upload extract error:', err);
      setError('An error occurred processing the photo.');
    } finally {
      setIsScanning(false);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    setCaptured(false);
    setEmbeddings([]);
    setCurrentStageIndex(0);
    setError(null);
    if (onReset) onReset();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-amber-900/50 shadow-inner">
        {isBypassMode && (
          <div className="absolute top-0 left-0 right-0 bg-red-600/80 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 flex items-center justify-center gap-2 z-10 shadow-lg border-b border-red-800">
            <AlertTriangle className="w-3 h-3" />
            Bypass Mode Active (Testing Only)
          </div>
        )}

        {!isBypassMode ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${captured ? 'opacity-50' : 'opacity-100'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 absolute inset-0">
            <Upload className="w-12 h-12 text-zinc-700 mb-2" />
            <span className="text-zinc-600 font-mono text-xs uppercase text-center px-4">
              Camera Restricted. Upload Photo for Stage Evaluation.
            </span>
          </div>
        )}
        
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

      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex gap-4">
          {!captured ? (
            <button
              onClick={() => isBypassMode ? fileInputRef.current?.click() : handleCapture()}
              disabled={(!isReady && !isBypassMode) || isScanning}
              className="flex items-center gap-2 px-6 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-100 rounded-full border border-amber-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
            >
              {isBypassMode ? (
                <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              ) : (
                <CameraIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm uppercase tracking-widest font-serif">
                {isBypassMode ? `Upload for ${activeStages[currentStageIndex]}` : activeStages[currentStageIndex]}
              </span>
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
        
        <button
          onClick={() => setIsBypassMode(!isBypassMode)}
          className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {isBypassMode ? "Return to Camera" : "Camera Restricted? Upload Photo"}
        </button>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
      />
    </div>
  );
};
