import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
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
import PrivateLabelPage from "./pages/PrivateLabelPage";
import SACPage from "./pages/SACPage";
import SupportPage from "./pages/SupportPage";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Component that uses the cart sync hook and checks maintenance mode
const AppContent = () => {
  useCartSync();
  const location = useLocation();
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  
  // Allow admin routes even in maintenance mode
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Show loading state while checking maintenance
  if (isLoading && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Show maintenance page if enabled (except for admin routes)
  if (isMaintenanceMode && !isAdminRoute) {
    return <MaintenancePage />;
  }
  
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
        <Route path="/private-label" element={<PrivateLabelPage />} />
        <Route path="/sac" element={<SACPage />} />
        <Route path="/suporte" element={<SupportPage />} />
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
