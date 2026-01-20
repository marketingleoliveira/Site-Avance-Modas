import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Copy,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackingItem {
  status: string;
  trackingNumber: string;
  trackingUrl: string | null;
  trackingCompany: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderData {
  number: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: string;
  currency: string;
  customerEmail: string | null;
}

interface TrackingResponse {
  found: boolean;
  message?: string;
  order?: OrderData;
  tracking?: TrackingItem[];
  hasTracking?: boolean;
  error?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: string, currency: string) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format(parseFloat(price));
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pendente", variant: "secondary" },
    authorized: { label: "Autorizado", variant: "default" },
    paid: { label: "Pago", variant: "default" },
    partially_paid: { label: "Parcialmente Pago", variant: "secondary" },
    refunded: { label: "Reembolsado", variant: "destructive" },
    voided: { label: "Cancelado", variant: "destructive" },
  };
  
  const config = statusMap[status] || { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getFulfillmentBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    fulfilled: { label: "Enviado", variant: "default", icon: <Truck className="w-3 h-3" /> },
    partial: { label: "Parcialmente Enviado", variant: "secondary", icon: <Package className="w-3 h-3" /> },
    unfulfilled: { label: "Aguardando Envio", variant: "outline", icon: <Clock className="w-3 h-3" /> },
  };
  
  const config = statusMap[status] || { label: "Em processamento", variant: "outline" as const, icon: <Clock className="w-3 h-3" /> };
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};

// Check if tracking code is from Loggi
const isLoggiTracking = (trackingNumber: string, trackingCompany: string | null): boolean => {
  const companyLower = (trackingCompany || "").toLowerCase();
  // Check if company name contains loggi
  if (companyLower.includes("loggi")) return true;
  // Loggi tracking codes typically start with specific patterns
  const loggiPatterns = [/^LGI/i, /^LOGGI/i, /^\d{10,}$/];
  return loggiPatterns.some(pattern => pattern.test(trackingNumber));
};

// Build Loggi tracking URL
const getLoggiTrackingUrl = (trackingNumber: string): string => {
  return `https://www.loggi.com/rastreio/${trackingNumber}/`;
};

export default function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loggiCode, setLoggiCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [activeTab, setActiveTab] = useState("pedido");
  const [showLoggiEmbed, setShowLoggiEmbed] = useState(false);
  const [loggiTrackingCode, setLoggiTrackingCode] = useState("");

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast.error("Digite o número do pedido");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setShowLoggiEmbed(false);

    try {
      const { data, error } = await supabase.functions.invoke("get-order-tracking", {
        body: { orderNumber: orderNumber.trim() },
      });

      if (error) {
        console.error("Error fetching tracking:", error);
        toast.error("Erro ao buscar pedido");
        return;
      }

      setResult(data);

      // Check if any tracking is from Loggi and auto-show embed
      if (data.found && data.tracking && data.tracking.length > 0) {
        const loggiTrack = data.tracking.find((t: TrackingItem) => 
          isLoggiTracking(t.trackingNumber, t.trackingCompany)
        );
        if (loggiTrack) {
          setLoggiTrackingCode(loggiTrack.trackingNumber);
          setShowLoggiEmbed(true);
        }
      }

      if (!data.found) {
        toast.error(data.message || "Pedido não encontrado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoggiDirectSearch = () => {
    if (!loggiCode.trim()) {
      toast.error("Digite o código de rastreio da Loggi");
      return;
    }
    setLoggiTrackingCode(loggiCode.trim());
    setShowLoggiEmbed(true);
    setResult(null);
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
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rastrear Pedido</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Acompanhe sua entrega em tempo real
            </p>
          </div>

          {/* Search Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pedido" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Número do</span> Pedido
              </TabsTrigger>
              <TabsTrigger value="loggi" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Rastreio Loggi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pedido" className="mt-4">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    Buscar por Número do Pedido
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    O número do pedido está no e-mail de confirmação (ex: #1001)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Digite o número (ex: 1001)"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loggi" className="mt-4">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                    Rastrear Diretamente na Loggi
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
                      onKeyDown={(e) => e.key === "Enter" && handleLoggiDirectSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleLoggiDirectSearch} className="w-full sm:w-auto">
                      <Search className="w-4 h-4 mr-2" />
                      Rastrear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Loggi Embed */}
          {showLoggiEmbed && loggiTrackingCode && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Rastreio Loggi
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

          {/* Order Results */}
          {result && (
            <>
              {!result.found ? (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-5 h-5" />
                      <p>{result.message || "Pedido não encontrado"}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : result.order && (
                <div className="space-y-4">
                  {/* Order Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Pedido {result.order.number}
                        </CardTitle>
                        {getFulfillmentBadge(result.order.fulfillmentStatus)}
                      </div>
                      <CardDescription>
                        Realizado em {formatDate(result.order.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor Total</p>
                          <p className="font-semibold">
                            {formatPrice(result.order.totalPrice, result.order.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pagamento</p>
                          <div className="mt-1">{getStatusBadge(result.order.financialStatus)}</div>
                        </div>
                      </div>
                      
                      {result.order.customerEmail && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">E-mail</p>
                          <p>{result.order.customerEmail}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tracking Info Card - Only show if NOT Loggi (since Loggi embed is shown above) */}
                  {result.hasTracking && result.tracking && result.tracking.length > 0 && !showLoggiEmbed && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          Informações de Rastreio
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {result.tracking.map((track, index) => (
                            <div key={index} className="space-y-3">
                              {index > 0 && <Separator />}
                              
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="font-medium">
                                  {track.trackingCompany || "Transportadora"}
                                </span>
                              </div>

                              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Código de Rastreio</p>
                                  <div className="flex items-center gap-2">
                                    <code className="bg-background px-3 py-2 rounded border text-sm font-mono flex-1">
                                      {track.trackingNumber}
                                    </code>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => copyToClipboard(track.trackingNumber)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Check if it's Loggi and show special button */}
                                {isLoggiTracking(track.trackingNumber, track.trackingCompany) ? (
                                  <Button
                                    variant="default"
                                    className="w-full"
                                    onClick={() => {
                                      setLoggiTrackingCode(track.trackingNumber);
                                      setShowLoggiEmbed(true);
                                    }}
                                  >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Ver Rastreio Loggi
                                  </Button>
                                ) : track.trackingUrl && (
                                  <Button
                                    variant="default"
                                    className="w-full"
                                    onClick={() => window.open(track.trackingUrl!, "_blank")}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Rastrear no Site da Transportadora
                                  </Button>
                                )}

                                <p className="text-xs text-muted-foreground">
                                  Atualizado em {formatDate(track.updatedAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* No tracking yet */}
                  {!result.hasTracking && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          Informações de Rastreio
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 space-y-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                            <Clock className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Aguardando envio</p>
                            <p className="text-sm text-muted-foreground">
                              O código de rastreio será disponibilizado assim que seu pedido for despachado.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
