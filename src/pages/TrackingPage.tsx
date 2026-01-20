import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Truck, 
  ExternalLink,
  Loader2,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import loggiLogo from "@/assets/loggi-logo.png";

// Build Loggi tracking URL
const getLoggiTrackingUrl = (trackingNumber: string): string => {
  return `https://www.loggi.com/rastreio/${trackingNumber}/`;
};

export default function TrackingPage() {
  const [loggiCode, setLoggiCode] = useState("");
  const [showLoggiEmbed, setShowLoggiEmbed] = useState(false);
  const [loggiTrackingCode, setLoggiTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoggiSearch = () => {
    if (!loggiCode.trim()) {
      toast.error("Digite o código de rastreio");
      return;
    }
    setIsLoading(true);
    setLoggiTrackingCode(loggiCode.trim());
    setShowLoggiEmbed(true);
    // Simulate a brief loading state
    setTimeout(() => setIsLoading(false), 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado!");
  };

  const openLoggiTracking = (trackingNumber: string) => {
    window.open(getLoggiTrackingUrl(trackingNumber), "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Header with Loggi Logo */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-2">
              <img 
                src={loggiLogo} 
                alt="Loggi" 
                className="object-contain"
                style={{ width: '100px', height: '60px' }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rastreio de Entregas</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Acompanhe sua entrega em tempo real
            </p>
          </div>

          {/* Search Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                Rastrear Entrega
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Cole o código de rastreio que você recebeu por e-mail ou SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Cole o código de rastreio"
                  value={loggiCode}
                  onChange={(e) => setLoggiCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLoggiSearch()}
                  className="flex-1"
                />
                <Button onClick={handleLoggiSearch} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Rastrear
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loggi Embed */}
          {showLoggiEmbed && loggiTrackingCode && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Status da Entrega
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(loggiTrackingCode)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openLoggiTracking(loggiTrackingCode)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir no Site
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Código: <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{loggiTrackingCode}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full bg-muted" style={{ height: '600px' }}>
                  <iframe
                    src={getLoggiTrackingUrl(loggiTrackingCode)}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Rastreio Loggi"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help text */}
          {!showLoggiEmbed && (
            <div className="text-center text-sm text-muted-foreground">
              <p>O código de rastreio é enviado por e-mail e SMS quando sua encomenda é despachada.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
