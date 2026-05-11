import React from "react";
import { motion } from "motion/react";
import { useStylistStore } from "@/store/useStylistStore";
import { streamOutfits } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart, Save, Sparkles, RefreshCcw, ShoppingBag, Check, Camera, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { toast } from "sonner";

import { GoogleGenAI } from "@google/genai";

const Visualizer = ({ description }: { description: string }) => {
  const [isVisualizing, setIsVisualizing] = React.useState(false);
  const [visualUrl, setVisualUrl] = React.useState<string | null>(null);

  const generateVisual = async () => {
    setIsVisualizing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `High-end luxury fashion editorial photography, ${description}, soft natural sunlight, studio lighting, voguish aesthetic, highly detailed, 8k. Portrait orientation, model centered, luxury vibes.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setVisualUrl(`data:image/png;base64,${base64EncodeString}`);
            break;
          }
        }
      } else {
        throw new Error("No image data received from Gemini");
      }
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      toast.error("AI Visualization currently limited. Please try again later.");
    } finally {
      setIsVisualizing(false);
    }
  };

  return (
    <div className="mt-12 pt-12 border-t border-primary/10">
      {!visualUrl ? (
        <button 
          onClick={generateVisual}
          disabled={isVisualizing}
          className="group flex items-center gap-4 text-[10px] uppercase font-bold tracking-[.3em] text-primary/60 hover:text-primary transition-all"
        >
          {isVisualizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI Synthesizing Visual Concept...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Visualize this Silhouette with AI
            </>
          )}
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
             <span className="text-[9px] uppercase tracking-[.4em] font-bold text-primary italic">AI Aesthetic Visualization</span>
             <button onClick={() => setVisualUrl(null)} className="text-[8px] uppercase font-bold tracking-widest opacity-30 hover:opacity-100 transition-opacity">Clear Visual</button>
          </div>
          <div className="aspect-[4/5] md:aspect-[16/9] relative overflow-hidden luxury-shadow bg-beige/10 group">
             <img 
               src={visualUrl} 
               alt="Aesthetic Visualization" 
               className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 border-[0.5px] border-primary/20 m-6 pointer-events-none group-hover:m-4 transition-all duration-700" />
             <div className="absolute bottom-8 left-8 right-8">
               <p className="text-[10px] font-heading italic text-white/80 leading-relaxed bg-black/20 backdrop-blur-sm p-4 border-l border-white/30">
                 "{description.slice(0, 120)}..."
               </p>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const OutfitCard = ({ outfit, index }: { outfit: any, index: number }) => {
  const handleSpecificShop = (keyword: string, platform: string) => {
    const fullQuery = encodeURIComponent(`${keyword} fashion india`);
    let url = `https://www.google.com/search?q=${fullQuery}`;
    
    const searchUrls: Record<string, string> = {
      "Nykaa": `https://www.nykaa.com/search/result/?q=${encodeURIComponent(keyword)}`,
      "Myntra": `https://www.myntra.com/search-results?q=${encodeURIComponent(keyword)}`,
      "Westside": `https://www.westside.com/search?q=${encodeURIComponent(keyword)}`,
      "Amazon": `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`,
      "Ajio": `https://www.ajio.com/search/?text=${encodeURIComponent(keyword)}`,
      "Zara": `https://www.zara.com/in/en/search?searchTerm=${encodeURIComponent(keyword)}`,
      "Aachho": `https://www.aachho.com/search?q=${encodeURIComponent(keyword)}`,
      "Bunai": `https://www.bunai.com/search?q=${encodeURIComponent(keyword)}`,
      "Libas": `https://www.libas.in/search?q=${encodeURIComponent(keyword)}`,
      "Urbanic": `https://in.urbanic.com/search/${encodeURIComponent(keyword)}`,
      "Savana": `https://www.savana.com/search?q=${encodeURIComponent(keyword)}`,
      "NA-KD": `https://www.na-kd.com/en/search?q=${encodeURIComponent(keyword)}`,
      "Uniqlo": `https://www.uniqlo.com/in/en/search?q=${encodeURIComponent(keyword)}`
    };

    if (searchUrls[platform]) {
      url = searchUrls[platform];
    } else if (platform !== "Custom") {
      // Fallback search that includes the platform
      url = `https://www.google.com/search?q=${encodeURIComponent(keyword + " " + platform + " India")}`;
    }

    window.open(url, '_blank');
  };

  const handleShopFullLook = (brand?: string) => {
    const breakdown = outfit.styling_breakdown || "";
    const descriptiveQuery = `${outfit.outfit_name} ${breakdown.slice(0, 80)}`;
    const brandsSuffix = brand ? ` on ${brand}` : "";
    const fullQuery = encodeURIComponent(`${descriptiveQuery}${brandsSuffix} fashion india`);
    const url = `https://www.google.com/search?q=${fullQuery}`;
    window.open(url, '_blank');
    toast.info("Opening full look search for precise styling matching...");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
      className="bg-white border border-primary/10 mb-16 relative overflow-hidden group luxury-shadow"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col md:flex-row">
        {/* Left Column: Specs */}
        <div className="md:w-1/3 bg-beige/30 p-8 md:p-12 border-b md:border-b-0 md:border-r border-primary/10 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-heading italic text-beige mb-6">0{index + 1}</div>
            <h3 className="text-2xl font-heading leading-tight mb-4 uppercase tracking-wider">{outfit.outfit_name}</h3>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {outfit.color_palette?.map((color: string, i: number) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white border border-primary/5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[9px] uppercase font-bold tracking-tighter opacity-60">{color}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-8 border-t border-primary/10">
            <span className="text-[9px] uppercase tracking-widest font-bold text-primary mb-2 block">Price Tier</span>
            <p className="text-xl font-heading">{outfit.price_range}</p>
          </div>
        </div>
        
        {/* Right Column: Breakdown */}
        <div className="md:w-2/3 p-8 md:p-12 relative">
          <div className="mb-10">
            <div className="mb-6">
              <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary italic">Style Breakdown</div>
            </div>
            <p className="text-lg font-heading italic leading-relaxed text-foreground/80 indent-12 mb-8">
              {outfit.styling_breakdown}
            </p>
          </div>

          <div className="flex flex-col gap-10 pt-12 border-t border-primary/10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 mb-8 block">Fashion Shopping Assistant</span>
              <div className="space-y-10">
                {outfit.shopping_items?.map((item: any, i: number) => (
                  <div key={i} className="group/item">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-[#B8922A] bg-[#B8922A]/5 px-2 py-0.5 border border-[#B8922A]/20">{item.category}</span>
                          <span className="text-[8px] uppercase tracking-[0.1em] opacity-30 font-bold">Curated Choice</span>
                        </div>
                        <p className="text-sm font-heading font-medium text-foreground/90 uppercase tracking-wide leading-tight">{item.item}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.platforms.map((platform: string) => (
                          <button 
                            key={platform}
                            onClick={() => handleSpecificShop(item.search_keywords[0], platform)}
                            className="h-10 px-4 border border-primary/10 text-[9px] uppercase font-bold tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all bg-white shadow-sm flex items-center justify-center min-w-[100px] cursor-pointer"
                          >
                            Find on {platform}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-primary/5 group-last/item:hidden" />
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => handleShopFullLook()}
              className="w-full md:w-auto px-8 py-5 bg-foreground text-background text-[11px] tracking-widest uppercase font-bold hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl mt-4"
            >
              <ShoppingBag className="w-4 h-4" /> Shop Full Look
            </button>
          </div>
          
          <Visualizer description={outfit.styling_breakdown} />
        </div>
      </div>
    </motion.div>
  );
};

export default function Results() {
  const { preferences, results, addResult, clearResults, isLoading, setIsLoading } = useStylistStore();
  const [error, setError] = React.useState<string | null>(null);

  const performGenerate = React.useCallback(async () => {
    if (!preferences.destination) return;
    
    setIsLoading(true);
    clearResults();
    setError(null);
    
    let fullText = "";
    try {
      const stream = streamOutfits(preferences);
      for await (const chunk of stream) {
        fullText += chunk;
      }
      
      const parsed = JSON.parse(fullText);
      if (Array.isArray(parsed)) {
        parsed.forEach((item, i) => {
          setTimeout(() => addResult(item), i * 300);
        });
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#B8922A', '#C9A9A6', '#F6F1EA']
          });
        }, 1500);
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError("We encountered an issue curating your look. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [preferences, addResult, clearResults, setIsLoading]);

  React.useEffect(() => {
    performGenerate();
  }, [performGenerate]);

  const saveToArchive = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please sign in to archive this edition.");
      return;
    }

    try {
      await addDoc(collection(db, "outfit_sessions"), {
        userId: user.uid,
        destination: preferences.destination,
        aesthetic: preferences.aesthetic,
        gender: preferences.gender,
        season: preferences.season,
        outfits: results,
        createdAt: serverTimestamp(),
      });
      toast.success("Edition archived in your Personal Vault.");
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.9 },
        colors: ['#B8922A', '#FDFCFB']
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "outfit_sessions");
    }
  };

  const saveToBoard = async (outfit: any) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please sign in to save this look.");
      return;
    }

    // For now, we'll save it to a "General" board or create one if none exists
    // Ideally, a dropdown would show boards, but let's implement the logic first
    try {
      await addDoc(collection(db, "wishlist_items"), {
        userId: user.uid,
        type: "outfit",
        name: outfit.outfit_name,
        brand: outfit.brand || "Nayela Curated",
        price: outfit.price_range,
        notes: outfit.styling_breakdown,
        category: "editorial",
        aesthetic: preferences.aesthetic,
        createdAt: serverTimestamp(),
      });
      toast.success("Look saved to your Wishlist.");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "wishlist_items");
    }
  };

  return (
    <div className="container mx-auto px-6 py-24 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <Link to="/plan" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-extreme text-foreground/40 hover:text-primary mb-6 transition-all font-bold">
            <ArrowLeft className="w-3 h-3" /> Back to Planner
          </Link>
          <h1 className="text-5xl md:text-7xl font-heading italic serif-italic">The <span className="not-italic font-normal">Editorial</span></h1>
          <p className="text-foreground/50 mt-4 max-w-md text-sm font-heading">
            Styled for {preferences.destination} — {preferences.aesthetic?.[0]} {preferences.gender} Silhouette
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={saveToArchive}
            className="px-8 h-14 bg-white border border-primary/20 text-primary text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-beige transition-all shadow-xl"
          >
            <Bookmark className="w-4 h-4" />
            Save to Archive
          </button>
          <button 
            onClick={() => window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(preferences.aesthetic?.[0] + " " + preferences.gender + " fashion trends")}`, '_blank')}
            className="px-8 h-14 bg-[#B8922A] text-white text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-[#B8922A]/90 transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Shop This Aesthetic
          </button>
          <button 
            onClick={performGenerate}
            disabled={isLoading}
            className="px-8 h-14 border border-foreground/10 text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-beige transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Regenerate Edition
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((outfit, i) => (
              <div key={i} className="relative">
                <OutfitCard 
                  outfit={outfit} 
                  index={i} 
                />
                <button 
                  onClick={() => saveToBoard(outfit)}
                  className="absolute top-8 right-8 z-10 p-4 bg-white/90 backdrop-blur-sm border border-primary/10 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-all group"
                  title="Save to Wishlist"
                >
                  <Heart className="w-5 h-5 group-hover:scale-125 transition-transform" />
                </button>
              </div>
            ))}
            


            <div className="pt-24 text-center">
              <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/30 font-bold">
                These outfit recommendations are AI-generated. Feel free to create your own style.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-16">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-primary/5 bg-white flex flex-col md:flex-row h-[500px] animate-pulse">
                <div className="md:w-1/3 bg-beige/30" />
                <div className="md:w-2/3 p-12 space-y-8">
                  <div className="h-10 bg-beige w-3/4" />
                  <div className="h-4 bg-beige w-1/2" />
                  <div className="space-y-4">
                    <div className="h-4 bg-beige w-full opacity-50" />
                    <div className="h-4 bg-beige w-full opacity-50" />
                    <div className="h-4 bg-beige w-[90%] opacity-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
           <div className="text-center py-40 border border-dashed border-primary/20">
             <h3 className="font-heading text-3xl mb-4 italic">A Small Editorial Delay</h3>
             <p className="text-foreground/50 mb-10 max-w-sm mx-auto text-sm">{error}</p>
             <button onClick={performGenerate} className="px-10 py-4 border border-primary text-primary text-[10px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all">Try Again</button>
           </div>
        ) : (
          <div className="text-center py-40">
            <p className="text-foreground/40 italic font-heading text-xl">Your curated edition is waiting.</p>
            <Link to="/plan">
              <button className="mt-10 px-10 py-4 bg-primary text-white text-[10px] tracking-widest uppercase font-bold shadow-xl">Get Started</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
