import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatWhatsapp = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const NewsletterSection = () => {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      toast.error("Por favor, insira um WhatsApp válido com DDD");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          whatsapp: digits,
          source: 'website'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Este WhatsApp já está cadastrado!");
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success("Cadastro realizado com sucesso! 🎉");
      }

      setWhatsapp("");
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contato" className="py-10 sm:py-12 lg:py-16 bg-secondary">
      <div className="container px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
            Receba lançamentos em primeira mão
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Cadastre-se para novidades e promoções exclusivas.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 sm:py-4 rounded-lg text-sm">
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Obrigado! Você receberá nossas novidades.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-2 max-w-md mx-auto">
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="Seu WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                className="flex-1 h-10 sm:h-11 bg-background border-border text-sm"
                required
                disabled={loading}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-10 sm:h-11 px-6 font-semibold w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="sm:hidden">Cadastrar</span>
                    <ArrowRight className="w-4 h-4 hidden sm:block" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-[10px] text-muted-foreground mt-2 sm:mt-3">
            Ao se cadastrar, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
