import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Sparkles, Plus, History, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Concierge() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  React.useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      where("userId", "==", auth.currentUser?.uid || "guest"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [auth.currentUser]);

  React.useEffect(() => {
    if (!currentConvId) {
      setMessages([{ role: "assistant", content: "Welcome to the NAYELA AI Luxury Concierge. I am your personal style editor. How can I assist with your vacation wardrobe today?" }]);
      return;
    }
    const q = query(
      collection(db, "conversations", currentConvId, "messages"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setMessages(snap.docs.map(d => d.data() as Message));
      }
    });
  }, [currentConvId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    let convId = currentConvId;
    if (!convId) {
      const conv = await addDoc(collection(db, "conversations"), {
        title: input.slice(0, 30) + "...",
        userId: auth.currentUser?.uid || "guest",
        createdAt: serverTimestamp()
      });
      convId = conv.id;
      setCurrentConvId(convId);
    }

    const userContent = input;
    setInput("");
    setIsTyping(true);

    try {
      await addDoc(collection(db, "conversations", convId, "messages"), {
        conversationId: convId,
        role: "user",
        content: userContent,
        createdAt: serverTimestamp()
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: "user", content: userContent }].map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are a luxury fashion concierge for NAYELA AI. Use a high-end, sophisticated tone. Expert in Indian vacation styling. Recommend brands like Ritu Kumar, Fabindia, Zara India. Focus on seasonal travel trends."
        }
      });

      const assistantText = response.text || "I apologize, my stylistic senses are momentarily clouded.";
      
      await addDoc(collection(db, "conversations", convId, "messages"), {
        conversationId: convId,
        role: "assistant",
        content: assistantText,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-background pt-20">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-primary/10 bg-beige/30">
        <div className="p-8">
          <button 
            onClick={() => setCurrentConvId(null)}
            className="w-full h-14 bg-primary text-white text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all shadow-xl"
          >
            <Plus className="w-4 h-4" /> New Edition
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar">
          <p className="px-2 text-[9px] uppercase tracking-extreme font-bold text-foreground/40 mb-4">Historical Archives</p>
          {conversations.map((conv) => (
            <button 
              key={conv.id} 
              onClick={() => setCurrentConvId(conv.id)}
              className={cn(
                "w-full text-left px-4 py-4 border border-transparent transition-all flex items-center gap-3",
                currentConvId === conv.id ? "bg-white border-primary/20 luxury-shadow" : "hover:bg-primary/5"
              )}
            >
              <MessageSquare className="w-3 h-3 text-primary/40" />
              <span className="truncate text-xs font-heading italic">{conv.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Message View */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12 no-scrollbar bg-white/20">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-2xl space-y-3",
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-8 text-sm leading-relaxed border luxury-shadow transition-all font-heading",
                  msg.role === "user" 
                    ? "bg-primary border-primary text-white" 
                    : "bg-white border-primary/10 text-foreground italic"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div className="flex items-center gap-3 px-2">
                   <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold">
                     {msg.role === "user" ? "The Client" : "Styling Intelligence"}
                   </span>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-foreground/30 text-[8px] uppercase tracking-extreme font-bold"
              >
                <div className="flex gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-primary" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-primary" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-primary" />
                </div>
                Drafting Response
              </motion.div>
            )}
            <div ref={scrollRef} />
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-8 md:p-12 pt-0 bg-white/20 backdrop-blur-sm border-t border-primary/5">
          <div className="max-w-3xl mx-auto flex gap-4 pt-10">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Inquire about silhouette, boutique brands, or destination vibes..."
              className="flex-1 h-16 bg-transparent border-b border-primary/20 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-primary transition-all px-4"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-16 h-16 bg-primary text-white flex items-center justify-center shadow-2xl hover:bg-primary/95 transition-all disabled:opacity-50"
            >
              {isTyping ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-6 flex flex-wrap gap-6 justify-center">
            {[ "Maldives Packing", "Ethnic Daywear", "Old Money Aesthetic" ].map((p) => (
              <button 
                key={p} 
                onClick={() => setInput(p)}
                className="text-[9px] uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors font-bold italic"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
