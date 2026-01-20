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

// Build Loggi tracking URL - using app.loggi.com/rastreador format
const getLoggiTrackingUrl = (trackingNumber: string): string => {
  return `https://app.loggi.com/rastreador/${trackingNumber}`;
};

export default function TrackingPage() {
  const [loggiCode, setLoggiCode] = useState("");

  const handleLoggiSearch = () => {
    if (!loggiCode.trim()) {
      toast.error("Digite o código de rastreio");
      return;
    }
    // Open Loggi tracking in a new tab
    window.open(getLoggiTrackingUrl(loggiCode.trim()), "_blank");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-xl mx-auto space-y-6 sm:space-y-8">
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
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Ex: KR3G4235"
                  value={loggiCode}
                  onChange={(e) => setLoggiCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleLoggiSearch()}
                  className="flex-1 font-mono"
                />
                <Button onClick={handleLoggiSearch} className="w-full sm:w-auto">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Rastrear
                </Button>
              </div>
              
              {loggiCode.trim() && (
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <code className="text-sm font-mono">{loggiCode.trim()}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(loggiCode.trim())}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help text */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>O código de rastreio é enviado por e-mail e SMS quando sua encomenda é despachada.</p>
            <p className="text-xs">
              Ao clicar em "Rastrear", você será redirecionado para o site oficial da Loggi.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
