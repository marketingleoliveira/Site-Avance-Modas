import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setEmail("");
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

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-11 bg-background border-border text-sm"
              required
            />
            <Button type="submit" size="lg" className="h-11 px-6 font-semibold">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-[10px] text-muted-foreground mt-3">
            Ao se cadastrar, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
