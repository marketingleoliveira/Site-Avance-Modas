import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useStoreSelectorSettings } from "@/hooks/useSiteSettings";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
// Eager: storefront entry routes (LCP-critical, frequently the first paint)
import StoreSelector from "./pages/StoreSelector";
import InicioVarejo from "./pages/InicioVarejo";
import InicioAtacado from "./pages/InicioAtacado";
// Lazy: everything else — keeps initial bundle small.
const ShopifyProductPage = lazy(() => import("./pages/ShopifyProductPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const PrivateLabelPage = lazy(() => import("./pages/PrivateLabelPage"));
const SACPage = lazy(() => import("./pages/SACPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const WholesaleCheckout = lazy(() => import("./pages/WholesaleCheckout"));
const WholesaleConfirmation = lazy(() => import("./pages/WholesaleConfirmation"));
const GuidesHub = lazy(() => import("./pages/GuidesHub"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CommercialLanding = lazy(() => import("./pages/CommercialLanding"));
import { Loader2 } from "lucide-react";
import { landingPages } from "@/content/seoContent";

const queryClient = new QueryClient();

// Gate that decides whether the homepage selector renders or redirects to /varejo
const HomeGate = () => {
  const { settings, loading } = useStoreSelectorSettings();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (settings?.homepage_enabled === false) {
    return <Navigate to="/varejo" replace />;
  }
  return <StoreSelector />;
};

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
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <Routes>
        <Route path="/" element={<HomeGate />} />
        <Route path="/atacado" element={<InicioAtacado />} />
        <Route path="/varejo" element={<InicioVarejo />} />
        <Route path="/produto/:handle" element={<ShopifyProductPage />} />
        <Route path="/categoria/:category" element={<CategoryPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/rastreio" element={<TrackingPage />} />
        <Route path="/private-label" element={<PrivateLabelPage />} />
        <Route path="/sac" element={<SACPage />} />
        <Route path="/suporte" element={<SupportPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/depoimentos" element={<TestimonialsPage />} />
        <Route path="/atacado/checkout" element={<WholesaleCheckout />} />
        <Route path="/atacado/confirmacao" element={<WholesaleConfirmation />} />
        <Route path="/guias" element={<GuidesHub />} />
        <Route path="/guias/:slug" element={<GuideDetail />} />

        {landingPages.map((cfg) => (
          <Route
            key={cfg.slug}
            path={`/${cfg.slug}`}
            element={<CommercialLanding config={cfg} />}
          />
        ))}

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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
