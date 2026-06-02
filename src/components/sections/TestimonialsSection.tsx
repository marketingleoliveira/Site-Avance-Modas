import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  location: string | null;
  product_name: string | null;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, customer_name, rating, comment, location, product_name")
        .eq("is_active", true)
        .eq("rating", 5)
        .order("display_order", { ascending: true })
        .limit(8);

      if (!error && data) setTestimonials(data);
      setLoading(false);
    };
    load();
  }, []);

  if (!loading && testimonials.length === 0) return null;

  // Duplicate items to create a seamless infinite loop
  const loopItems = testimonials.length > 0 ? [...testimonials, ...testimonials] : [];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-secondary/30 border-t border-border">
      <div className="px-0">
        <div className="text-center mb-8 sm:mb-12 container px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            O Que Nossas Clientes Dizem
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Avaliações reais de quem já comprou e aprovou a Avance Modas
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 container px-4 sm:px-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="testimonials-marquee group/marquee relative overflow-hidden">
            {/* Edge fade - left only */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-secondary/80 to-transparent z-10" />

            <div className="testimonials-track flex gap-4 sm:gap-6 w-max py-6">
              {loopItems.map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="testimonial-card relative bg-card border border-border rounded-lg p-5 shadow-sm flex flex-col w-[280px] sm:w-[320px] flex-shrink-0 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-accent hover:z-20"
                >
                  <Quote className="absolute top-3 right-3 w-6 h-6 text-accent/20" />

                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
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

                  <p className="text-sm text-foreground/90 leading-relaxed mb-4 flex-1 line-clamp-5">
                    "{t.comment}"
                  </p>

                  <div className="border-t border-border pt-3 mt-auto">
                    <p className="font-semibold text-sm text-foreground">
                      {t.customer_name}
                    </p>
                    {t.location && (
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    )}
                    {t.product_name && (
                      <p className="text-xs text-accent mt-1 font-medium">
                        {t.product_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;