import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
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

      <main className="flex-1 overflow-hidden">
        <section className="relative isolate">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative container mx-auto max-w-6xl px-4 pb-10 pt-10 sm:pb-12 sm:pt-14 md:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
                <CheckCircle className="h-4 w-4 text-primary" />
                Solicitação recebida com sucesso
              </div>

              <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg sm:h-24 sm:w-24">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Recebemos o seu pedido de atacado
              </h1>

              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base md:text-lg">
                Vamos analisar sua solicitação e entrar em contato pelos dados informados para oferecer
                um atendimento exclusivo e personalizado.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-border/60 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  O que acontece agora
                </div>

                <div className="mt-6 space-y-4 sm:space-y-5">
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

              <div className="space-y-4 sm:space-y-5">
                <div className="rounded-3xl border border-border/60 bg-card/95 p-5 shadow-lg sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Prazo de retorno</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Nossa equipe entrará em contato em até <strong className="text-foreground">48 horas úteis</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-secondary/40 p-4 text-sm leading-6 text-muted-foreground">
                    Você não precisa reenviar o pedido. Sua solicitação já está em análise.
                  </div>
                </div>

                <div className="rounded-3xl border border-border/60 bg-card/95 p-5 shadow-lg sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground">Atendimento exclusivo</h2>

                  <div className="mt-4 space-y-4">
                    {highlights.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.title} className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Button onClick={() => navigate("/atacado")} size="lg" className="h-12 w-full gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    Voltar para o atacado
                  </Button>
                  <Button
                    onClick={() => navigate("/contato")}
                    size="lg"
                    variant="outline"
                    className="h-12 w-full"
                  >
                    Falar com a equipe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WholesaleConfirmation;
