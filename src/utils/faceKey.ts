
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

/**
 * Derives a stable key from a face embedding.
 * Since embeddings vary slightly, we'll quantize the values or use a threshold.
 * For a "Key", we'll hash the descriptor.
 * NOTE: Hashing is sensitive. For a real app, we'd use a fuzzy extractor.
 * For this demo, we'll use a signature-based approach:
 * 1. Store the descriptor (signature) in the image.
 * 2. During decode, compare current descriptor with stored signature.
 * 3. If match (Euclidean distance < 0.6), use the stored signature to derive the key.
 */
export const deriveKeyFromEmbedding = (embedding: Float32Array): string => {
  // Convert Float32Array to string and hash it
  const embeddingStr = Array.from(embedding).map(v => v.toFixed(4)).join(',');
  return CryptoJS.SHA256(embeddingStr).toString();
};

export const compareEmbeddings = (
  e1: Float32Array,
  e2: Float32Array,
  threshold = 0.6
): boolean => {
  const distance = faceapi.euclideanDistance(e1, e2);
  return distance < threshold;
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
