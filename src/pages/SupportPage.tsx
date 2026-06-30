import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HeadphonesIcon, MessageSquare, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import RouteSEO from "@/components/seo/RouteSEO";
import { toast } from "sonner";
import { z } from "zod";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2, CheckCircle } from "lucide-react";

const ticketSchema = z.object({
  customer_name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  customer_email: z.string().trim().email("E-mail inválido").max(255),
  customer_whatsapp: z.string().optional(),
  issue_type: z.string().min(1, "Selecione o tipo de problema"),
  description: z.string().trim().min(10, "Descreva seu problema com mais detalhes").max(1000),
});

const issueTypes = [
  { value: "compra", label: "Dificuldade na compra" },
  { value: "pagamento", label: "Problema com pagamento" },
  { value: "tamanho", label: "Dúvida sobre tamanho" },
  { value: "produto", label: "Dúvida sobre produto" },
  { value: "estoque", label: "Disponibilidade de estoque" },
  { value: "outro", label: "Outro" },
];

const SupportPage = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_whatsapp: "",
    issue_type: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = ticketSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await supabase.from("support_tickets").insert({
        customer_name: result.data.customer_name,
        customer_email: result.data.customer_email,
        customer_whatsapp: result.data.customer_whatsapp || null,
        issue_type: result.data.issue_type,
        description: result.data.description,
        session_id: sessionId,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Solicitação enviada! Nossa equipe entrará em contato em breve.");
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RouteSEO
        title="Suporte ao Cliente | Avance Modas"
        description="Fale com o suporte da Avance Modas. Tire dúvidas sobre pedidos de moda fitness varejo e atacado por chat, e-mail ou WhatsApp."
        path="/suporte"
        noindex
      />
      <AnnouncementBar />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <HeadphonesIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Suporte em Tempo Real
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Precisa de ajuda? Nossa equipe está pronta para te atender. Envie sua solicitação e
              responderemos o mais rápido possível.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-card border rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Solicitação Enviada!</h2>
              <p className="text-muted-foreground mb-6">
                Recebemos sua solicitação de suporte e nossa equipe já foi notificada. Entraremos em
                contato pelo e-mail ou WhatsApp informado em breve.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/">Voltar ao Início</Link>
                </Button>
                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      customer_name: "",
                      customer_email: "",
                      customer_whatsapp: "",
                      issue_type: "",
                      description: "",
                    });
                  }}
                >
                  Enviar Nova Solicitação
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Form */}
              <div className="md:col-span-2 bg-card border rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Abrir Solicitação
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Seu nome *"
                        value={formData.customer_name}
                        onChange={(e) => handleChange("customer_name", e.target.value)}
                        disabled={isLoading}
                        className={errors.customer_name ? "border-destructive" : ""}
                      />
                      {errors.customer_name && (
                        <p className="text-xs text-destructive mt-1">{errors.customer_name}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Seu e-mail *"
                        value={formData.customer_email}
                        onChange={(e) => handleChange("customer_email", e.target.value)}
                        disabled={isLoading}
                        className={errors.customer_email ? "border-destructive" : ""}
                      />
                      {errors.customer_email && (
                        <p className="text-xs text-destructive mt-1">{errors.customer_email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="WhatsApp (opcional)"
                        value={formData.customer_whatsapp}
                        onChange={(e) => handleChange("customer_whatsapp", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Select
                        value={formData.issue_type}
                        onValueChange={(value) => handleChange("issue_type", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={errors.issue_type ? "border-destructive" : ""}>
                          <SelectValue placeholder="Tipo de problema *" />
                        </SelectTrigger>
                        <SelectContent>
                          {issueTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.issue_type && (
                        <p className="text-xs text-destructive mt-1">{errors.issue_type}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Textarea
                      placeholder="Descreva seu problema ou dúvida *"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      disabled={isLoading}
                      className={`min-h-[150px] ${errors.description ? "border-destructive" : ""}`}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive mt-1">{errors.description}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <HeadphonesIcon className="w-4 h-4 mr-2" />
                        Enviar Solicitação
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Atendimento Rápido</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nossa equipe responde solicitações em tempo real durante o horário comercial.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Tempo médio de resposta: 15 min</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>Seg - Sex: 9h às 18h</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>contato@avancemodas.com.br</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border rounded-2xl p-6">
                  <h3 className="font-semibold mb-3">Outras opções</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/sac">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        SAC - Atendimento
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/contato">
                        <Phone className="w-4 h-4 mr-2" />
                        Fale Conosco
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupportPage;
