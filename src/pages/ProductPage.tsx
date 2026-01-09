import { useState } from "react";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Truck, RefreshCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductsSection from "@/components/sections/ProductsSection";
import shortsImg from "@/assets/product-shorts.jpg";
import leggingImg from "@/assets/product-legging.jpg";
import topImg from "@/assets/product-top.jpg";

const images = [shortsImg, leggingImg, topImg];

const sizes = ["P", "M", "G", "GG", "XG"];
const colors = [
  { name: "Rosa", hex: "#E91E63" },
  { name: "Preto", hex: "#000000" },
  { name: "Azul", hex: "#2196F3" },
  { name: "Verde", hex: "#4CAF50" },
];

const ProductPage = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8">
            <a href="/" className="hover:text-foreground">Início</a>
            <span className="mx-2">/</span>
            <a href="/shorts" className="hover:text-foreground">Shorts</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">Short Poliamida c/ Bolso</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-card rounded-lg overflow-hidden">
                <img 
                  src={images[currentImage]} 
                  alt="Produto"
                  className="w-full h-full object-cover"
                />
                
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 rounded-full hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 rounded-full hover:bg-card transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded">
                    -25%
                  </span>
                  <span className="bg-mint text-primary-foreground text-xs font-bold px-3 py-1 rounded">
                    NOVO
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Short Poliamida c/ Bolso
                </h1>
                <p className="text-muted-foreground">
                  Ref: SHT-POL-001
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  R$ 89,90
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  R$ 119,90
                </span>
                <span className="text-accent font-semibold">
                  25% OFF
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Em até <strong>6x de R$ 14,98</strong> sem juros
              </p>

              {/* Colors */}
              <div>
                <p className="text-sm font-semibold mb-3">
                  Cor: <span className="font-normal text-muted-foreground">{selectedColor.name}</span>
                </p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? "border-primary scale-110"
                          : "border-border hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="text-sm font-semibold mb-3">Tamanho:</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-md border-2 font-semibold transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm font-semibold mb-3">Quantidade:</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button variant="hero" size="xl" className="flex-1 gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Adicionar ao Carrinho
                </Button>
                <Button variant="outline" size="xl">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Frete Grátis +R$299</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Troca Grátis</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Compra Segura</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Short confeccionado em poliamida de alta qualidade, com elastano para maior conforto e liberdade de movimento. 
                  Possui bolso lateral funcional, ideal para guardar chaves e objetos pequenos durante o treino. 
                  Cós alto com elástico embutido para melhor ajuste e modelagem do corpo.
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Tecido: 88% Poliamida, 12% Elastano</li>
                  <li>• Cós alto com elástico embutido</li>
                  <li>• Bolso lateral funcional</li>
                  <li>• Modelagem empina bumbum</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <ProductsSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductPage;
