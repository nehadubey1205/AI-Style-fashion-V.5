import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Search, MapPin, Trash2, ChevronRight, Bookmark, MoveRight, 
  ExternalLink, Sparkles, Heart, BookOpen, Layers, Fingerprint, 
  History, Compass, Plus, Globe, Camera
} from "lucide-react";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
type VaultSection = "odyssey" | "dna" | "collections" | "wishlist" | "journal" | "archive";

const DESTINATIONS = [
  {
    name: "Bhutan",
    description: "Curated Himalayan Escape",
    pinterest: "Bhutan luxury travel outfits",
    images: [
      "https://images.unsplash.com/photo-1549468057-5b64301ba6c7?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578509335537-88229b4e1871?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571738222384-569df5d309be?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Paris",
    description: "Ode to Parisian Chic",
    pinterest: "Paris fashion travel looks",
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Spain",
    description: "Languid Summer Dreams",
    pinterest: "Spain summer outfits",
    images: [
      "https://images.unsplash.com/photo-1543783232-475031b405d4?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504019347908-b45f9b0b3dd2?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464790719720-a73bd3d91605?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Japan",
    description: "Neo-Traditional Journey",
    pinterest: "Japan travel outfits aesthetic",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1480796720875-10313f8c87ee?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Bali",
    description: "Tropical Minimalism",
    pinterest: "Bali luxury vacation outfits",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1477505982272-9d74c30c829e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525596662741-e94ff9f26de3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Switzerland",
    description: "Alpine Quiet Luxury",
    pinterest: "Switzerland winter travel outfits",
    images: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Dubai",
    description: "The Desert Metropolis",
    pinterest: "Dubai luxury travel fashion",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489493585363-d6943429ef21?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526431454642-5961fbacc63d?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "India",
    description: "Vibrant Royal Heritage",
    pinterest: "India ethnic travel fashion",
    images: [
      "https://images.unsplash.com/photo-1524492707947-28a0ff991d7c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1477587458883-47aa0ea10c41?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532664182805-0815846b9bbd?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514222139-b76628225a1d?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Australia",
    description: "Coastal Escapism",
    pinterest: "Australia coastal travel outfits",
    images: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523482596117-9960ee162520?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    name: "Europe",
    description: "Continental Grandeur",
    pinterest: "Europe summer travel fashion",
    images: [
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1490642223044-3c37324188ca?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop"
    ]
  }
];

const DestinationCard = ({ destination, index }: { destination: any, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative h-[500px] overflow-hidden bg-black cursor-pointer shadow-2xl"
      onClick={() => window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(destination.pinterest)}`, '_blank')}
    >
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
        <div className="overflow-hidden">
          <img 
            src={destination.images[0]} 
            className="w-full h-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-110" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="grid grid-rows-2 gap-0.5">
          <div className="overflow-hidden">
            <img src={destination.images[1]} className="w-full h-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-110" referrerPolicy="no-referrer" />
          </div>
          <div className="overflow-hidden">
            <img src={destination.images[2]} className="w-full h-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-110" referrerPolicy="no-referrer" />
          </div>
        </div>
        <div className="overflow-hidden">
          <img src={destination.images[3]} className="w-full h-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-110" referrerPolicy="no-referrer" />
        </div>
        <div className="overflow-hidden bg-primary/20 flex items-center justify-center relative">
          <img src={destination.images[0]} className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]" referrerPolicy="no-referrer" />
          <div className="relative z-10 p-4 border border-white/20 backdrop-blur-sm bg-black/40">
            <Sparkles className="w-4 h-4 text-[#B8922A]" />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <motion.div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-[#B8922A]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#B8922A]">Editorial</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-heading text-white italic drop-shadow-lg mb-1">{destination.name}</h3>
          <p className="text-[10px] uppercase tracking-extreme text-white/60 font-bold mb-6 font-sans">{destination.description}</p>
          <div className="flex items-center gap-2 text-white overflow-hidden">
            <div className="w-0 group-hover:w-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap">Explore Destination</span>
              <MoveRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 border-0 group-hover:border-[12px] border-[#B8922A]/10 transition-all duration-700 pointer-events-none" />
    </motion.div>
  );
};

export default function Lookbook() {
  const [activeSection, setActiveSection] = React.useState<VaultSection>("odyssey");
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [collections, setCollections] = React.useState<any[]>([]);
  const [wishlist, setWishlist] = React.useState<any[]>([]);
  const [journal, setJournal] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubSessions = onSnapshot(query(collection(db, "outfit_sessions"), where("userId", "==", user.uid), orderBy("createdAt", "desc")), (s) => setSessions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubCollections = onSnapshot(query(collection(db, "style_collections"), where("userId", "==", user.uid), orderBy("createdAt", "desc")), (s) => setCollections(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubWishlist = onSnapshot(query(collection(db, "wishlist_items"), where("userId", "==", user.uid), orderBy("createdAt", "desc")), (s) => setWishlist(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubJournal = onSnapshot(query(collection(db, "journal_entries"), where("userId", "==", user.uid), orderBy("createdAt", "desc")), (s) => setJournal(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    setLoading(false);
    return () => {
      unsubSessions();
      unsubCollections();
      unsubWishlist();
      unsubJournal();
    };
  }, []);

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "outfit_sessions", id));
      toast.success("Removed from vault.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `outfit_sessions/${id}`);
    }
  };

  const navItems = [
    { id: "odyssey", label: "Odyssey", icon: Compass },
    { id: "dna", label: "Style DNA", icon: Fingerprint },
    { id: "collections", label: "Boards", icon: Layers },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "archive", label: "Archive", icon: History },
  ] as const;

  if (!auth.currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-12">
          <div className="space-y-4">
            <Fingerprint className="w-16 h-16 text-[#B8922A] mx-auto opacity-20" />
            <h2 className="text-4xl font-heading italic">Vault <span className="not-italic font-normal">Enclosure</span></h2>
            <p className="text-foreground/40 text-[10px] uppercase tracking-[0.3em] font-bold leading-relaxed px-12">
              Our Personal Vault is a sanctuary reserved for the discerning NAYELA member. 
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full h-14 bg-primary text-white text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:shadow-2xl transition-all"
          >
            Authenticate to Enter
          </button>
          <div className="pt-12 border-t border-primary/5">
             <p className="text-[8px] uppercase tracking-widest font-bold opacity-20">NAYELA Artificial Intelligence © 2026</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFCFB]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 border-r border-primary/5 p-8 lg:h-screen lg:sticky lg:top-0 bg-white/40 backdrop-blur-xl z-20">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-px bg-[#B8922A]" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B8922A]">Personal Vault</span>
          </div>
          <h1 className="text-3xl font-heading italic serif-italic">NAYELA <span className="not-italic">Studio</span></h1>
        </div>

        <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:overflow-visible pb-4 lg:pb-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "flex items-center gap-4 px-6 py-4 transition-all duration-500 whitespace-nowrap lg:whitespace-normal",
                activeSection === item.id 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 -translate-y-1 lg:translate-x-4" 
                  : "text-foreground/40 hover:text-primary hover:bg-beige/20"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeSection === item.id ? "animate-pulse" : "")} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden lg:block mt-auto pt-12">
          <div className="p-6 bg-primary/5 border border-primary/10 space-y-4">
            <Sparkles className="w-5 h-5 text-[#B8922A]" />
            <p className="text-[10px] leading-relaxed text-foreground/60 italic font-heading">"Style is a way to say who you are without having to speak."</p>
            <div className="text-[8px] uppercase tracking-widest font-bold opacity-30">Curated Wisdom</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-24 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeSection === "odyssey" && (
            <motion.section 
              key="odyssey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-16"
            >
              <div className="max-w-2xl">
                <h2 className="text-5xl md:text-7xl font-heading italic serif-italic mb-6">Style <span className="not-italic font-normal">Odyssey</span></h2>
                <p className="text-foreground/50 font-heading text-sm italic">Cinematic destination-based fashion archives. Curated for the global voyager.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {DESTINATIONS.map((dest, i) => (
                  <DestinationCard key={dest.name} destination={dest} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {activeSection === "dna" && (
            <motion.section 
              key="dna"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <Fingerprint className="w-12 h-12 text-[#B8922A] mx-auto opacity-20" />
                <h2 className="text-5xl font-heading italic">Your Style <span className="not-italic font-normal">DNA</span></h2>
                <p className="text-foreground/40 text-xs uppercase tracking-widest font-bold">The AI's evolving understanding of your aesthetic essence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 p-12 bg-white border border-primary/5 luxury-shadow space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="w-12 h-12 text-[#B8922A] opacity-5 group-hover:scale-125 transition-transform duration-1000" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#B8922A]">AI Stylist Synthesis</span>
                    <h3 className="text-3xl font-heading italic">Visual Summary</h3>
                  </div>
                  <p className="text-lg leading-relaxed italic font-heading text-foreground/70">
                    "You gravitate towards <span className="text-[#B8922A]">minimalist silhouettes</span> with a preference for <span className="text-[#B8922A]">relaxed tailoring</span>. Your palette leans heavily on earth tones—sand, cream, and charcoal—balanced by occasional vibrant pops in heritage fabrics."
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-primary/5">
                    {[
                      { label: "Vibe", val: "Minimalist Luxe" },
                      { label: "Fabric", val: "Linen, Silk" },
                      { label: "Brand Logic", val: "High-Street Premium" },
                      { label: "Complexity", val: "Low (Quiet Luxury)" },
                    ].map(stat => (
                      <div key={stat.label}>
                        <div className="text-[8px] uppercase tracking-widest font-bold text-foreground/30 mb-1">{stat.label}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest">{stat.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-[#B8922A]/5 border border-[#B8922A]/10 space-y-4">
                    <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#B8922A]">Top Aesthetics</h4>
                    <div className="space-y-3">
                      {["Old Money", "Quiet Luxury", "Jet-set Chic", "Neutral Minimalist"].map((a, i) => (
                        <div key={a} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">{a}</span>
                          <div className="ml-auto text-[9px] font-mono text-primary/30">{(90 - i * 5)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 bg-black text-white space-y-6">
                    <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#B8922A]">Color Palette</h4>
                    <div className="flex gap-2">
                      {["#FDFCFB", "#F5F1ED", "#EAE3DB", "#2D2D2D", "#B8922A"].map(c => (
                        <div key={c} className="w-full h-8 border border-white/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 leading-relaxed">
                      Evolving based on your recent saves in 'Bhutan' and 'Minimalist Capsule' boards.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === "collections" && (
            <motion.section 
              key="collections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end gap-8 border-b border-primary/10 pb-12">
                <div className="space-y-4">
                  <h2 className="text-5xl font-heading italic serif-italic">Style <span className="not-italic font-normal">Boards</span></h2>
                  <p className="text-foreground/50 font-heading text-sm italic">Curated collections of your fashion memories.</p>
                </div>
                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-2xl transition-all">
                  <Plus className="w-4 h-4" /> Create Board
                </button>
              </div>

              {collections.length === 0 ? (
                <div className="py-32 text-center border border-dashed border-primary/20 bg-beige/10">
                   <Layers className="w-12 h-12 text-primary/20 mx-auto mb-6" />
                   <p className="font-heading italic text-xl opacity-40">Your boards are currently vacant.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {collections.map((board, i) => (
                    <motion.div
                      key={board.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-square bg-beige relative overflow-hidden mb-6 luxury-shadow">
                        <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <div className="absolute bottom-4 left-4 flex gap-1">
                          <div className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[8px] font-bold uppercase tracking-widest">12 Items</div>
                        </div>
                      </div>
                      <h4 className="text-lg font-heading italic mb-1">{board.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">{board.isPrivate ? "Private Board" : "Public Collection"}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activeSection === "wishlist" && (
            <motion.section key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="flex justify-between items-end gap-8 border-b border-primary/10 pb-12">
                <div className="space-y-4">
                  <h2 className="text-5xl font-heading italic serif-italic">Luxury <span className="not-italic font-normal">Wishlist</span></h2>
                  <p className="text-foreground/50 font-heading text-sm italic">Items strictly curated for your next acquisition.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group bg-white p-6 border border-primary/5 hover:border-primary/20 transition-all luxury-shadow">
                    <div className="aspect-[3/4] bg-beige mb-6 relative overflow-hidden">
                       <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=400`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[10px] uppercase tracking-widest font-bold">Linen Blend Blazer</h5>
                      <p className="text-[9px] italic font-heading text-foreground/40">Massimo Dutti</p>
                      <div className="pt-4 flex justify-between items-center text-[10px] font-mono">
                        <span>₹12,490</span>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                          <Plus className="w-2 h-2" /> 5% Off
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activeSection === "journal" && (
            <motion.section key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="flex justify-between items-end gap-8 border-b border-primary/10 pb-12">
                <div className="space-y-4">
                  <h2 className="text-5xl font-heading italic serif-italic">Style <span className="not-italic font-normal">Journal</span></h2>
                  <p className="text-foreground/50 font-heading text-sm italic">A private diary of your sartorial evolution.</p>
                </div>
                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-2xl transition-all">
                  <Camera className="w-4 h-4" /> New Entry
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[1, 2].map(i => (
                   <div key={i} className="flex gap-8 p-12 bg-white border border-primary/5 luxury-shadow group">
                     <div className="w-48 h-64 bg-beige overflow-hidden shrink-0">
                       <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600" className="w-full h-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-110" />
                     </div>
                     <div className="space-y-6">
                        <div className="text-[9px] uppercase tracking-widest font-bold opacity-30">May 11, 2026 • Midnight Mood</div>
                        <p className="font-heading italic leading-relaxed text-foreground/70">
                          "Felt powerful in the structured monochromatic set today. The linen texture adds the perfect depth to the minimal silhouette. Need more relaxed tailoring in charcoal."
                        </p>
                        <div className="p-4 bg-primary/5 border-l-2 border-[#B8922A] space-y-2">
                           <div className="flex items-center gap-2">
                             <Sparkles className="w-3 h-3 text-[#B8922A]" />
                             <span className="text-[8px] uppercase tracking-widest font-heavy text-[#B8922A]">AI Context</span>
                           </div>
                           <p className="text-[9px] leading-relaxed text-foreground/40 font-bold italic">This entry reinforces your 'Monochrome Minimalist' DNA profile.</p>
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
            </motion.section>
          )}

          {activeSection === "archive" && (
            <motion.section 
              key="archive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-primary/10 pb-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-heading italic serif-italic">Personal <span className="not-italic font-normal">Archive</span></h2>
                  <p className="text-foreground/50 font-heading text-sm italic">Historical archive of your curated vacation editorials.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input 
                    type="text" 
                    placeholder="Filter Archive..." 
                    className="w-full h-12 bg-white/50 border border-primary/10 pl-12 pr-4 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary transition-all font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[1, 2, 3].map(n => <div key={n} className="h-[450px] bg-beige/20 border border-primary/5 animate-pulse shadow-sm" />)}
                </div>
              ) : sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {sessions.filter(s => 
                    s.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.aesthetic?.some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((session, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={session.id}
                      className="group bg-white border border-primary/10 luxury-shadow overflow-hidden flex flex-col h-full"
                    >
                      <div className="h-72 bg-beige relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop" 
                          alt="Session" 
                          className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4">
                           <div className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-primary/20 text-[9px] uppercase tracking-widest font-bold">
                             {new Date(session.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                           </div>
                        </div>
                        <button 
                          onClick={(e) => deleteSession(session.id, e)}
                          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm border border-primary/20 text-foreground/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-1">
                        <div className="mb-6">
                          <h3 className="text-2xl font-heading mb-2">{session.destination}</h3>
                          <div className="flex flex-wrap gap-2">
                            {session.aesthetic?.map((v: string) => (
                              <span key={v} className="text-[9px] uppercase tracking-tighter text-primary font-bold opacity-60 italic">#{v}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-auto flex justify-between items-center text-[10px] tracking-widest font-bold uppercase pt-6 border-t border-primary/5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="opacity-40">{session.season} Edition</span>
                          </div>
                          <Link to={`/results?session=${session.id}`} className="text-primary hover:tracking-[0.15em] transition-all flex items-center gap-2">
                            View Editorial <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-40 border border-dashed border-primary/10 bg-white/50">
                  <p className="font-heading text-xl italic opacity-40">No archived editions matched your query.</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

