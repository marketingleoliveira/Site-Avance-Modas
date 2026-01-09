import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <section id="contato" className="py-20 gradient-hero">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Fique Por Dentro
          </h2>
          <p className="text-muted-foreground mb-8">
            Cadastre-se para receber novidades, promoções exclusivas e 10% OFF na primeira compra.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-card border-border"
              required
            />
            <Button type="submit" variant="hero" size="lg">
              Cadastrar
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            Ao se cadastrar, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
