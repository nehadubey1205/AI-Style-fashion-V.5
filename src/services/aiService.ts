import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const OUTFIT_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      outfit_name: { type: Type.STRING, description: "Elegant name for the outfit (Strictly NO brand names)" },
      aesthetic_description: { type: Type.STRING, description: "Short moody description of the aesthetic" },
      styling_breakdown: { type: Type.STRING, description: "Detailed head-to-toe styling guide (Strictly NO brand names, purely editorial and descriptive)" },
      brand_suggestions: { type: Type.STRING, description: "Specific brands for this look (e.g. Zara, H&M, Myntra, Ajio, Westside, Amazon Fashion)" },
      price_range: { type: Type.STRING, description: "Estimated price in INR (e.g. ₹5,000 - ₹8,000)" },
      color_palette: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3-4 hex color codes representing the look" 
      },
      shopping_items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING, description: "Specific shoppable fashion item (e.g. Indigo cotton midi dress)" },
            category: { type: Type.STRING, enum: ["Dress", "Clothing", "Footwear", "Bag", "Accessories", "Jewelry"], description: "Category of the item" },
            search_keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Short marketplace-friendly search keywords" 
            },
            platforms: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Suggested platforms from [Zara, Ajio, Flipkart, Amazon, Westside, Nykaa]" 
            }
          },
          required: ["item", "category", "search_keywords", "platforms"]
        }
      }
    },
    required: ["outfit_name", "aesthetic_description", "styling_breakdown", "brand_suggestions", "price_range", "color_palette", "shopping_items"]
  }
};

