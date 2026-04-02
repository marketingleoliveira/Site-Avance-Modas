import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/stores/cartStore";

const steps = [
  {
    icon: Package,
    label: "Passo 1",
    title: "Análise da solicitação",
    description:
      "Vamos revisar os itens do seu pedido, disponibilidade e condições comerciais para montar o melhor atendimento para você.",
  },
  {
    icon: MessageCircle,
    label: "Passo 2",
    title: "Contato personalizado",
    description:
      "Nossa equipe entrará em contato pelo WhatsApp ou e-mail informados para dar continuidade ao seu atendimento exclusivo.",
  },
  {
    icon: ShieldCheck,
    label: "Passo 3",
    title: "Fechamento do pedido",
    description:
      "Depois do alinhamento, seguimos com a finalização do pedido atacado de forma segura, clara e personalizada.",
  },
];

const highlights = [
  {
    icon: Clock,
    title: "Retorno em até 48h úteis",
    description: "Você não precisa reenviar a solicitação. Agora é com a nossa equipe.",
  },
  {
    icon: Mail,
    title: "Atualização pelos seus contatos",
    description: "Usaremos os dados preenchidos no formulário para falar com você.",
  },
];

const WholesaleConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clearCart = useCartStore((state) => state.clearCart);
  const fromWholesaleSubmission = Boolean(
    (location.state as { fromWholesaleSubmission?: boolean } | null)?.fromWholesaleSubmission,
  );

  useEffect(() => {
    if (fromWholesaleSubmission) {
      clearCart();
    }
  }, [clearCart, fromWholesaleSubmission]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Recebemos o seu pedido de atacado
            </h1>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/95 p-5 shadow-xl sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              O que acontece agora
            </div>

            <div className="mt-6 space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-2xl border border-border/50 bg-secondary/30 p-4 sm:p-5"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                        {step.label}
                      </div>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={() => navigate("/atacado")} size="lg" className="h-12 w-full gap-2">
            <ArrowLeft className="h-5 w-5" />
            Voltar para o atacado
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WholesaleConfirmation;
