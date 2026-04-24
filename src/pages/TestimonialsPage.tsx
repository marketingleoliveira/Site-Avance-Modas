import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { ChevronRight, Star, Quote, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  location: string | null;
  product_name: string | null;
  source: string | null;
  created_at: string;
}

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .eq("rating", 5)
        .order("created_at", { ascending: false })
        .limit(10);
      setTestimonials(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container px-4 sm:px-6 py-2 sm:py-3">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Link to="/varejo" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-foreground font-medium">Depoimentos</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container px-4 sm:px-6 text-center">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3 block">
            O que dizem sobre nós
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Depoimentos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Os 10 últimos depoimentos de nossas clientes na{" "}
            <a
              href="https://shopee.com.br/avance_modas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-medium hover:underline"
            >
              Shopee Avance Modas
            </a>
            .
          </p>
        </div>
      </section>

      {/* Testimonials List */}
      <section className="py-12 sm:py-16">
        <div className="container px-4 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              Nenhum depoimento disponível no momento.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {testimonials.map((t) => (
                <article
                  key={t.id}
                  className="relative bg-card border border-border rounded-xl p-6 sm:p-8 hover:shadow-lg hover:border-accent/50 transition-all"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20" />
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < t.rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4 italic">
                    "{t.comment}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {t.customer_name}
                      </p>
                      {t.location && (
                        <p className="text-xs text-muted-foreground">{t.location}</p>
                      )}
                    </div>
                    {t.source && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {t.source}
                      </span>
                    )}
                  </div>
                  {t.product_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Produto: <span className="text-foreground">{t.product_name}</span>
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestimonialsPage;
