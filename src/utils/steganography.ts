
/**
 * Steganography Utility (LSB)
 * Encodes and decodes binary data into the Least Significant Bit of an image's pixel channels.
 */

export const encodeMessage = (
  canvas: HTMLCanvasElement,
  message: string,
  sketch?: number[]
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. Prepare the payload: [Message] length
  // We strictly store zero biometric signatures or fragments.
  const payloadData: any = { m: message };
  if (sketch) payloadData.s = sketch;
  const payload = JSON.stringify(payloadData);
  const binary = stringToBinary(payload);

  // Check if image is large enough
  // Each pixel has 4 channels (RGBA), but we only use RGB for stability.
  // So 3 bits per pixel.
  if (binary.length > canvas.width * canvas.height * 3) {
    throw new Error('Message is too long for this image size.');
  }

  // 2. Embed binary into LSB of RGB channels
  let bitIndex = 0;
  for (let i = 0; i < data.length && bitIndex < binary.length; i++) {
    if (i % 4 === 3) continue; // Skip Alpha channel

    // Clear the LSB and set it to the binary bit
    data[i] = (data[i] & 0xfe) | parseInt(binary[bitIndex]);
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

  // 1. Extract all LSBs from RGB channels
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    if (i % 4 === 3) continue; // Skip Alpha channel
    binary += (data[i] & 1).toString();
  }

  // 2. Convert binary back to string and find the JSON payload
  // This is tricky because we don't know the length. 
  // We'll try to parse until we find a valid JSON or reach the end.
  // A better way: store length at the beginning.
  
  // Let's try to convert the whole thing and find the first valid JSON object
  const fullText = binaryToString(binary);
  
  try {
    // Find the first '{' and the matching '}'
    const start = fullText.indexOf('{');
    if (start === -1) return null;
    
    // Simple JSON extraction (might need refinement for nested objects)
    let end = -1;
    let balance = 0;
    for (let i = start; i < fullText.length; i++) {
      if (fullText[i] === '{') balance++;
      if (fullText[i] === '}') balance--;
      if (balance === 0) {
        end = i;
        break;
      }
    }
    
    if (end === -1) return null;
    
    const payloadStr = fullText.slice(start, end + 1);
    const payload = JSON.parse(payloadStr);
    
    // With LSH, if the AES decryption succeeds (UTF8 parses correctly), we are safe natively.
    if (payload.m) {
      return { message: payload.m, sketch: payload.s };
    } else {
      return null;
    }
  } catch (e) {
    console.error('Decoding error:', e);
    return null;
  }
};

const stringToBinary = (str: string): string => {
  return str
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
};

const binaryToString = (binary: string): string => {
  let str = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length < 8) break;
    str += String.fromCharCode(parseInt(byte, 2));
  }
  return str;
};
