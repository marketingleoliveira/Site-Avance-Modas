import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RouteSEO from "@/components/seo/RouteSEO";
import { supabase } from "@/integrations/supabase/client";

interface GuideRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number;
}

const GuidesHub = () => {
  const [guides, setGuides] = useState<GuideRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("guides")
        .select("slug,title,excerpt,category,reading_minutes")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setGuides((data as GuideRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guias Avance Modas",
    url: "https://avancemodas.com.br/guias",
    hasPart: guides.map((g) => ({
      "@type": "Article",
      headline: g.title,
      url: `https://avancemodas.com.br/guias/${g.slug}`,
      description: g.excerpt,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <RouteSEO
        title="Guias de Moda Fitness | Avance Modas"
        description="Guias práticos sobre moda fitness, poliamida, leggings, tops, lavagem e revenda atacado. Conteúdo escrito por especialistas da Avance Modas."
        path="/guias"
        breadcrumbs={[
          { name: "Início", path: "/" },
          { name: "Guias", path: "/guias" },
        ]}
      />
      <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <header className="max-w-3xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Guias Avance Modas</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Conteúdo prático sobre moda fitness feminina: tecidos, leggings, cuidados, revenda no atacado e modalidades.
          </p>
        </header>

        {loading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <li key={g.slug} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {g.category} · {g.reading_minutes} min
                </p>
                <h2 className="text-lg font-semibold mb-2 leading-snug">
                  <Link to={`/guias/${g.slug}`} className="hover:underline">
                    {g.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">{g.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuidesHub;