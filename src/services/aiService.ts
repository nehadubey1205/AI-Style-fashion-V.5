import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const OUTFIT_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      outfit_name: { type: Type.STRING, description: "Elegant name for the outfit" },
      aesthetic_description: { type: Type.STRING, description: "Short moody description of the aesthetic" },
      styling_breakdown: { type: Type.STRING, description: "Detailed head-to-toe styling guide" },
      brand_suggestions: { type: Type.STRING, description: "Specific brands for this look (e.g. Zara, H&M, Myntra, Ajio, Westside, Amazon Fashion)" },
      price_range: { type: Type.STRING, description: "Estimated price in INR (e.g. ₹5,000 - ₹8,000)" },
      color_palette: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3-4 hex color codes representing the look" 
      },
      style_note: { type: Type.STRING, description: "Editor's styling note / tip" }
    },
    required: ["outfit_name", "aesthetic_description", "styling_breakdown", "brand_suggestions", "price_range", "color_palette", "style_note"]
  }
};

export async function* streamOutfits(preferences: any) {
  const prompt = `You are an elite fashion editor for NAYELA AI — VACAY VOGUE AI. 
  Create 5 Pinterest-worthy vacation outfits for a trip to ${preferences.destination}.
  Budget: ₹${preferences.budget}
  Duration: ${preferences.duration}
  Main Occasion: ${preferences.occasion}
  Aesthetic Vibe: ${preferences.aesthetic?.join(", ")}
  Season: ${preferences.season}

  Rules:
  1. Recommend ONLY these specific accessible fashion brands: Zara, H&M, Ajio, Myntra, Westside, and Amazon Fashion.
  2. DO NOT recommend Fabindia, BIBA, Libas, Ritu Kumar, or Aachho.
  3. Avoid generic or overly specific AI-sounding aesthetic labels. Focus on descriptive, elegant outfit names.
  4. Sound sophisticated and premium.
  5. Include detailed accessories, footwear, and jewelry in the styling breakdown.
  6. Match the budget and destination weather perfectly.
  7. Return Exactly 5 outfits.`;

  const stream = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: OUTFIT_SCHEMA
    }
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
