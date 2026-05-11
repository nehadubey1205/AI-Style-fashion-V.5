import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden pt-20">
      {/* Left Column: Content */}
      <div className="w-full md:w-[55%] p-8 md:p-24 flex flex-col justify-center relative">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-10 md:top-20 left-8 md:left-16 text-[80px] md:text-[120px] font-heading italic text-beige select-none pointer-events-none leading-none z-0"
        >
          01
        </motion.div>
        
        <div className="relative z-10 space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] tracking-extreme uppercase text-primary font-semibold italic"
          >
            Vacay Vogue AI Edition
          </motion.h2>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl leading-[1.1] font-heading"
          >
            Your AI Style <br/>
            <span className="italic font-light serif-italic">Editor</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-foreground/70 max-w-md leading-relaxed"
          >
            Luxury vacation styling curated specifically for the modern Indian traveler. Elevate your destination wardrobe with Pinterest-worthy aesthetics.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 pt-4"
          >
            <Link to="/plan">
              <button className="bg-primary text-white px-10 py-4 text-[10px] tracking-logo uppercase font-bold hover:bg-primary/90 transition-all flex items-center gap-3 cursor-pointer">
                Start Planning
                <span className="text-lg">→</span>
              </button>
            </Link>
            <Link to="/lookbook">
              <button className="border border-foreground/10 px-10 py-4 text-[10px] tracking-logo uppercase font-bold hover:bg-beige transition-all cursor-pointer">
                View Lookbook
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Visual Case */}
      <div className="w-full md:w-[45%] bg-beige relative flex items-center justify-center p-8 md:p-16 border-l border-primary/10 min-h-[500px]">
        <div className="w-full h-full border border-primary/30 relative flex items-center justify-center py-10 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 border border-primary/20 rounded-full" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-4/5 aspect-[3/4] bg-white luxury-shadow relative group overflow-hidden border border-primary/10"
          >
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop" 
              alt="Editorial" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border-[0.5px] border-primary/20 m-6" />
            <div className="absolute inset-x-0 bottom-0 p-12 text-center bg-gradient-to-t from-background/80 to-transparent">
               <div className="w-12 h-[1px] bg-primary mx-auto mb-6" />
               <span className="text-[10px] tracking-widest uppercase mb-4 block">Archive Edition</span>
               <span className="text-4xl font-heading italic serif-italic">High Noon <br/> Silhouette</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