export async function* streamOutfits(preferences: any) {
  const selectedStyle = preferences.aesthetic?.[0] || "Minimalist Luxe";
  const gender = preferences.gender || "Womenswear";

  const styleContext: Record<string, any> = {
    "Ethnic Chic": {
      womenswear: {
        brands: "Aachho, Bunai, Libas, House of Indya, Koskii, Mulmul",
        aesthetic: "Warm earthy luxury aesthetics, contemporary ethnic, Anarkalis, Indo-western sets, Cotton kurta sets, Chikankari",
        platformMap: "* Dresses & clothing → Aachho, Bunai, Libas\n* Footwear → Amazon, Myntra\n* Bags → Westside, Ajio\n* Accessories & jewelry → Nykaa, Ajio"
      },
      menswear: {
        brands: "Manyavar, Fabindia, Tasva, Jaypore, Peter England Ethnic",
        aesthetic: "Sophisticated modern ethnic, Nehru jackets, Kurtas with slim trousers, Bandhgala suits, Lucknowi Chikankari",
        platformMap: "* Clothing → Manyavar, Tasva, Fabindia\n* Footwear → Amazon, Myntra\n* Accessories → Ajio, Tata CLiQ"
      },
      exclude: "Zara, H&M, Forever 21",
      platforms: ["Manyavar", "Tasva", "Aachho", "Bunai", "Libas", "Ajio", "Amazon", "Westside", "Nykaa", "Fabindia"]
    },
    "Boho Goddess": {
      womenswear: {
        brands: "Urbanic, Savana, Etsy-inspired labels, Indie boutiques",
        aesthetic: "Earthy tones, desert-inspired, flowy silhouettes, crochet, fringe, tribal jewelry, Free People-inspired",
        platformMap: "* Dresses & clothing → Savana, Urbanic\n* Footwear → Amazon, Myntra\n* Bags → Westside, Zara\n* Accessories & jewelry → Nykaa, Myntra"
      },
      menswear: {
        brands: "Urbanic, H&M Conscious, Zara, Fabindia, Amazon Indie",
        aesthetic: "Relaxed nomadic style, linen shirts, printed short-sleeve button-downs, hemp trousers, leather sandals, beaded bracelets",
        platformMap: "* Clothing → Zara, H&M, Urbanic\n* Footwear → Amazon, Myntra\n* Accessories → Ajio, Nykaa"
      },
      exclude: "Corporate or formal wear, minimalist outfits",
      platforms: ["Savana", "Urbanic", "Amazon", "Westside", "Zara", "Nykaa", "H&M"]
    },
    "Old Money": {
      womenswear: {
        brands: "Ralph Lauren, Massimo Dutti, NA-KD, Tommy Hilfiger",
        aesthetic: "Timeless luxury, quiet luxury, linen trousers, structured blazers, neutral knitwear, pearl jewelry. Colors: Beige, White, Navy, Camel, Black",
        platformMap: "* Dresses & clothing → Massimo Dutti, NA-KD\n* Footwear → Zara, Amazon\n* Bags → Zara, Westside\n* Accessories & jewelry → Nykaa, Ajio"
      },
      menswear: {
        brands: "Ralph Lauren, Massimo Dutti, NA-KD Men, Brooks Brothers, Hackett London",
        aesthetic: "Classic prep, tailored chinos, polo shirts, navy blazers, loafers, leather belts, luxury watches. Aesthetic: Heritage, quiet luxury",
        platformMap: "* Clothing → Massimo Dutti, NA-KD Men\n* Footwear → Zara, Amazon\n* Accessories → Tata CLiQ Luxury, Ajio"
      },
      exclude: "Loud logos, fast fashion trends, neon colors",
      platforms: ["Massimo Dutti", "NA-KD", "Zara", "Amazon", "Westside", "Nykaa", "Ajio", "Tata CLiQ Luxury"]
    },
    "Cottagecore": {
      womenswear: {
        brands: "Zara, H&M, Urbanic, Local indie boutiques",
        aesthetic: "Romantic feminine countryside, Floral dresses, Puff sleeves, Lace, Soft cotton, Milkmaid dresses. Pastel aesthetic",
        platformMap: "* Dresses & clothing → Zara, Urbanic\n* Footwear → Amazon, Myntra\n* Bags → Westside, Zara\n* Accessories & jewelry → Nykaa, Myntra"
      },
      menswear: {
        brands: "Uniqlo, H&M, Zara, Westside, Marks & Spencer",
        aesthetic: "Soft rustic aesthetic, oversized linens, earth-toned cardigans, high-waisted pleated trousers, vintage leather satchels",
        platformMap: "* Clothing → Uniqlo, Zara, H&M\n* Footwear → Amazon, Westside\n* Accessories → Ajio, Nykaa"
      },
      exclude: "Hyper-modern, brutalist or streetwear aesthetics",
      platforms: ["Zara", "Urbanic", "Amazon", "Westside", "Nykaa", "Uniqlo", "H&M"]
    },
    "Minimalist Luxe": {
      womenswear: {
        brands: "Uniqlo, COS, Massimo Dutti, NA-KD, Zara Minimal",
        aesthetic: "Clean luxury, Monochrome, Tailored basics, Structured silhouettes, Neutral palettes",
        platformMap: "* Clothes → Uniqlo, Massimo Dutti\n* Alternatives → Zara, NA-KD\n* Bags → Zara, Westside\n* Accessories → Nykaa, Ajio"
      },
      menswear: {
        brands: "Uniqlo, COS, Massimo Dutti, NA-KD Men, Zara Man",
        aesthetic: "Architectural simplicity, premium basics, technical fabrics, monochrome layering, clean-cut overcoats, sleek sneakers",
        platformMap: "* Clothing → Uniqlo, Massimo Dutti, COS\n* Footwear → Zara, Adidas\n* Accessories → Ajio, Nykaa"
      },
      exclude: "Heavy prints, ruffles, maximalist accessories",
      platforms: ["Uniqlo", "Massimo Dutti", "NA-KD", "Zara", "Westside", "Nykaa", "Ajio"]
    },
    "Y2K Revival": {
      womenswear: {
        brands: "Urbanic, Bershka, H&M Trend, Forever 21, Savana",
        aesthetic: "2000s-inspired, Gen Z styling, Baby tees, Cargo pants, Rhinestones, Denim mini skirts, Metallic accessories",
        platformMap: "* Hot Items → Urbanic, Savana\n* Basics → H&M, Forever 21\n* Bags → Zara, Amazon\n* Accessories → Nykaa, Ajio"
      },
      menswear: {
        brands: "Urbanic, H&M Trend, Bershka, Zara, Superdry",
        aesthetic: "Baggy denim, cargo pants, graphic tees, tinted sunglasses, bucket hats, futuristic sneakers, oversized hoodies",
        platformMap: "* Clothing → Urbanic, H&M, Zara\n* Footwear → Flipkart, Amazon\n* Accessories → Ajio, Myntra"
      },
      exclude: "Formal suits, quiet luxury, vintage conservative wear",
      platforms: ["Urbanic", "Savana", "H&M", "Forever 21", "Zara", "Amazon", "Nykaa", "Ajio"]
    },
    "Dark Academia": {
      womenswear: {
        brands: "Zara, H&M, Marks & Spencer, Westside",
        aesthetic: "Moody intellectual, Plaid skirts, Turtlenecks, Wool coats, Oxford shoes, Vintage blazers. Colors: Brown, Charcoal, Olive, Black, Burgundy",
        platformMap: "* Clothing → Zara, Marks & Spencer\n* Footwear → Amazon, Myntra\n* Bags → Westside, Zara\n* Accessories → Nykaa, Ajio"
      },
      menswear: {
        brands: "Zara, H&M, Marks & Spencer, Westside, Blackberrys",
        aesthetic: "Brooding scholar, tweed blazers, corduroy trousers, cable-knit sweaters, chelsea boots, leather briefcases, minimal watches",
        platformMap: "* Clothing → Zara, Marks & Spencer\n* Footwear → Amazon, Myntra\n* Accessories → Nykaa, Tata CLiQ"
      },
      exclude: "Neon colors, resort wear, sportswear",
      platforms: ["Zara", "Marks & Spencer", "Westside", "Amazon", "Nykaa", "Ajio"]
    }
  };

  const currentStyleData = styleContext[selectedStyle] || styleContext["Minimalist Luxe"];
  const genderKey = gender.toLowerCase() as 'womenswear' | 'menswear';
  const context = currentStyleData[genderKey];

  const prompt = `You are an elite fashion editor and shopping assistant for NAYELA AI — Style Studio. 
  Create 5 Pinterest-worthy vacation outfits for a ${gender} trip to ${preferences.destination}.
  
  GENDER: ${gender}
  SELECTED STYLE: ${selectedStyle}
  Budget: ₹${preferences.budget}
  Duration: ${preferences.duration}
  Aesthetic Focus: ${context.aesthetic}
  
  Strict Style Rules:
  1. Recommend ONLY these brands: ${context.brands}.
  2. NEVER recommend: ${currentStyleData.exclude}.
  3. Sound sophisticated and premium, matching the ${selectedStyle} vibe for ${gender}.
  4. Include style-specific accessories, footwear, and jewelry.
  5. Match the budget and destination weather perfectly.
  6. Return Exactly 5 outfits as valid JSON.
  7. CRITICAL: NEVER mention brand names in 'outfit_name' or 'styling_breakdown'. Brand suggestions should ONLY appear in 'brand_suggestions'.
  8. For 'shopping_items', extract items based on this platform mapping:
${context.platformMap}
  9. Suggested platforms should be limited to: ${currentStyleData.platforms.join(", ")}.`;

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


