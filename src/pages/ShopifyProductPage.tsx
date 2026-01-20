import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Truck, ArrowLeft, Ruler, Check, Package, Sparkles, User, Lock, CreditCard, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify-api";
import { useRecentlyViewed, getCachedProduct, setCachedProduct } from "@/hooks/useRecentlyViewed";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import tabelaMedidas from "@/assets/tabela-medidas.jpg";
import { COLOR_VARIATIONS, COLOR_MAP, normalizeForMatch, sortSizes, getColorStyle } from "@/lib/color-utils";

// Lazy load heavy components
const ShopifyProductGrid = lazy(() => import("@/components/shopify/ShopifyProductGrid"));
const VirtualFittingRoom = lazy(() => import("@/components/product/VirtualFittingRoom"));

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
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      
      // Check cache first
      const cached = getCachedProduct(handle);
      if (cached) {
        setProduct(cached.node);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setSelectedSize(null);
      setSelectedTopSize(null);
      setSelectedBottomSize(null);
      setSelectedColor(null);
      setCurrentImage(0);
      const data = await fetchProductByHandle(handle);
      setProduct(data);
      
      // Cache and add to recently viewed
      if (data) {
        const shopifyProduct: ShopifyProduct = { node: data };
        setCachedProduct(handle, shopifyProduct);
        addToRecentlyViewed(shopifyProduct);
      }
      
      setLoading(false);
    };
    loadProduct();
  }, [handle, addToRecentlyViewed]);

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

  // Pre-compute color availability map (memoized)
  const colorAvailabilityMap = useMemo(() => {
    if (!product) return new Map<string, boolean>();
    
    const map = new Map<string, boolean>();
    colors.forEach(color => {
      const isAvailable = product.variants.edges.some(({ node }) => {
        if (!node.availableForSale) return false;
        return node.selectedOptions?.some(opt => {
          const nameLower = opt.name.toLowerCase();
          return (nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) && opt.value === color;
        });
      });
      map.set(color, isAvailable);
    });
    return map;
  }, [product, colors]);

  // Pre-compute size availability maps based on selected color (memoized)
  const sizeAvailabilityMaps = useMemo(() => {
    if (!product) return { regular: new Map<string, boolean>(), top: new Map<string, boolean>(), bottom: new Map<string, boolean>() };
    
    const checkAvailability = (size: string, sizeType: 'regular' | 'top' | 'bottom'): boolean => {
      return product.variants.edges.some(({ node }) => {
        if (!node.availableForSale) return false;
        
        let sizeMatch = false;
        let colorMatch = selectedColor ? false : true;
        
        node.selectedOptions?.forEach(opt => {
          const nameLower = opt.name.toLowerCase();
          
          if (sizeType === 'top') {
            if ((nameLower.includes('superior') || nameLower.includes('top') || nameLower.includes('blusa') || nameLower.includes('camiseta')) && opt.value === size) {
              sizeMatch = true;
            }
          } else if (sizeType === 'bottom') {
            if ((nameLower.includes('inferior') || nameLower.includes('bottom') || nameLower.includes('shorts') || nameLower.includes('calça') || nameLower.includes('bermuda') || nameLower.includes('legging')) && opt.value === size) {
              sizeMatch = true;
            }
          } else {
            if ((nameLower.includes('tamanho') || nameLower.includes('size') || nameLower === 'tam') && opt.value === size) {
              sizeMatch = true;
            }
          }
          
          if ((nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) && opt.value === selectedColor) {
            colorMatch = true;
          }
        });
        
        return sizeMatch && colorMatch;
      });
    };

    const regularMap = new Map<string, boolean>();
    const topMap = new Map<string, boolean>();
    const bottomMap = new Map<string, boolean>();
    
    sizes.forEach(size => regularMap.set(size, checkAvailability(size, 'regular')));
    topSizes.forEach(size => topMap.set(size, checkAvailability(size, 'top')));
    bottomSizes.forEach(size => bottomMap.set(size, checkAvailability(size, 'bottom')));
    
    return { regular: regularMap, top: topMap, bottom: bottomMap };
  }, [product, sizes, topSizes, bottomSizes, selectedColor]);

  // Fast lookup functions using pre-computed maps
  const isColorAvailable = useCallback((color: string): boolean => {
    return colorAvailabilityMap.get(color) ?? false;
  }, [colorAvailabilityMap]);

  const isSizeAvailable = useCallback((size: string, sizeType: 'regular' | 'top' | 'bottom'): boolean => {
    return sizeAvailabilityMaps[sizeType].get(size) ?? false;
  }, [sizeAvailabilityMaps]);

  // Pre-compute image-to-color mapping (memoized)
  const imageColorMapping = useMemo(() => {
    if (!product || colors.length === 0) return { imageToColor: new Map<number, string>(), colorToImage: new Map<string, number>() };
    
    const images = product.images.edges;
    const imageToColor = new Map<number, string>();
    const colorToImage = new Map<string, number>();
    
    // First pass: try to match each image to a color
    images.forEach((img, idx) => {
      const altText = normalizeForMatch(img.node.altText || '');
      const url = img.node.url || '';
      const filename = normalizeForMatch(url.split('/').pop() || '');
      
      for (const color of colors) {
        const normalizedColor = normalizeForMatch(color);
        const variations = COLOR_VARIATIONS[normalizedColor] || [normalizedColor];
        
        const matchFound = variations.some(v => {
          const normalized = normalizeForMatch(v);
          return altText.includes(normalized) || filename.includes(normalized);
        });
        
        if (matchFound) {
          imageToColor.set(idx, color);
          if (!colorToImage.has(color)) {
            colorToImage.set(color, idx);
          }
          break;
        }
      }
    });
    
    // Second pass: fallback index-based mapping for unmatched colors
    colors.forEach((color, idx) => {
      if (!colorToImage.has(color) && idx < images.length) {
        colorToImage.set(color, idx);
        if (!imageToColor.has(idx)) {
          imageToColor.set(idx, color);
        }
      }
    });
    
    return { imageToColor, colorToImage };
  }, [product, colors]);

  // Fast lookup using pre-computed maps
  const findImageIndexForColor = useCallback((colorName: string): number => {
    return imageColorMapping.colorToImage.get(colorName) ?? 0;
  }, [imageColorMapping]);

  const findColorForImageIndex = useCallback((imageIndex: number): string | null => {
    return imageColorMapping.imageToColor.get(imageIndex) ?? (imageIndex < colors.length ? colors[imageIndex] : null);
  }, [imageColorMapping, colors]);

  // Handle color selection and navigate to corresponding image (memoized)
  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    const imageIndex = findImageIndexForColor(color);
    setCurrentImage(imageIndex);
  }, [findImageIndexForColor]);

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
    (colors.length === 0 || selectedColor);

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
            <div className="space-y-3 sm:space-y-4">
              <div className="relative aspect-[4/5] sm:aspect-square bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-sm max-h-[50vh] sm:max-h-none mx-auto w-full max-w-[85vw] sm:max-w-none">
                {images.length > 0 ? (
                  <img 
                    src={images[currentImage].node.url} 
                    alt={images[currentImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                  </div>
                )}
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    {currentImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => {
                    // Smart color detection for this image
                    const detectedColor = findColorForImageIndex(i);
                    
                    const colorStyle = getColorStyle(detectedColor || undefined);
                    
                    const handleThumbnailInteraction = () => {
                      setCurrentImage(i);
                      // Select color using smart detection
                      const color = findColorForImageIndex(i);
                      if (color) {
                        setSelectedColor(color);
                      }
                    };
                    
                    return (
                      <button
                        key={i}
                        onClick={handleThumbnailInteraction}
                        onMouseEnter={handleThumbnailInteraction}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                          currentImage === i 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-muted-foreground/30"
                        }`}
                      >
                        <img src={img.node.url} alt={img.node.altText || `Imagem ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                        {/* Color badge on top-right corner */}
                        {detectedColor && colorStyle && (
                          <span 
                            className="absolute top-0.5 right-0.5 text-[7px] md:text-[8px] font-semibold px-1 md:px-1.5 py-0.5 rounded shadow-sm truncate max-w-[95%] uppercase tracking-tight"
                            style={{ 
                              backgroundColor: colorStyle.bg, 
                              color: colorStyle.text,
                              textShadow: colorStyle.text === '#fff' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                            }}
                          >
                            {detectedColor}
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                      {topSizes.map((size) => {
                        const isAvailable = isSizeAvailable(size, 'top');
                        return (
                          <div key={`top-${size}`} className="flex flex-col items-center">
                            <button
                              onClick={() => isAvailable && setSelectedTopSize(size)}
                              disabled={!isAvailable}
                              className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-semibold transition-all relative ${
                                !isAvailable
                                  ? "border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                  : selectedTopSize === size
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card hover:border-primary/50"
                              }`}
                            >
                              {size}
                              {!isAvailable && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="absolute w-full h-0.5 bg-muted-foreground/50 rotate-[-20deg]" />
                                </span>
                              )}
                            </button>
                            {!isAvailable && (
                              <span className="text-[10px] text-destructive font-medium mt-1">Esgotado</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom/Inferior Size Selection */}
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <span className="bg-secondary/50 text-secondary-foreground text-xs px-2 py-1 rounded-full">Peça Inferior</span>
                      Tamanho: {selectedBottomSize && <span className="text-primary">{selectedBottomSize}</span>}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {bottomSizes.map((size) => {
                        const isAvailable = isSizeAvailable(size, 'bottom');
                        return (
                          <div key={`bottom-${size}`} className="flex flex-col items-center">
                            <button
                              onClick={() => isAvailable && setSelectedBottomSize(size)}
                              disabled={!isAvailable}
                              className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-semibold transition-all relative ${
                                !isAvailable
                                  ? "border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                  : selectedBottomSize === size
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card hover:border-primary/50"
                              }`}
                            >
                              {size}
                              {!isAvailable && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="absolute w-full h-0.5 bg-muted-foreground/50 rotate-[-20deg]" />
                                </span>
                              )}
                            </button>
                            {!isAvailable && (
                              <span className="text-[10px] text-destructive font-medium mt-1">Esgotado</span>
                            )}
                          </div>
                        );
                      })}
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
                    {sizes.map((size) => {
                      const isAvailable = isSizeAvailable(size, 'regular');
                      return (
                        <div key={size} className="flex flex-col items-center">
                          <button
                            onClick={() => isAvailable && setSelectedSize(size)}
                            disabled={!isAvailable}
                            className={`min-w-[48px] h-12 px-4 rounded-lg border-2 font-semibold transition-all relative ${
                              !isAvailable
                                ? "border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : selectedSize === size
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            {size}
                            {!isAvailable && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="absolute w-full h-0.5 bg-muted-foreground/50 rotate-[-20deg]" />
                              </span>
                            )}
                          </button>
                          {!isAvailable && (
                            <span className="text-[10px] text-destructive font-medium mt-1">Esgotado</span>
                          )}
                        </div>
                      );
                    })}
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
                  <Suspense fallback={null}>
                    <VirtualFittingRoom 
                      open={virtualFittingOpen}
                      onOpenChange={setVirtualFittingOpen}
                      sizes={sizes}
                      onSizeRecommendation={(size) => {
                        setSelectedSize(size);
                        toast.success(`Tamanho ${size} selecionado!`, {
                          description: "Baseado nas suas medidas",
                          position: "top-center"
                        });
                      }}
                    />
                  </Suspense>
                </div>
              )}

              {/* Color Selection - ALWAYS VISIBLE */}
              {colors.length > 0 && (
                <div className="space-y-3">
                  <p className="font-semibold text-foreground">
                    Cor: {selectedColor && <span className="text-primary">{selectedColor}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const isAvailable = isColorAvailable(color);
                      return (
                        <div key={color} className="flex flex-col items-center">
                          <button
                            onClick={() => isAvailable && handleColorSelect(color)}
                            disabled={!isAvailable}
                            className={`min-w-[80px] h-12 px-4 rounded-lg border-2 font-medium transition-all relative ${
                              !isAvailable
                                ? "border-border/50 bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : selectedColor === color
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            {color}
                            {!isAvailable && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="absolute w-full h-0.5 bg-muted-foreground/50 rotate-[-20deg]" />
                              </span>
                            )}
                          </button>
                          {!isAvailable && (
                            <span className="text-[10px] text-destructive font-medium mt-1">Esgotado</span>
                          )}
                        </div>
                      );
                    })}
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

              {/* Payment & Security Badges */}
              <div className="pt-4 space-y-4">
                {/* Security Badge */}
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Lock className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="text-sm font-medium text-green-700">Compra 100% Segura</span>
                    <span className="text-xs text-green-600 ml-2">Dados criptografados</span>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Formas de Pagamento</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white px-2 py-1.5 rounded border text-[10px] font-bold text-blue-800">VISA</div>
                    <div className="bg-white px-2 py-1.5 rounded border text-[10px] font-bold text-red-600">Mastercard</div>
                    <div className="bg-white px-2 py-1.5 rounded border text-[10px] font-bold text-orange-500">Elo</div>
                    <div className="bg-white px-2 py-1.5 rounded border text-[10px] font-bold text-yellow-600">Hipercard</div>
                    <div className="bg-[#32BCAD] px-2 py-1.5 rounded text-[10px] font-bold text-white">PIX</div>
                    <div className="bg-white px-2 py-1.5 rounded border text-[10px] font-bold text-gray-700">Boleto</div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    <span>Loja Verificada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>SSL Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    <span>CNPJ Ativo</span>
                  </div>
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
          <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-lg" />}>
            <ShopifyProductGrid 
              title="Você também pode gostar" 
              subtitle="Confira outros produtos da nossa coleção"
              limit={4}
              showViewAll={false}
            />
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopifyProductPage;