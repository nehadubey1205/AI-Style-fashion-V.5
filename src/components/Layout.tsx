import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Menu, X, Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

const NavLink = ({ to, children, active }: { to: string, children: React.ReactNode, active: boolean }) => (
  <Link 
    to={to} 
    className={cn(
      "text-[10px] uppercase tracking-widest transition-colors duration-300 relative py-1",
      active ? "text-primary border-b border-primary" : "text-foreground hover:text-primary"
    )}
  >
    {children}
  </Link>
);

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-20 px-6 md:px-12 flex items-center justify-between">
      <div className="container mx-auto flex justify-between items-center h-full">
        <Link to="/" className="text-2xl tracking-logo font-light">
          NAYELA <span className="text-primary font-normal italic serif-italic">AI</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12 font-bold uppercase tracking-widest">
          <NavLink to="/" active={location.pathname === "/"}>Home</NavLink>
          <NavLink to="/plan" active={location.pathname === "/plan"}>Plan</NavLink>
          <NavLink to="/lookbook" active={location.pathname === "/lookbook"}>Lookbook</NavLink>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-primary/10 px-6 py-8 flex flex-col space-y-6"
        >
          <Link to="/" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Home</Link>
          <Link to="/plan" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Plan</Link>
          <Link to="/lookbook" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Lookbook</Link>
        </motion.div>
      )}
    </nav>
  );
};

export const Footer = () => (
  <footer className="border-t border-primary/20 flex flex-col md:flex-row items-stretch min-h-40 bg-background">
    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-primary/20 p-8 flex flex-col justify-between">
      <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-bold">01 AI Styling</span>
      <p className="text-sm italic font-heading mt-4">Hyper-personalized outfit algorithms based on destination climate and luxury brand catalogs.</p>
    </div>
    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-primary/20 p-8 flex flex-col justify-between bg-beige/30">
      <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-bold">02 Pinterest Ready</span>
      <p className="text-sm italic font-heading mt-4">Visual storyboards and high-fidelity moodboards designed for effortless social sharing.</p>
    </div>
    <div className="w-full md:w-1/3 p-8 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-bold">03 Brand Curation</span>
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-2 h-2 rounded-full bg-accent" />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-[10px] tracking-widest uppercase font-bold">
        <span>Global Shipping</span>
        <span className="opacity-30">/</span>
        <span>Ethical Sourcing</span>
      </div>
    </div>
  </footer>
);
