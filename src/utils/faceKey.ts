
import * as faceapi from '@vladmandic/face-api';
import CryptoJS from 'crypto-js';

/**
 * Face Key Utility
 * Handles face detection, embedding generation, and key derivation.
 */

let isModelLoaded = false;

export const loadModels = async () => {
  if (isModelLoaded) return;
  
  // Use models from a public CDN
  const MODEL_URL = 'https://vladmandic.github.io/face-api/model';
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  
  isModelLoaded = true;
};

export const getFaceEmbedding = async (
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array | null> => {
  await loadModels();
  
  const detection = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  return detection ? detection.descriptor : null;
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

export const minMaxScale = (descriptor: Float32Array): Float32Array => {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < descriptor.length; i++) {
    if (descriptor[i] < min) min = descriptor[i];
    if (descriptor[i] > max) max = descriptor[i];
  }
  const range = max - min;
  const scaled = new Float32Array(descriptor.length);
  if (range === 0) return descriptor;
  for (let i = 0; i < descriptor.length; i++) {
    scaled[i] = (descriptor[i] - min) / range;
  }
  return scaled;
};

export const deriveKeyAndSketch = (embedding: Float32Array): { key: string, sketch: number[] } => {
  const scaled = minMaxScale(embedding);
  const sketch: number[] = [];
  let bitstring = '';
  for (let i = 0; i < scaled.length; i++) {
    const bit = scaled[i] >= 0.5 ? 1 : 0;
    bitstring += bit.toString();
    sketch.push(Number((scaled[i] - bit).toFixed(4)));
  }
  const key = CryptoJS.SHA256(bitstring).toString();
  return { key, sketch };
};

export const deriveKeyWithSketch = (embedding: Float32Array, sketch: number[]): string => {
  const scaled = minMaxScale(embedding);
  let bitstring = '';
  for (let i = 0; i < scaled.length; i++) {
    const corrected = scaled[i] - sketch[i];
    const bit = corrected >= 0.5 ? 1 : 0;
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
