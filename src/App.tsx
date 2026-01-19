import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import StoreSelector from "./pages/StoreSelector";
import InicioAtacado from "./pages/InicioAtacado";
import InicioVarejo from "./pages/InicioVarejo";
import ShopifyProductPage from "./pages/ShopifyProductPage";
import CategoryPage from "./pages/CategoryPage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import TrackingPage from "./pages/TrackingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component that uses the cart sync hook
const AppContent = () => {
  useCartSync();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<StoreSelector />} />
        <Route path="/atacado" element={<InicioAtacado />} />
        <Route path="/varejo" element={<InicioVarejo />} />
        <Route path="/produto/:handle" element={<ShopifyProductPage />} />
        <Route path="/categoria/:category" element={<CategoryPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/rastreio" element={<TrackingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WhatsAppButton />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
