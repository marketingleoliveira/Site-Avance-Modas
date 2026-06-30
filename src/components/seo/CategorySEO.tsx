import { Helmet } from "react-helmet-async";

interface CategorySEOProps {
  category: string;
  title: string;
  description: string;
  image?: string;
  productCount?: number;
  items?: Array<{ handle: string; title: string; image?: string }>;
}

const SITE = "https://avancemodas.com.br";
const FALLBACK_IMAGE = `${SITE}/favicon-512.png?v=5`;

const trimToLimit = (s: string, max = 155) => {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
};

const CategorySEO = ({ category, title, description, image, productCount, items }: CategorySEOProps) => {
  const pageTitle = `${title} | Avance Modas`;
  const baseDesc = `${title} – ${description} Moda fitness feminina com tecido tecnológico, UV 50+ e Aloe Vera. Compre no varejo ou atacado.`;
  const cleanDesc = trimToLimit(baseDesc);
  const url = `${SITE}/categoria/${category}`;
  const ogImage = image || FALLBACK_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${title} | Avance Modas`,
    description: cleanDesc,
    url,
    image: ogImage,
    isPartOf: { "@type": "WebSite", name: "Avance Modas", url: SITE },
    about: { "@type": "Thing", name: title },
    ...(productCount !== undefined && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: productCount,
        name: title,
        itemListElement: (items || []).slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/produto/${p.handle}`,
          name: p.title,
          image: p.image,
        })),
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ],
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={cleanDesc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={cleanDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${title} - Avance Modas`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={cleanDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${title} - Avance Modas`} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
    </Helmet>
  );
};

export default CategorySEO;