import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { ChevronRight, Factory, Sparkles, Store, Truck, Award, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sobre a Avance Modas — Fabricante de Moda Fitness Feminina</title>
        <meta name="description" content="Conheça a Avance Modas: fabricante própria de moda fitness feminina no atacado e varejo, com tecido tecnológico, UV 50+ e Aloe Vera." />
        <link rel="canonical" href="https://avancemodas.com.br/sobre" />
        <meta property="og:title" content="Sobre a Avance Modas — Fabricante de Moda Fitness Feminina" />
        <meta property="og:description" content="Fabricação própria, tecido tecnológico e atendimento direto: atacado e varejo de moda fitness feminina." />
        <meta property="og:url" content="https://avancemodas.com.br/sobre" />
        <meta name="twitter:title" content="Sobre a Avance Modas — Fabricante de Moda Fitness Feminina" />
        <meta name="twitter:description" content="Fabricação própria, tecido tecnológico e atendimento direto: atacado e varejo de moda fitness feminina." />
      </Helmet>
      <AnnouncementBar />
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container px-4 sm:px-6 py-2 sm:py-3">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Link to="/varejo" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-foreground font-medium">Sobre Nós</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">
              Quem Somos
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Sobre a Avance Modas — Fabricação Própria de Moda Fitness
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Somos fabricantes e vendedores diretos de moda fitness, atuando tanto no
              <strong className="text-foreground"> varejo </strong>
              quanto no
              <strong className="text-foreground"> atacado</strong>. Produzimos cada peça com o
              tecido mais tecnológico do mercado, garantindo conforto, durabilidade e performance
              para quem leva o estilo de vida ativo a sério.
            </p>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-16 sm:py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Factory className="w-7 h-7" />,
                title: "Fabricação Própria",
                description:
                  "Produzimos internamente todos os nossos produtos, com controle total de qualidade do tecido à costura final.",
              },
              {
                icon: <Sparkles className="w-7 h-7" />,
                title: "Tecido Tecnológico",
                description:
                  "Trabalhamos com o tecido mais tecnológico do mercado: respirável, com compressão inteligente e alta durabilidade.",
              },
              {
                icon: <Store className="w-7 h-7" />,
                title: "Varejo & Atacado",
                description:
                  "Atendemos consumidores finais e lojistas em todo o Brasil, com condições especiais para revendedores.",
              },
              {
                icon: <Award className="w-7 h-7" />,
                title: "Qualidade Premium",
                description:
                  "Cada peça passa por rigoroso controle de qualidade antes de chegar até você.",
              },
              {
                icon: <Truck className="w-7 h-7" />,
                title: "Envio para todo Brasil",
                description:
                  "Logística ágil e parceria com as melhores transportadoras para entregar rapidamente.",
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "Comunidade Avance",
                description:
                  "Milhares de clientes satisfeitas que confiam na nossa marca para treinar com estilo.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 bg-secondary/30">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              Nossa Missão
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Vestir mulheres reais com peças que unem
              <strong className="text-foreground"> tecnologia, conforto e estilo</strong>,
              transformando cada treino em uma experiência única.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Como fabricantes diretos, garantimos o melhor custo-benefício do mercado fitness, sem
              intermediários, com qualidade premium em cada peça.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Conheça nossos produtos
            </h2>
            <p className="text-muted-foreground mb-8">
              Explore nossa coleção completa e encontre as peças perfeitas para o seu treino.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/varejo"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm tracking-wider uppercase hover:bg-primary/90 transition-all"
              >
                Comprar no Varejo
              </Link>
              <Link
                to="/atacado"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary rounded-full font-semibold text-sm tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Comprar no Atacado
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
