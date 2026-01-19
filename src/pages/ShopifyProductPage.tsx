import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Truck, RefreshCcw, Shield, ArrowLeft, Ruler, Check, Package, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShopifyProductGrid from "@/components/shopify/ShopifyProductGrid";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import tabelaMedidas from "@/assets/tabela-medidas.jpg";
import VirtualFittingRoom from "@/components/product/VirtualFittingRoom";

const ShopifyProductPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedTopSize, setSelectedTopSize] = useState<string | null>(null);
  const [selectedBottomSize, setSelectedBottomSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeTableOpen, setSizeTableOpen] = useState(false);
  const [virtualFittingOpen, setVirtualFittingOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      setLoading(true);
      setSelectedSize(null);
      setSelectedTopSize(null);
      setSelectedBottomSize(null);
      setSelectedColor(null);
      setCurrentImage(0);
      const data = await fetchProductByHandle(handle);
      setProduct(data);
      setLoading(false);
    };
    loadProduct();
  }, [handle]);

  // Standard size order: P, M, G, GG
  const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'EXGG'];

  const sortSizes = (sizesArray: string[]) => {
    return sizesArray.sort((a, b) => {
      const aIndex = SIZE_ORDER.indexOf(a.toUpperCase());
      const bIndex = SIZE_ORDER.indexOf(b.toUpperCase());
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  // Check if product is a "conjunto" (set with top + bottom)
  const isConjunto = useMemo(() => {
    if (!product) return false;
    const titleLower = product.title.toLowerCase();
    return titleLower.includes('conjunto');
  }, [product]);

  // Extract unique sizes and colors from variants, separating top/bottom for conjuntos
  const { sizes, topSizes, bottomSizes, colors, getVariantByOptions } = useMemo(() => {
    if (!product) return { sizes: [], topSizes: [], bottomSizes: [], colors: [], getVariantByOptions: () => null };
    
    const sizesSet = new Set<string>();
    const topSizesSet = new Set<string>();
    const bottomSizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    
    product.variants.edges.forEach(({ node }) => {
      node.selectedOptions?.forEach(opt => {
        const nameLower = opt.name.toLowerCase();
        
        // Check for top/bottom specific size options
        if (nameLower.includes('superior') || nameLower.includes('top') || nameLower.includes('blusa') || nameLower.includes('camiseta')) {
          topSizesSet.add(opt.value);
        } else if (nameLower.includes('inferior') || nameLower.includes('bottom') || nameLower.includes('shorts') || nameLower.includes('calça') || nameLower.includes('bermuda') || nameLower.includes('legging')) {
          bottomSizesSet.add(opt.value);
        } else if (nameLower.includes('tamanho') || nameLower.includes('size') || nameLower === 'tam') {
          sizesSet.add(opt.value);
        }
        
        if (nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) {
          colorsSet.add(opt.value);
        }
      });
    });

    const getVariant = (size: string | null, color: string | null) => {
      if (!size) return null;
      
      return product.variants.edges.find(({ node }) => {
        let sizeMatch = false;
        let colorMatch = color ? false : true;
        
        node.selectedOptions?.forEach(opt => {
          const nameLower = opt.name.toLowerCase();
          if ((nameLower.includes('tamanho') || nameLower.includes('size') || nameLower === 'tam' || 
               nameLower.includes('superior') || nameLower.includes('inferior') ||
               nameLower.includes('top') || nameLower.includes('bottom') ||
               nameLower.includes('blusa') || nameLower.includes('shorts') ||
               nameLower.includes('bermuda') || nameLower.includes('legging') ||
               nameLower.includes('camiseta') || nameLower.includes('calça')) && opt.value === size) {
            sizeMatch = true;
          }
          if ((nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) && opt.value === color) {
            colorMatch = true;
          }
        });
        
        return sizeMatch && colorMatch;
      })?.node || null;
    };

    return { 
      sizes: sortSizes(Array.from(sizesSet)), 
      topSizes: sortSizes(Array.from(topSizesSet)),
      bottomSizes: sortSizes(Array.from(bottomSizesSet)),
      colors: Array.from(colorsSet),
      getVariantByOptions: getVariant
    };
  }, [product]);

  // Get available colors for selected size (handles both regular and conjunto products)
  const availableColorsForSize = useMemo(() => {
    if (!product) return [];
    
    // For conjunto products with separate top/bottom sizes
    const hasConjuntoSizes = topSizes.length > 0 && bottomSizes.length > 0;
    if (hasConjuntoSizes) {
      if (!selectedTopSize || !selectedBottomSize) return [];
    } else if (!selectedSize) {
      return [];
    }
    
    const colorsSet = new Set<string>();
    product.variants.edges.forEach(({ node }) => {
      let hasSize = false;
      let colorValue = '';
      
      node.selectedOptions?.forEach(opt => {
        const nameLower = opt.name.toLowerCase();
        
        if (hasConjuntoSizes) {
          // For conjunto: check if variant matches selected top AND bottom sizes
          const isTopOption = nameLower.includes('superior') || nameLower.includes('top') || nameLower.includes('blusa') || nameLower.includes('camiseta');
          const isBottomOption = nameLower.includes('inferior') || nameLower.includes('bottom') || nameLower.includes('shorts') || nameLower.includes('calça') || nameLower.includes('bermuda') || nameLower.includes('legging');
          
          if ((isTopOption && opt.value === selectedTopSize) || (isBottomOption && opt.value === selectedBottomSize)) {
            hasSize = true;
          }
        } else {
          if ((nameLower.includes('tamanho') || nameLower.includes('size') || nameLower === 'tam') && opt.value === selectedSize) {
            hasSize = true;
          }
        }
        
        if (nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) {
          colorValue = opt.value;
        }
      });
      
      if (hasSize && colorValue && node.availableForSale) {
        colorsSet.add(colorValue);
      }
    });
    
    return Array.from(colorsSet);
  }, [product, selectedSize, selectedTopSize, selectedBottomSize, topSizes, bottomSizes]);

  // Get variant for conjunto products with separate top/bottom sizes
  const getConjuntoVariant = useMemo(() => {
    if (!product || topSizes.length === 0 || bottomSizes.length === 0) return null;
    if (!selectedTopSize || !selectedBottomSize) return null;
    
    return product.variants.edges.find(({ node }) => {
      let topMatch = false;
      let bottomMatch = false;
      let colorMatch = selectedColor ? false : true;
      
      node.selectedOptions?.forEach(opt => {
        const nameLower = opt.name.toLowerCase();
        
        const isTopOption = nameLower.includes('superior') || nameLower.includes('top') || nameLower.includes('blusa') || nameLower.includes('camiseta');
        const isBottomOption = nameLower.includes('inferior') || nameLower.includes('bottom') || nameLower.includes('shorts') || nameLower.includes('calça') || nameLower.includes('bermuda') || nameLower.includes('legging');
        
        if (isTopOption && opt.value === selectedTopSize) {
          topMatch = true;
        }
        if (isBottomOption && opt.value === selectedBottomSize) {
          bottomMatch = true;
        }
        if ((nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) && opt.value === selectedColor) {
          colorMatch = true;
        }
      });
      
      return topMatch && bottomMatch && colorMatch;
    })?.node || null;
  }, [product, selectedTopSize, selectedBottomSize, selectedColor, topSizes, bottomSizes]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    
    // For conjunto products with separate sizes
    const hasConjuntoSizes = topSizes.length > 0 && bottomSizes.length > 0;
    if (hasConjuntoSizes) {
      return getConjuntoVariant;
    }
    
    // If product has size/color options
    if (sizes.length > 0 || colors.length > 0) {
      return getVariantByOptions(selectedSize, selectedColor);
    }
    
    // Fallback to first variant if no options
    return product.variants.edges[0]?.node || null;
  }, [product, selectedSize, selectedColor, sizes, colors, getVariantByOptions, topSizes, bottomSizes, getConjuntoVariant]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 py-12 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 py-12 bg-background">
          <div className="container text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a loja
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images.edges;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const formatPrice = (amount: string, currencyCode: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode
    }).format(parseFloat(amount));
  };

  const handleAddToCart = () => {
    const hasConjuntoSizes = topSizes.length > 0 && bottomSizes.length > 0;
    
    if (!currentVariant) {
      if (hasConjuntoSizes) {
        if (!selectedTopSize) {
          toast.error("Selecione o tamanho da peça superior");
          return;
        }
        if (!selectedBottomSize) {
          toast.error("Selecione o tamanho da peça inferior");
          return;
        }
      } else if (sizes.length > 0 && !selectedSize) {
        toast.error("Selecione um tamanho");
        return;
      }
      if (colors.length > 0 && !selectedColor) {
        toast.error("Selecione uma cor");
        return;
      }
      toast.error("Selecione as opções do produto");
      return;
    }

    const productWrapper: ShopifyProduct = {
      node: product
    };

    addItem({
      product: productWrapper,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      price: currentVariant.price,
      quantity,
      selectedOptions: currentVariant.selectedOptions || [],
    });

    toast.success("Adicionado ao carrinho!", {
      description: `${product.title} x${quantity}`,
      position: "top-center",
    });
  };

  const hasConjuntoSizesGlobal = topSizes.length > 0 && bottomSizes.length > 0;
  
  const canAddToCart = currentVariant?.availableForSale && 
    (hasConjuntoSizesGlobal 
      ? (selectedTopSize && selectedBottomSize)
      : (sizes.length === 0 || selectedSize)
    ) && 
    (colors.length === 0 || selectedColor || availableColorsForSize.length === 0);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 py-8 lg:py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-card rounded-2xl overflow-hidden shadow-sm">
                {images.length > 0 ? (
                  <img 
                    src={images[currentImage].node.url} 
                    alt={images[currentImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                    {currentImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === i 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img src={img.node.url} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-bold text-primary">
                    {formatPrice(currentVariant?.price.amount || product.priceRange.minVariantPrice.amount, currentVariant?.price.currencyCode || 'BRL')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Em até <span className="font-semibold text-foreground">6x sem juros</span> no cartão
                </p>
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  5% de desconto no Pix
                </p>
              </div>

              {/* Conjunto Size Selection - Separate Top/Bottom */}
              {topSizes.length > 0 && bottomSizes.length > 0 && (
                <div className="space-y-6">
                  {/* Top/Superior Size Selection */}
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Peça Superior</span>
                      Tamanho: {selectedTopSize && <span className="text-primary">{selectedTopSize}</span>}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {topSizes.map((size) => (
                        <button
                          key={`top-${size}`}
                          onClick={() => {
                            setSelectedTopSize(size);
                            setSelectedColor(null);
                          }}
                          className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-semibold transition-all ${
                            selectedTopSize === size
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom/Inferior Size Selection */}
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <span className="bg-secondary/50 text-secondary-foreground text-xs px-2 py-1 rounded-full">Peça Inferior</span>
                      Tamanho: {selectedBottomSize && <span className="text-primary">{selectedBottomSize}</span>}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {bottomSizes.map((size) => (
                        <button
                          key={`bottom-${size}`}
                          onClick={() => {
                            setSelectedBottomSize(size);
                            setSelectedColor(null);
                          }}
                          className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-semibold transition-all ${
                            selectedBottomSize === size
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Help Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Dialog open={sizeTableOpen} onOpenChange={setSizeTableOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-2 h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <Ruler className="w-4 h-4" />
                          Tabela de Medidas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-primary" />
                            Tabela de Medidas
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <img 
                            src={tabelaMedidas} 
                            alt="Tabela de Medidas Avance" 
                            className="w-full rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          Para medir o seu corpo é necessário ter uma fita métrica.
                        </p>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 h-11 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 hover:border-primary transition-all group"
                      onClick={() => setVirtualFittingOpen(true)}
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Descubra seu Tamanho</span>
                      <Sparkles className="w-3 h-3 text-primary" />
                    </Button>
                  </div>

                  {/* Virtual Fitting Room Modal */}
                  <VirtualFittingRoom 
                    open={virtualFittingOpen}
                    onOpenChange={setVirtualFittingOpen}
                    sizes={[...new Set([...topSizes, ...bottomSizes])]}
                    onSizeRecommendation={(size) => {
                      setSelectedTopSize(size);
                      setSelectedBottomSize(size);
                      setSelectedColor(null);
                      toast.success(`Tamanho ${size} selecionado!`, {
                        description: "Aplicado para peça superior e inferior",
                        position: "top-center"
                      });
                    }}
                  />
                </div>
              )}

              {/* Regular Size Selection (non-conjunto products) */}
              {sizes.length > 0 && topSizes.length === 0 && bottomSizes.length === 0 && (
                <div className="space-y-4">
                  <p className="font-semibold text-foreground">
                    Tamanho: {selectedSize && <span className="text-primary">{selectedSize}</span>}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSelectedColor(null);
                        }}
                        className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-semibold transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Size Help Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Dialog open={sizeTableOpen} onOpenChange={setSizeTableOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-2 h-11 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <Ruler className="w-4 h-4" />
                          Tabela de Medidas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-primary" />
                            Tabela de Medidas
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <img 
                            src={tabelaMedidas} 
                            alt="Tabela de Medidas Avance" 
                            className="w-full rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          Para medir o seu corpo é necessário ter uma fita métrica.
                        </p>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 h-11 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 hover:border-primary transition-all group"
                      onClick={() => setVirtualFittingOpen(true)}
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Descubra seu Tamanho</span>
                      <Sparkles className="w-3 h-3 text-primary" />
                    </Button>
                  </div>

                  {/* Virtual Fitting Room Modal */}
                  <VirtualFittingRoom 
                    open={virtualFittingOpen}
                    onOpenChange={setVirtualFittingOpen}
                    sizes={sizes}
                    onSizeRecommendation={(size) => {
                      setSelectedSize(size);
                      setSelectedColor(null);
                      toast.success(`Tamanho ${size} selecionado!`, {
                        description: "Baseado nas suas medidas",
                        position: "top-center"
                      });
                    }}
                  />
                </div>
              )}

              {/* Color Selection - SECOND (show after size is selected for regular products OR after both sizes for conjuntos) */}
              {colors.length > 0 && 
               ((hasConjuntoSizesGlobal && selectedTopSize && selectedBottomSize) || 
                (!hasConjuntoSizesGlobal && selectedSize)) && 
               availableColorsForSize.length > 0 && (
                <div className="space-y-3">
                  <p className="font-semibold text-foreground">
                    Cor: {selectedColor && <span className="text-primary">{selectedColor}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableColorsForSize.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`min-w-[80px] h-12 px-4 rounded-lg border-2 font-medium transition-all ${
                          selectedColor === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <p className="font-semibold text-foreground">Quantidade:</p>
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center border-2 border-border rounded-lg overflow-hidden bg-card">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {currentVariant?.availableForSale === false && (
                    <span className="text-sm text-destructive font-medium">Esgotado</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="flex-1 gap-2 h-14 text-base"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {!canAddToCart ? "Selecione as opções" : "Adicionar ao Carrinho"}
                </Button>
                <Button variant="outline" size="xl" className="h-14 w-14">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-secondary/50 rounded-xl">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Frete Grátis</span>
                  <span className="text-[10px] text-muted-foreground">Acima de R$299</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-secondary/50 rounded-xl">
                  <RefreshCcw className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Troca Grátis</span>
                  <span className="text-[10px] text-muted-foreground">Primeira troca</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-secondary/50 rounded-xl">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Compra Segura</span>
                  <span className="text-[10px] text-muted-foreground">100% protegida</span>
                </div>
              </div>

              {/* Product Details Accordion */}
              <div className="pt-4">
                <Accordion type="single" collapsible className="w-full">
                  {product.description && (
                    <AccordionItem value="description" className="border-b border-border">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="flex items-center gap-2 font-semibold">
                          <Package className="w-4 h-4" />
                          Descrição do Produto
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                          <p className="leading-relaxed whitespace-pre-line">
                            {product.description}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  <AccordionItem value="features" className="border-b border-border">
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <span className="flex items-center gap-2 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Características
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Tecido de alta qualidade com tecnologia dry-fit
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Proteção UV50+
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Modelagem que valoriza o corpo
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Costuras reforçadas para maior durabilidade
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Fácil de lavar e secar rapidamente
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="shipping" className="border-b border-border">
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <span className="flex items-center gap-2 font-semibold">
                        <Truck className="w-4 h-4" />
                        Entrega e Frete
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Frete Grátis:</strong> Para compras acima de R$299 para todo o Brasil.
                        </p>
                        <p>
                          <strong className="text-foreground">Prazo de Entrega:</strong> De 3 a 15 dias úteis, dependendo da região.
                        </p>
                        <p>
                          <strong className="text-foreground">Rastreamento:</strong> Você receberá o código de rastreio por e-mail após o envio.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 lg:mt-24">
          <ShopifyProductGrid 
            title="Você também pode gostar" 
            subtitle="Confira outros produtos da nossa coleção"
            limit={4}
            showViewAll={false}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopifyProductPage;