
import * as faceapi from '@vladmandic/face-api';
import CryptoJS from 'crypto-js';

/**
 * Face Key Utility
 * Handles face detection, embedding generation, and key derivation.
 */

let isModelLoaded = false;
let isTinyModelLoaded = false;

const MODEL_URL = 'https://vladmandic.github.io/face-api/model';

export const loadModels = async () => {
  if (isModelLoaded) return;
  
  // 1. Force WebGL Backend for GPU Acceleration
  try {
    const tf = faceapi.tf as any;
    if (tf) {
      // Ensure backend is WebGL and ready
      await tf.setBackend('webgl');
      await tf.ready();
      console.info(`[Passwordless Future] Biometric Engine initialized on [${tf.getBackend()}] backend.`);
    }
  } catch (e) {
    console.warn('[Passwordless Future] WebGL initialization failed, falling back to CPU.', e);
  }

  // Load all models in parallel for minimum delay
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  
  isTinyModelLoaded = true;
  
  // 2. Pre-warm the model by running a dummy detection
  const dummyCanvas = document.createElement('canvas');
  dummyCanvas.width = 64;
  dummyCanvas.height = 64;
  await faceapi.detectSingleFace(dummyCanvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }));
  
  isModelLoaded = true;
};

export const getFaceEmbedding = async (
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array | null> => {
  await loadModels();
  
  // Reduced inputSize from 160 to 128 for 25-30% faster recognition on lower-end devices
  const detection = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  return detection ? detection.descriptor : null;
};

export const detectFaceBox = async (
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<faceapi.Box | null> => {
  await loadModels();
  // Using ultra-low 128px input for near-instant box detection for stability check
  const detection = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.3 }));
  return detection?.box ?? null;
};

export const averageEmbeddings = (embeddings: Float32Array[]): Float32Array => {
  if (embeddings.length === 0) return new Float32Array();
  const length = embeddings[0].length;
  const mean = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (const emb of embeddings) {
      sum += emb[i];
    }
    mean[i] = sum / embeddings.length;
  }
  return mean;
};

export const euclideanDistance = (a: Float32Array, b: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
};

/**
 * Robust Biometric Binarization
 * Instead of volatile minMaxScale, we use fixed thresholding.
 * Face descriptors from face-api.js are L2-normalized, typically in range [-0.2, 0.2].
 */

export const deriveKeyAndSketch = (embedding: Float32Array): { key: string, sketch: number[] } => {
  const sketch: number[] = [];
  let bitstring = '';
  
  for (let i = 0; i < embedding.length; i++) {
    // 1. Identify the bit via fixed threshold (0)
    const bit = embedding[i] >= 0 ? 1 : 0;
    bitstring += bit.toString();
    
    // 2. The Sketch (Fuzzy Commitment)
    // We store a "nudge" that would move this specific value to a highly stable 
    // position (+0.1 or -0.1) far from the 0-threshold.
    const stablePoint = bit === 1 ? 0.1 : -0.1;
    sketch.push(Number((stablePoint - embedding[i]).toFixed(4)));
  }
  
  const key = CryptoJS.SHA256(bitstring).toString();
  return { key, sketch };
};

export const deriveKeyWithSketch = (embedding: Float32Array, sketch: number[]): string => {
  let bitstring = '';
  
  for (let i = 0; i < embedding.length; i++) {
    // 1. Apply the stored Nudge (Sketch) to correct the new scan
    const corrected = embedding[i] + sketch[i];
    
    // 2. Threshold the corrected value
    const bit = corrected >= 0 ? 1 : 0;
    bitstring += bit.toString();
  }
  
  return CryptoJS.SHA256(bitstring).toString();
};

export const deriveKeyFromEmbedding = (embedding: Float32Array): string => {
  const { key } = deriveKeyAndSketch(embedding);
  return key;
};

export const encryptMessage = (message: string, key: string): string => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

export const decryptMessage = (encrypted: string, key: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Decryption error:', e);
    return null;
  }
};
