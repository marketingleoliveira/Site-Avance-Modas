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

  // Infer category from title keywords (Brazilian PT-BR)
  const t = title.toLowerCase();
  const category =
    /legging/.test(t) ? "Leggings Fitness" :
    /\btop\b|cropped|nadador/.test(t) ? "Tops Fitness" :
    /short/.test(t) ? "Shorts Fitness" :
    /bermuda/.test(t) ? "Bermudas Fitness" :
    /conjunto/.test(t) ? "Conjuntos Fitness" :
    /blusa|camiseta|baby look|tapa bumbum/.test(t) ? "Blusas Fitness" :
    "Moda Fitness Feminina";

  const productLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: title,
    description: cleanDesc,
    image: image ? [image] : undefined,
    sku: handle,
    mpn: handle,
    category,
    material: "Poliamida",
    audience: { "@type": "PeopleAudience", suggestedGender: "female" },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Proteção UV", value: "UV 50+" },
      { "@type": "PropertyValue", name: "Tecnologia", value: "Aloe Vera" },
      { "@type": "PropertyValue", name: "Composição", value: "Poliamida com elastano" },
      { "@type": "PropertyValue", name: "Origem", value: "Fabricação própria no Brasil" },
    ],
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
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "BR" },
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "BRL" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 10, unitCode: "DAY" },
        },
      },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: "https://avancemodas.com.br/" },
      { "@type": "ListItem", position: 2, name: category, item: "https://avancemodas.com.br/varejo" },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Qual o tecido de ${title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "É confeccionado em poliamida com elastano, tecido fitness de alta tecnologia com proteção UV 50+, ação hidratante Aloe Vera, alta compressão e respirabilidade.",
        },
      },
      {
        "@type": "Question",
        name: "A peça é transparente?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Todas as peças passam por teste de transparência. A poliamida grossa Avance Modas oferece cobertura total mesmo em movimento.",
        },
      },
      {
        "@type": "Question",
        name: "Como lavar a peça?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lavar à mão ou máquina em ciclo delicado com água fria, sem alvejante, secar à sombra. Não usar amaciante para preservar a elasticidade e a tecnologia do tecido.",
        },
      },
      {
        "@type": "Question",
        name: "Qual a política de troca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Trocas em até 7 dias após o recebimento, conforme o Código de Defesa do Consumidor. Para atacado, trocas apenas em caso de defeito.",
        },
      },
      {
        "@type": "Question",
        name: "Vocês entregam em todo o Brasil?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. Enviamos para todo o território nacional via Loggi e Correios, com rastreio.",
        },
      },
    ],
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

      <script type="application/ld+json">{JSON.stringify(productLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
    </Helmet>
  );
};

export default ProductSEO;