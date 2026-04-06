
/**
 * Steganography Utility (LSB)
 * Encodes and decodes binary data into the Least Significant Bit of an image's pixel channels.
 * 
 * New Protocol: 
 * [8 bytes Magic Prefix] + [4 bytes Length (Uint32)] + [N bytes Payload]
 */

const MAGIC_PREFIX = "[ARCANA]"; // 8 chars = 8 bytes
const PREFIX_BINARY = MAGIC_PREFIX.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');

export const encodeMessage = (
  canvas: HTMLCanvasElement,
  message: string,
  sketch?: number[]
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. Prepare payload
  const payloadData: any = { m: message };
  if (sketch) payloadData.s = sketch;
  const payloadStr = JSON.stringify(payloadData);
  
  // 2. Convert to Binary with Header
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payloadStr);
  const length = payloadBytes.length;
  
  // Magic Prefix (already defined as binary string)
  let binary = PREFIX_BINARY;
  
  // Length (32 bits / 4 bytes)
  const lengthBinary = length.toString(2).padStart(32, '0');
  binary += lengthBinary;
  
  // Payload bytes
  for (let i = 0; i < payloadBytes.length; i++) {
    binary += payloadBytes[i].toString(2).padStart(8, '0');
  }

  // Check if image is large enough (3 bits per pixel: RGB)
  if (binary.length > (canvas.width * canvas.height * 3)) {
    throw new Error('Message is too long for this image size.');
  }

  // 3. Embed binary into LSB of RGB channels
  let bitIndex = 0;
  for (let i = 0; i < data.length && bitIndex < binary.length; i++) {
    if (i % 4 === 3) continue; // Skip Alpha
    data[i] = (data[i] & 0xfe) | (binary[bitIndex] === '1' ? 1 : 0);
    bitIndex++;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

export const decodeMessage = (
  canvas: HTMLCanvasElement
): { message: string, sketch?: number[] } | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. Extract enough LSBs to check for prefix (8 bytes = 64 bits)
  // Actually, we'll extract them until we find the prefix or hit a limit
  // For efficiency, let's extract bits in chunks
  
  let allBits = "";
  let bitCount = 0;
  const totalPixels = data.length / 4;
  const maxScanBits = Math.min(data.length, 1000000); // Scan up to ~1MB of bits for efficiency 

  // Fast scan for prefix
  for (let i = 0; i < data.length && bitCount < maxScanBits; i++) {
    if (i % 4 === 3) continue;
    allBits += (data[i] & 1).toString();
    bitCount++;
    
    // Check if we have enough for prefix + length
    if (bitCount === 64 + 32) {
       const prefix = binaryToString(allBits.slice(0, 64));
       if (prefix === MAGIC_PREFIX) {
         // Found robust header!
         const lengthBits = allBits.slice(64, 96);
         const payloadLength = parseInt(lengthBits, 2);
         const requiredBits = 64 + 32 + (payloadLength * 8);
         
         // Continue extracting until we have all bits
         let currentI = i + 1;
         while (allBits.length < requiredBits && currentI < data.length) {
           if (currentI % 4 === 3) { currentI++; continue; }
           allBits += (data[currentI] & 1).toString();
           currentI++;
         }
         
         if (allBits.length < requiredBits) return null;
         
         const payloadBinary = allBits.slice(96, requiredBits);
         const payloadStr = binaryToString(payloadBinary);
         try {
           const payload = JSON.parse(payloadStr);
           return { message: payload.m, sketch: payload.s };
         } catch (e) {
           console.error("Robust decode failed:", e);
           return null;
         }
       }
    }
  }

  // 2. Fallback: Legacy Scan (Find '{' and '}')
  // If prefix not found at the start, try legacy parsing
  console.warn("[Steganography] Magic prefix not found. Attempting legacy recovery...");
  
  // Extract all bits for legacy scan (limited to avoid crash on massive images)
  const legacyBits = allBits.length > 500000 ? allBits : extractAllBits(data, 1000000);
  const fullText = binaryToString(legacyBits);
  
  try {
    const start = fullText.indexOf('{');
    if (start === -1) return null;
    
    const lastEnd = fullText.lastIndexOf('}');
    if (lastEnd === -1 || lastEnd <= start) return null;

    const payloadStr = fullText.slice(start, lastEnd + 1);
    const payload = JSON.parse(payloadStr);
    
    if (payload.m) {
      return { message: payload.m, sketch: payload.s };
    }
  } catch (e) {
    return null;
  }

  return null;
};

// --- Helpers ---

const extractAllBits = (data: Uint8ClampedArray, limit: number): string => {
  let bits = "";
  let count = 0;
  for (let i = 0; i < data.length && count < limit; i++) {
    if (i % 4 === 3) continue;
    bits += (data[i] & 1).toString();
    count++;
  }
  return bits;
};

const binaryToString = (binary: string): string => {
  const bytes = new Uint8Array(Math.floor(binary.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(binary.slice(i * 8, i * 8 + 8), 2);
  }
  return new TextDecoder().decode(bytes);
};
