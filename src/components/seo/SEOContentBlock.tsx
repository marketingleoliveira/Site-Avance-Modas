import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import type { SeoBlock } from "@/content/seoContent";

interface Props {
  block: SeoBlock;
  h1?: string; // when omitted, the parent page already renders the H1
  emitFaqSchema?: boolean;
}

/**
 * SEO copy block rendered below product grids. Uses semantic tokens
 * (text-foreground, text-muted-foreground, container) so it inherits
 * the site's existing typography and colors — no visual redesign.
 */
const SEOContentBlock = ({ block, h1, emitFaqSchema = true }: Props) => {
  const faqLd = emitFaqSchema && block.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: block.faq.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  } : null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-background border-t border-border">
      <div className="container px-4 sm:px-6 max-w-4xl mx-auto">
        {h1 && (
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            {h1}
          </h1>
        )}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
          {block.intro}
        </p>

        {block.bullets && block.bullets.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2 mb-8 text-sm text-foreground">
            {block.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent shrink-0">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {block.sections.map((s, i) => (
          <div key={i} className="mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
              {s.h2}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {s.body}
            </p>
          </div>
        ))}

        {block.faq.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              Perguntas frequentes
            </h2>
            <div className="space-y-4">
              {block.faq.map((f, i) => (
                <details key={i} className="group border border-border rounded-lg p-4 bg-card">
                  <summary className="cursor-pointer font-semibold text-foreground text-sm sm:text-base list-none flex items-start justify-between gap-2">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">＋</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {block.internalLinks && block.internalLinks.length > 0 && (
          <nav className="mt-10 pt-6 border-t border-border" aria-label="Links relacionados">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Continue explorando
            </p>
            <ul className="flex flex-wrap gap-2">
              {block.internalLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    to={l.href}
                    className="inline-block px-3 py-1.5 text-xs sm:text-sm text-foreground border border-border rounded-full hover:bg-secondary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {faqLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        </Helmet>
      )}
    </section>
  );
};

export default SEOContentBlock;
