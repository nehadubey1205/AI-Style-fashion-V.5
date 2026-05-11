import React from "react";
import { motion } from "motion/react";
import { useStylistStore } from "@/store/useStylistStore";
import { streamOutfits } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, RefreshCcw, ShoppingBag, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { toast } from "sonner";

const OutfitCard = ({ outfit, index }: { outfit: any, index: number }) => {
  const handleShop = (brand?: string) => {
    // Exact redirect logic: combine outfit name and styling breakdown for precision
    const breakdown = outfit.styling_breakdown || "";
    // Limit breakdown length for URL safety but keep it descriptive
    const descriptiveQuery = `${outfit.outfit_name} ${breakdown.slice(0, 80)}`;
    const brandsSuffix = brand ? ` on ${brand}` : "";
    const fullQuery = encodeURIComponent(`${descriptiveQuery}${brandsSuffix} fashion india`);
    
    let url = `https://www.google.com/search?q=${fullQuery}`;
    
    if (brand === "Myntra") url = `https://www.myntra.com/search-results?q=${encodeURIComponent(descriptiveQuery)}`;
    if (brand === "H&M") url = `https://www2.hm.com/en_in/search-results.html?q=${encodeURIComponent(descriptiveQuery)}`;
    if (brand === "Westside") url = `https://www.westside.com/search?q=${encodeURIComponent(descriptiveQuery)}`;
    if (brand === "Amazon") url = `https://www.amazon.in/s?k=${encodeURIComponent(descriptiveQuery)}`;
    if (brand === "Ajio") url = `https://www.ajio.com/search/?text=${encodeURIComponent(descriptiveQuery)}`;
    if (brand === "Zara") url = `https://www.zara.com/in/en/search?searchTerm=${encodeURIComponent(descriptiveQuery)}`;

    window.open(url, '_blank');
    toast.info(`Redirecting to ${brand || "curated boutique"} for precise styling matching...`);
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
            <h3 className="text-3xl font-heading leading-tight mb-4 uppercase tracking-wider">{outfit.outfit_name}</h3>
            
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
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary mb-6 italic">Style Breakdown</div>
            <p className="text-lg font-heading italic leading-relaxed text-foreground/80 indent-12">
              {outfit.styling_breakdown}
            </p>
          </div>

          <div className="flex flex-col gap-6 pt-8 border-t border-primary/10">
            <div>
               <span className="text-[8px] uppercase tracking-widest font-bold text-primary/60 mb-4 block">Direct Collection Links</span>
               <div className="flex flex-wrap gap-3">
                <button onClick={() => handleShop("Zara")} className="px-5 py-2.5 border border-primary/20 text-[9px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all cursor-pointer bg-primary/5">Zara</button>
                <button onClick={() => handleShop("H&M")} className="px-5 py-2.5 border border-primary/20 text-[9px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all cursor-pointer bg-primary/5">H&M</button>
                <button onClick={() => handleShop("Ajio")} className="px-5 py-2.5 border border-primary/20 text-[9px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all cursor-pointer bg-primary/5">Ajio</button>
                <button onClick={() => handleShop("Westside")} className="px-5 py-2.5 border border-primary/20 text-[9px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all cursor-pointer bg-primary/5">Westside</button>
                <button onClick={() => handleShop("Myntra")} className="px-5 py-2.5 border border-primary/20 text-[9px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all cursor-pointer bg-primary/5">Myntra</button>
                <button onClick={() => handleShop("Amazon")} className="px-5 py-2.5 border border-primary/20 text-[9px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all cursor-pointer bg-primary/5">Amazon</button>
              </div>
            </div>
            
            <button 
              onClick={() => handleShop()}
              className="w-full md:w-auto px-8 py-5 bg-foreground text-background text-[11px] tracking-widest uppercase font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <ShoppingBag className="w-4 h-4" /> Comprehensive Shopping Search
            </button>
          </div>
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

  return (
    <div className="container mx-auto px-6 py-24 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <Link to="/plan" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-extreme text-foreground/40 hover:text-primary mb-6 transition-all font-bold">
            <ArrowLeft className="w-3 h-3" /> Back to Planner
          </Link>
          <h1 className="text-5xl md:text-7xl font-heading italic serif-italic">The <span className="not-italic font-normal">Editorial</span></h1>
          <p className="text-foreground/50 mt-4 max-w-md text-sm font-heading">
            Styled for {preferences.destination} — {preferences.aesthetic?.join(" & ")} Aesthetic
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={performGenerate}
            disabled={isLoading}
            className="px-8 h-14 border border-foreground/10 text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-beige transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Regenerate
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((outfit, i) => (
              <OutfitCard 
                key={i} 
                outfit={outfit} 
                index={i} 
              />
            ))}
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-center pt-24 border-t border-primary/10"
            >
              <p className="font-heading text-3xl italic serif-italic mb-10">Seeking a more specific silhouette?</p>
              <Link to="/concierge">
                <button className="bg-foreground text-background px-12 py-5 text-[10px] tracking-logo uppercase font-bold hover:opacity-90 transition-all shadow-2xl flex items-center gap-4 mx-auto">
                  Consult the AI Concierge <Sparkles className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            <div className="pt-20 text-center">
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
