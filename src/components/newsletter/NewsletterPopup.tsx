import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatWhatsapp = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

interface NewsletterPopupProps {
  delayMs?: number;
}

const NewsletterPopup = ({ delayMs = 5000 }: NewsletterPopupProps) => {
  const [open, setOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user has already seen/dismissed the popup or subscribed
    const hasSeenPopup = localStorage.getItem("newsletter_popup_seen");
    const hasSubscribed = localStorage.getItem("newsletter_subscribed");
    
    if (hasSeenPopup || hasSubscribed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("newsletter_popup_seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      setError("Informe um WhatsApp válido com DDD");
      return;
    }

    setIsLoading(true);

    try {
      const { error: dbError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          whatsapp: digits,
          source: "popup_varejo"
        });

      if (dbError) {
        if (dbError.code === "23505") {
          toast.info("Você já está inscrito!", {
            description: "Este WhatsApp já está cadastrado na nossa lista.",
          });
          localStorage.setItem("newsletter_subscribed", "true");
          setOpen(false);
        } else {
          throw dbError;
        }
      } else {
        toast.success("Inscrição realizada!", {
          description: "Você receberá nossos lançamentos em primeira mão.",
        });
        localStorage.setItem("newsletter_subscribed", "true");
        setOpen(false);
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      toast.error("Erro ao cadastrar", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/15 rounded-full blur-2xl" />
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-primary-foreground" />
          </button>

          <div className="relative p-6 sm:p-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
                Receba Lançamentos em Primeira Mão!
              </h2>
              <p className="text-primary-foreground/80 text-sm sm:text-base">
                Cadastre-se e seja a primeira a saber sobre novidades e promoções exclusivas.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Seu WhatsApp com DDD"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(formatWhatsapp(e.target.value));
                    setError("");
                  }}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent focus:ring-accent h-12"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-accent text-xs mt-1.5">{error}</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
              >
                {isLoading ? "Cadastrando..." : "Quero Receber Novidades"}
              </Button>
            </form>

            {/* Privacy note */}
            <p className="text-primary-foreground/60 text-xs text-center mt-4">
              Prometemos não enviar spam. Você pode cancelar a qualquer momento.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
