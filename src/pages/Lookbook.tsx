import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Search, MapPin, Trash2, ChevronRight, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Lookbook() {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const q = query(
      collection(db, "outfit_sessions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
      setLoading(false);
    }, (error) => {
      console.error("Fetch Lookbook Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteDoc(doc(db, "outfit_sessions", id));
      toast.success("Edition removed from vault.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `outfit_sessions/${id}`);
    }
  };

  const filtered = sessions.filter(s => 
    s.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.aesthetic?.some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-6 py-24 pb-32 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-primary/10 pb-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-heading italic serif-italic">The <span className="not-italic font-normal">Vault</span></h1>
          <p className="text-foreground/50 font-heading text-sm italic">Public archive of curated vacation editorials.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input 
            type="text" 
            placeholder="Filter by Destination..." 
            className="w-full h-12 bg-beige/30 border border-primary/10 pl-12 pr-4 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3].map(n => <div key={n} className="h-[450px] bg-beige/20 border border-primary/5 animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map((session, i) => (
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
                    Visualise <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 border border-dashed border-primary/10">
          <p className="font-heading text-xl italic opacity-40">No archived editions matched your query.</p>
        </div>
      )}
    </div>
  );
}
