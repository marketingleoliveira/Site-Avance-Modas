import shortsImg from "@/assets/product-shorts.jpg";
import leggingImg from "@/assets/product-legging.jpg";
import topImg from "@/assets/product-top.jpg";
import conjuntoImg from "@/assets/product-conjunto.jpg";

const categories = [
  { name: "Shorts", image: shortsImg, count: 24 },
  { name: "Leggings", image: leggingImg, count: 18 },
  { name: "Tops", image: topImg, count: 32 },
  { name: "Conjuntos", image: conjuntoImg, count: 15 },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Categorias
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore nossa variedade de produtos fitness desenvolvidos para todos os estilos de treino.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <a 
              key={category.name}
              href={`/${category.name.toLowerCase()}`}
              className="group relative overflow-hidden bg-card rounded-lg hover-lift"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold text-primary-foreground mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  {category.count} produtos
                </p>
              </div>
              {/* Default Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-card group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-lg font-bold text-foreground text-center">
                  {category.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
