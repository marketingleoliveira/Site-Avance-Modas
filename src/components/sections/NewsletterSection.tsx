import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ 
          email: email.toLowerCase().trim(),
          source: 'website'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Este e-mail já está cadastrado!");
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success("Cadastro realizado com sucesso! 🎉");
      }
      
      setEmail("");
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contato" className="py-16 bg-secondary">
      <div className="container">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Receba 10% OFF na primeira compra
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Cadastre-se para novidades e promoções exclusivas.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-4 rounded-lg">
              <Check className="w-5 h-5" />
              <span className="font-medium">Obrigado! Você receberá nossas novidades.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-11 bg-background border-border text-sm"
                required
                disabled={loading}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-11 px-6 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </form>
          )}

          <p className="text-[10px] text-muted-foreground mt-3">
            Ao se cadastrar, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
