/// <reference types="vite/client" />

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: any = null;

export function getGemini() {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("API Key present:", !!apiKey);
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("VITE_GEMINI_API_KEY is missing or invalid. Please configure your secrets.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function invokePainting(prompt: string) {
  let result;
  
  // Ensure we validate API key before the call
  const ai = getGemini();

  try {
    const model = ai.getGenerativeModel(
      { model: "gemini-2.5-flash-image" }
    );
    result = await model.generateContent({
      contents: [{
        parts: [{ text: `A Renaissance alchemical painting, Da Vinci style sketch, aged parchment, mysterious atmosphere, highly detailed: ${prompt}` }]
      }]
    });
  } catch (e) {
    console.warn("Retrying with gemini-2.5-flash-image...", e);
    const model = ai.getGenerativeModel(
      { model: "gemini-2.5-flash-image" }
    );
    result = await model.generateContent({
      contents: [{
        parts: [{ text: `A Renaissance alchemical painting, Da Vinci style sketch, aged parchment, mysterious atmosphere, highly detailed: ${prompt}` }]
      }]
    });
  }
  
  const response = result.response;
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) return null;

  for (const part of candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
