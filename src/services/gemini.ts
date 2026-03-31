import { GoogleGenAI } from "@google/genai";

let genAI: any = null;

export function getGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in secrets.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function invokePainting(prompt: string) {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: `A Renaissance alchemical painting, Da Vinci style sketch, aged parchment, mysterious atmosphere, highly detailed: ${prompt}` }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
