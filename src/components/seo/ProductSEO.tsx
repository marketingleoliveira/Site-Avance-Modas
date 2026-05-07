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
  const cleanDesc = `Moda Fitness Varejo e Atacado | Avance Modas — ${title}. Tecido tecnológico, proteção UV 50+ e Aloe Vera. Compre no varejo ou atacado.`.slice(0, 160);
  const pageTitle = "Moda Fitness Varejo e Atacado | Avance Modas";
  const url = `https://avancemodas.lovable.app/produto/${handle}`;

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
      {image && <meta property="og:image" content={image} />}
      <meta property="product:price:amount" content={price} />
      <meta property="product:price:currency" content={currency} />
      <meta property="product:availability" content={available ? "in stock" : "out of stock"} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={cleanDesc} />
      {image && <meta name="twitter:image" content={image} />}

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default ProductSEO;