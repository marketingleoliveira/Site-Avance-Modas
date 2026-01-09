import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import shortsImg from "@/assets/product-shorts.jpg";
import leggingImg from "@/assets/product-legging.jpg";
import topImg from "@/assets/product-top.jpg";
import conjuntoImg from "@/assets/product-conjunto.jpg";

const products = [
  {
    id: 1,
    name: "Short Poliamida c/ Bolso",
    price: 89.90,
    originalPrice: 119.90,
    image: shortsImg,
    colors: ["#E91E63", "#2196F3", "#4CAF50", "#000"],
    isNew: true,
    discount: 25,
  },
  {
    id: 2,
    name: "Legging Cintura Alta Premium",
    price: 129.90,
    originalPrice: null,
    image: leggingImg,
    colors: ["#000", "#1a1a1a", "#333"],
    isNew: false,
    discount: null,
  },
  {
    id: 3,
    name: "Top Nadador Básico",
    price: 59.90,
    originalPrice: 79.90,
    image: topImg,
    colors: ["#26A69A", "#E91E63", "#FF9800", "#9C27B0"],
    isNew: true,
    discount: 25,
  },
  {
    id: 4,
    name: "Conjunto Fitness Completo",
    price: 179.90,
    originalPrice: 229.90,
    image: conjuntoImg,
    colors: ["#FF7043", "#E91E63", "#000"],
    isNew: false,
    discount: 22,
  },
];

const ProductsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Mais Vendidos
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Conheça os produtos preferidos das nossas clientes.
            </p>
          </div>
          <Button variant="outline">
            Ver Todos
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              className="group bg-card rounded-lg overflow-hidden hover-lift shadow-card"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-mint text-primary-foreground text-xs font-bold px-3 py-1 rounded">
                      NOVO
                    </span>
                  )}
                  {product.discount && (
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button className="p-2 bg-card rounded-full shadow-soft hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-card rounded-full shadow-soft hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Add */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300">
                  <Button variant="shop" size="sm" className="w-full gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                
                {/* Colors */}
                <div className="flex items-center gap-1 mb-3">
                  {product.colors.map((color, i) => (
                    <span 
                      key={i}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
