import React from "react";
import { motion } from "motion/react";
import { 
  Check, 
  Sun, 
  Smartphone, 
  Heart, 
  Shirt, 
  Utensils, 
  Wind,
  Droplets,
  Cloud,
  Briefcase,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
  icon: any;
}

const INITIAL_ITEMS: PackingItem[] = [
  { id: "1", name: "First Aid Box", packed: false, icon: Heart },
  { id: "2", name: "Sunscreen & Moisturizer", packed: false, icon: Droplets },
  { id: "3", name: "Innerwear", packed: false, icon: Shirt },
  { id: "4", name: "Perfume", packed: false, icon: Sparkles },
  { id: "5", name: "Lip Balm", packed: false, icon: Sparkles },
  { id: "6", name: "Sleepwear", packed: false, icon: Shirt },
  { id: "7", name: "Munchies / Snacks", packed: false, icon: Utensils },
  { id: "8", name: "Phone Charger", packed: false, icon: Smartphone },
  { id: "9", name: "Power Bank", packed: false, icon: Zap },
  { id: "10", name: "Medicines", packed: false, icon: Heart },
  { id: "11", name: "Sanitizer", packed: false, icon: Droplets },
  { id: "12", name: "Sunglasses", packed: false, icon: Sun },
  { id: "13", name: "Water Bottle", packed: false, icon: Droplets },
];

export default function PackingList() {
  const [items, setItems] = React.useState<PackingItem[]>(INITIAL_ITEMS);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, packed: !item.packed } : item
    ));
  };

  const packedCount = items.filter(i => i.packed).length;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-32 pb-48 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <span className="w-8 h-px bg-primary/20" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary italic">Traveler's Essential</span>
            <span className="w-8 h-px bg-primary/20" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-heading italic serif-italic"
          >
            Pack My <span className="not-italic font-normal">Bag ✈️</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-foreground/50 font-heading text-sm italic"
          >
            Travel essentials you shouldn’t forget.
          </motion.p>
          
          <div className="flex justify-center pt-8">
            <div className="bg-white/50 border border-primary/5 px-6 py-2 rounded-full shadow-sm flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Status</span>
              <div className="h-1 w-24 bg-primary/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  animate={{ width: `${(packedCount / items.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-primary">{packedCount}/{items.length}</span>
            </div>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {items.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                "group flex items-center gap-4 p-5 bg-white border luxury-shadow cursor-pointer transition-all duration-300",
                item.packed ? "border-primary/10 opacity-50" : "border-primary/5 hover:border-primary/20 hover:scale-[1.02]"
              )}
            >
              <div className={cn(
                "w-5 h-5 flex items-center justify-center border transition-all duration-300 rounded-[2px]",
                item.packed ? "bg-primary border-primary" : "border-primary/20 group-hover:border-primary"
              )}>
                {item.packed && <Check className="w-3 h-3 text-white" />}
              </div>
              <item.icon className={cn(
                "w-4 h-4 transition-colors duration-300",
                item.packed ? "text-primary/40" : "text-primary/30"
              )} />
              <span className={cn(
                "text-[10px] uppercase tracking-widest font-bold transition-all",
                item.packed ? "line-through opacity-40" : "opacity-80"
              )}>
                {item.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Destination Note Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 bg-[#FFF9EA] border border-[#B8922A]/10 luxury-shadow flex items-start gap-6 relative overflow-hidden"
          >
            <div className="absolute top-[-10px] right-[-10px] opacity-[0.05]">
              <Sun className="w-24 h-24 text-[#B8922A]" />
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
              <Sun className="w-5 h-5 text-[#B8922A]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#B8922A]">Sunny Destination</h3>
              <p className="text-[11px] font-heading italic leading-relaxed text-[#B8922A]/80">
                “Carry a hat, sunglasses, sunscreen, and lightweight cotton clothes.”
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="p-8 bg-[#F0F7FF] border border-[#2A65B8]/10 luxury-shadow flex items-start gap-6 relative overflow-hidden"
          >
            <div className="absolute top-[-10px] right-[-10px] opacity-[0.05]">
              <Cloud className="w-24 h-24 text-[#2A65B8]" />
            </div>
            <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
              <Wind className="w-5 h-5 text-[#2A65B8]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A65B8]">Cold Destination</h3>
              <p className="text-[11px] font-heading italic leading-relaxed text-[#2A65B8]/80">
                “Carry jackets, thermals, gloves, and moisturizing skincare essentials.”
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
