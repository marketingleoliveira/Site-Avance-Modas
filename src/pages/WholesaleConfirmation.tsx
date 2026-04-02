import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, MessageCircle, Mail, Phone, Sparkles, ShieldCheck, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const WholesaleConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary-foreground/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary-foreground/5" />

          <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center">
            {/* Animated check icon */}
            <div className="relative mx-auto w-28 h-28 mb-8">
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-14 h-14 text-accent-foreground" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 font-['Playfair_Display']">
              Solicitação Enviada!
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Sua solicitação de pedido atacado foi recebida com sucesso. 
              Agora é com a gente!
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="container mx-auto px-4 -mt-8 relative z-20 max-w-4xl">
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
            <div className="p-6 md:p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  O que acontece agora?
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground font-['Playfair_Display']">
                  Próximos Passos
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {/* Step 1 */}
                <div className="relative group">
                  <div className="bg-secondary/50 rounded-xl p-6 h-full border border-border/30 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">PASSO 1</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Análise do Pedido</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Nossa equipe irá analisar todos os itens da sua solicitação, verificando disponibilidade e condições especiais para o seu pedido.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative group">
                  <div className="bg-secondary/50 rounded-xl p-6 h-full border border-border/30 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">PASSO 2</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Contato Personalizado</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Entraremos em contato pelos dados informados — WhatsApp ou e-mail — para oferecer um atendimento exclusivo e personalizado.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative group">
                  <div className="bg-secondary/50 rounded-xl p-6 h-full border border-border/30 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">PASSO 3</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Fechamento do Pedido</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Após alinhamento de detalhes, finalizaremos seu pedido com condições exclusivas de atacado, garantindo o melhor custo-benefício.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline bar */}
            <div className="bg-primary/5 border-t border-border/30 px-6 md:px-10 py-6">
              <div className="flex items-center justify-center gap-3 text-center">
                <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Prazo de retorno: até <strong className="text-foreground">48 horas úteis</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Star className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Atendimento VIP</h4>
                <p className="text-xs text-muted-foreground mt-1">Cada cliente atacado recebe atenção exclusiva da nossa equipe</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Phone className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Suporte Dedicado</h4>
                <p className="text-xs text-muted-foreground mt-1">Acompanhamento direto via WhatsApp do início ao fim</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Mail className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Confirmação por E-mail</h4>
                <p className="text-xs text-muted-foreground mt-1">Você receberá todos os detalhes e atualizações por e-mail</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button onClick={() => navigate("/atacado")} size="lg" className="gap-2 px-8 h-12 text-base font-semibold">
              <ArrowLeft className="w-5 h-5" />
              Continuar Comprando
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Enquanto isso, explore mais produtos e monte novos pedidos!
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WholesaleConfirmation;
