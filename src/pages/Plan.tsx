import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MapPin, IndianRupee, Calendar, Layers, Palmtree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useStylistStore } from "@/store/useStylistStore";
import { cn } from "@/lib/utils";

const vibes = [
  "Ethnic Chic", 
  "Boho Goddess", 
  "Old Money", 
  "Cottagecore", 
  "Minimalist Luxe", 
  "Y2K Revival", 
  "Dark Academia"
];

const occasions = [
  "Vacation", "Brunch", "Airport", "Dinner", "Party", "Wedding", "Sightseeing", "Beach"
];

export default function Plan() {
  const navigate = useNavigate();
  const { preferences, setPreferences, setIsLoading } = useStylistStore();
  const [selectedVibe, setSelectedVibe] = React.useState<string | null>(preferences.aesthetic?.[0] || null);

  const selectVibe = (vibe: string) => {
    setSelectedVibe(vibe);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVibe || !preferences.gender) {
      alert("Please select both a category and an aesthetic style.");
      return;
    }
    setPreferences({ aesthetic: [selectedVibe] });
    setIsLoading(true);
    navigate("/results");
  };

  return (
    <div className="container mx-auto px-6 py-24 pb-32">
      <div className="max-w-2xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-heading"
          >
            Style <span className="italic serif-italic font-light">Planner</span>
          </motion.h1>
          <p className="text-foreground/50 text-[10px] tracking-widest uppercase font-bold">Curating your customized vacation wardrobe</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Category Selection */}
            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-extreme font-bold text-primary italic">00. Select Category</Label>
              <div className="grid grid-cols-2 gap-4">
                {['Womenswear', 'Menswear'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPreferences({ gender: cat as any })}
                    className={cn(
                      "h-16 border text-[10px] tracking-widest uppercase transition-all duration-300 font-bold flex items-center justify-center gap-3",
                      preferences.gender === cat 
                        ? "bg-primary border-primary text-white shadow-lg" 
                        : "bg-beige/60 border-primary/15 text-foreground/70 hover:bg-beige/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-extreme font-bold text-primary italic">01. Destination</Label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <Input 
                  placeholder="Where are you venturing?"
                  className="pl-12 h-14 bg-transparent border-primary/20 focus:border-primary transition-all text-lg font-heading italic rounded-none"
                  required
                  value={preferences.destination}
                  onChange={(e) => setPreferences({ destination: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-extreme font-bold text-primary italic">02. Budget (INR)</Label>
                <div className="relative group">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input 
                    type="number"
                    min="5000"
                    placeholder="Min. 5000"
                    className="pl-12 h-14 bg-transparent border-primary/20 focus:border-primary transition-all rounded-none"
                    required
                    onChange={(e) => setPreferences({ budget: parseInt(e.target.value) })}
                    value={preferences.budget || ''}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-extreme font-bold text-primary italic">03. Duration</Label>
                <Select onValueChange={(val: string) => setPreferences({ duration: val })} required value={preferences.duration}>
                  <SelectTrigger className="h-14 bg-transparent border-primary/20 focus:border-primary rounded-none">
                    <SelectValue placeholder="Trip Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekend">Weekend</SelectItem>
                    <SelectItem value="1 Week">1 Week</SelectItem>
                    <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-extreme font-bold text-primary italic">04. Aesthetic Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {vibes.map(vibe => (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => selectVibe(vibe)}
                    className={cn(
                      "px-4 py-6 border text-[9px] tracking-widest uppercase transition-all duration-300 font-bold flex flex-col items-center justify-center gap-2",
                      selectedVibe === vibe 
                        ? "bg-primary border-primary text-white shadow-lg scale-[1.02]" 
                        : "bg-white border-primary/5 text-foreground/40 hover:border-primary/20"
                    )}
                  >
                    <Layers className={cn("w-4 h-4", selectedVibe === vibe ? "text-white" : "text-primary/20")} />
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-12 border-t border-primary/10">
              <button
                type="submit"
                className="w-full bg-primary text-white h-16 text-[10px] tracking-widest uppercase font-bold hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-4 group"
              >
                Curate My Style Editorial
                <span className="text-lg transition-transform group-hover:translate-x-2">→</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
