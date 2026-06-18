import { Helmet } from "react-helmet-async";

interface ProductSEOProps {
  title: string;
  description: string;
  handle: string;
  image?: string;
  price: string;
  currency: string;
  available: boolean;
  brand?: string;
}

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const ProductSEO = ({
  title,
  description,
  handle,
  image,
  price,
  currency,
  available,
  brand = "Avance Modas",
}: ProductSEOProps) => {
  const baseDesc = `${title} — Moda fitness feminina Avance Modas com tecido tecnológico, UV 50+ e Aloe Vera. Compre no varejo ou atacado.`;
  // Trim safely on word boundary to fit ~155 chars
  const trimToLimit = (s: string, max = 155) => {
    const clean = stripHtml(s);
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
  };
  const cleanDesc = trimToLimit(baseDesc);
  const pageTitle = `${title} | Avance Modas`;
  const url = `https://avancemodas.com.br/produto/${handle}`;
  const fallbackImage = "https://avancemodas.com.br/favicon-512.png?v=5";
  const ogImage = image || fallbackImage;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: title,
    description: cleanDesc,
    image: image ? [image] : undefined,
    sku: handle,
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: brand },
    },
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={cleanDesc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="product" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={cleanDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="product:price:amount" content={price} />
      <meta property="product:price:currency" content={currency} />
      <meta property="product:availability" content={available ? "in stock" : "out of stock"} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={cleanDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default ProductSEO;