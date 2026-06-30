import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RouteSEO from "@/components/seo/RouteSEO";
import { supabase } from "@/integrations/supabase/client";

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  hero_image: string | null;
  category: string;
  tags: string[];
  reading_minutes: number;
  faq: Array<{ q: string; a: string }>;
  related_slugs: string[];
  published_at: string | null;
  updated_at: string;
}

// Minimal, safe markdown → HTML for our seeded content (headings, lists, tables, bold, paragraphs).
function mdToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^##\s+/.test(line)) {
      out.push(`<h2>${esc(line.replace(/^##\s+/, ""))}</h2>`);
      i++;
    } else if (/^###\s+/.test(line)) {
      out.push(`<h3>${esc(line.replace(/^###\s+/, ""))}</h3>`);
      i++;
    } else if (/^\|/.test(line)) {
      const table: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        table.push(lines[i]);
        i++;
      }
      const rows = table
        .filter((r) => !/^\|\s*[-:| ]+\|/.test(r))
        .map((r) =>
          r
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim()),
        );
      if (rows.length) {
        const [head, ...body] = rows;
        out.push(
          `<table><thead><tr>${head
            .map((c) => `<th>${esc(c)}</th>`)
            .join("")}</tr></thead><tbody>${body
            .map(
              (r) =>
                `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`,
            )
            .join("")}</tbody></table>`,
        );
      }
    } else if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      out.push(`<ul>${items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>`);
    } else if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      out.push(`<ol>${items.map((it) => `<li>${esc(it)}</li>`).join("")}</ol>`);
    } else if (line.trim() === "") {
      i++;
    } else {
      const inline = esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      out.push(`<p>${inline}</p>`);
      i++;
    }
  }
  return out.join("\n");
}

const GuideDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setGuide(data as unknown as Guide);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <p className="text-muted-foreground">Carregando…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen flex flex-col">
        <RouteSEO
          title="Guia não encontrado | Avance Modas"
          description="Este guia não está disponível."
          path={`/guias/${slug}`}
          noindex
        />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <h1 className="text-2xl font-bold mb-4">Guia não encontrado</h1>
          <Link to="/guias" className="underline">Voltar para o hub de guias</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const url = `https://avancemodas.com.br/guias/${guide.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    inLanguage: "pt-BR",
    mainEntityOfPage: url,
    datePublished: guide.published_at ?? guide.updated_at,
    dateModified: guide.updated_at,
    image: guide.hero_image || "https://avancemodas.com.br/favicon-512.png?v=6",
    author: { "@type": "Organization", name: "Avance Modas", url: "https://avancemodas.com.br/" },
    publisher: {
      "@type": "Organization",
      name: "Avance Modas",
      logo: { "@type": "ImageObject", url: "https://avancemodas.com.br/favicon-512.png?v=6" },
    },
    keywords: guide.tags?.join(", "),
  };
  const faqLd = guide.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;
  const speakableLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".guide-summary"],
    },
  };

  const html = mdToHtml(guide.body_md);

  return (
    <div className="min-h-screen flex flex-col">
      <RouteSEO
        title={`${guide.title} | Avance Modas`}
        description={guide.excerpt}
        path={`/guias/${guide.slug}`}
        type="article"
        breadcrumbs={[
          { name: "Início", path: "/" },
          { name: "Guias", path: "/guias" },
          { name: guide.title, path: `/guias/${guide.slug}` },
        ]}
      />
      <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
      {faqLd && (
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      )}
      <script type="application/ld+json">{JSON.stringify(speakableLd)}</script>

      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:underline">Início</Link>
          {" / "}
          <Link to="/guias" className="hover:underline">Guias</Link>
          {" / "}
          <span>{guide.title}</span>
        </nav>

        <article>
          <header className="mb-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {guide.category} · {guide.reading_minutes} min de leitura
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{guide.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground guide-summary">
              {guide.excerpt}
            </p>
          </header>

          <div
            className="prose prose-neutral max-w-none prose-headings:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-table:text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {guide.faq?.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Perguntas frequentes</h2>
              <div className="space-y-4">
                {guide.faq.map((f, idx) => (
                  <details key={idx} className="border rounded-md p-4">
                    <summary className="font-medium cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {guide.related_slugs?.length > 0 && (
            <aside className="mt-12 border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Leia também</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {guide.related_slugs.map((s) => (
                  <li key={s}>
                    <Link to={`/guias/${s}`} className="underline">
                      {s.replace(/-/g, " ")}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default GuideDetail;