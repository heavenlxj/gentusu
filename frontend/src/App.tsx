import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/layout/AuthModal";
import Home from "@/pages/Home";
import ModePage from "@/pages/ModePage";
import PricingPage from "@/pages/PricingPage";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollManager />
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/:modeId" element={<ModePage />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}
