/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "@/components/Layout";
import Home from "@/pages/Home";
import Plan from "@/pages/Plan";
import Results from "@/pages/Results";
import Lookbook from "@/pages/Lookbook";
import Concierge from "@/pages/Concierge";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

export default function App() {
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Anonymous signin failed:", err));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/results" element={<Results />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/concierge" element={<Concierge />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}
