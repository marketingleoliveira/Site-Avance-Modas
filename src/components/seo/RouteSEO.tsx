import { Helmet } from "react-helmet-async";

const SITE = "https://avancemodas.com.br";
const FALLBACK_IMAGE = `${SITE}/favicon-512.png?v=6`;

interface RouteSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  breadcrumbs?: Array<{ name: string; path: string }>;
}

const trim = (s: string, max = 155) => {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
};

/**
 * Shared per-route head: title, description, canonical, og/twitter,
 * optional noindex and BreadcrumbList JSON-LD. Keep layout untouched.
 */
const RouteSEO = ({
  title,
  description,
  path,
  image,
  noindex = false,
  type = "website",
  breadcrumbs,
}: RouteSEOProps) => {
  const url = `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
  const desc = trim(description);
  const img = image || FALLBACK_IMAGE;

  const breadcrumbLd = breadcrumbs && breadcrumbs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: `${SITE}${b.path.startsWith("/") ? b.path : `/${b.path}`}`,
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {breadcrumbLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      )}
    </Helmet>
  );
};

export default RouteSEO;