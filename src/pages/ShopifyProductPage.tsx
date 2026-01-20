import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Truck, ArrowLeft, Ruler, Check, Package, Sparkles, User, Lock, CreditCard, BadgeCheck } from "lucide-react";
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
  const { sizes, topSizes, bottomSizes, colors, getVariantByOptions, isColorAvailable } = useMemo(() => {
    if (!product) return { sizes: [], topSizes: [], bottomSizes: [], colors: [], getVariantByOptions: () => null, isColorAvailable: () => false };
    
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

    // Check if a color has at least one variant available for sale
    const checkColorAvailability = (color: string): boolean => {
      return product.variants.edges.some(({ node }) => {
        if (!node.availableForSale) return false;
        
        return node.selectedOptions?.some(opt => {
          const nameLower = opt.name.toLowerCase();
          return (nameLower.includes('cor') || nameLower.includes('color') || nameLower.includes('colour')) && opt.value === color;
        });
      });
    };

    return { 
      sizes: sortSizes(Array.from(sizesSet)), 
      topSizes: sortSizes(Array.from(topSizesSet)),
      bottomSizes: sortSizes(Array.from(bottomSizesSet)),
      colors: Array.from(colorsSet),
      getVariantByOptions: getVariant,
      isColorAvailable: checkColorAvailability
    };
  }, [product]);

  // Normalize text for color matching (remove accents, lowercase, handle variations)
  const normalizeForMatch = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  // Color name variations for smarter matching
  const colorVariations: Record<string, string[]> = {
    // Rosas
    'rosa': ['rosa', 'pink', 'rose', 'rosinha'],
    'rosa bebê': ['rosa bebe', 'rosa-bebe', 'rosabebe', 'baby pink', 'rosa claro'],
    'rosa chiclete': ['rosa chiclete', 'rosa-chiclete', 'chiclete', 'bubblegum'],
    'rosa choque': ['rosa choque', 'rosa-choque', 'hot pink', 'pink choque'],
    'rosa antigo': ['rosa antigo', 'rosa-antigo', 'dusty rose', 'rose antigo'],
    'algodão doce': ['algodao doce', 'algodao-doce', 'cotton candy', 'algodaodoce'],
    
    // Pretos e Brancos
    'preto': ['preto', 'black', 'negro', 'dark', 'noir'],
    'branco': ['branco', 'white', 'branquinho', 'snow'],
    'off-white': ['off white', 'offwhite', 'off-white', 'branco gelo', 'gelo'],
    'creme': ['creme', 'cream', 'ivory', 'marfim'],
    
    // Azuis
    'azul': ['azul', 'blue'],
    'azul marinho': ['marinho', 'navy', 'azul marinho', 'azul-marinho', 'naval'],
    'azul royal': ['royal', 'azul royal', 'azul-royal', 'realeza'],
    'azul bebê': ['azul bebe', 'azul-bebe', 'baby blue', 'azul claro', 'celeste'],
    'azul céu': ['azul ceu', 'azul-ceu', 'sky blue', 'celeste'],
    'azul petróleo': ['azul petroleo', 'azul-petroleo', 'petroleo', 'teal'],
    'azul turquesa': ['azul turquesa', 'turquesa', 'turquoise', 'tiffany'],
    'azul piscina': ['azul piscina', 'azul-piscina', 'piscina', 'aqua'],
    'azul cobalto': ['cobalto', 'azul cobalto', 'azul-cobalto', 'cobalt'],
    
    // Verdes
    'verde': ['verde', 'green'],
    'verde limão': ['verde limao', 'verde-limao', 'limao', 'lime', 'lima'],
    'verde água': ['verde agua', 'verde-agua', 'agua', 'aqua', 'mint'],
    'verde menta': ['menta', 'verde menta', 'verde-menta', 'mint'],
    'verde militar': ['militar', 'verde militar', 'verde-militar', 'army', 'army green'],
    'verde musgo': ['musgo', 'verde musgo', 'verde-musgo', 'moss'],
    'verde oliva': ['oliva', 'verde oliva', 'verde-oliva', 'olive'],
    'verde esmeralda': ['esmeralda', 'verde esmeralda', 'verde-esmeralda', 'emerald'],
    'verde bandeira': ['bandeira', 'verde bandeira', 'verde-bandeira'],
    'verde floresta': ['floresta', 'verde floresta', 'verde-floresta', 'forest'],
    
    // Vermelhos
    'vermelho': ['vermelho', 'red', 'rubro', 'encarnado'],
    'vermelho escuro': ['vermelho escuro', 'vermelho-escuro', 'dark red', 'borgonha'],
    'cereja': ['cereja', 'cherry', 'vermelho cereja'],
    'tomate': ['tomate', 'tomato', 'vermelho tomate'],
    
    // Amarelos e Laranjas
    'amarelo': ['amarelo', 'yellow'],
    'amarelo ouro': ['amarelo ouro', 'amarelo-ouro', 'gold yellow', 'mostarda'],
    'amarelo canário': ['canario', 'amarelo canario', 'amarelo-canario'],
    'amarelo bebê': ['amarelo bebe', 'amarelo-bebe', 'baby yellow', 'amarelo claro'],
    'laranja': ['laranja', 'orange'],
    'laranja queimado': ['laranja queimado', 'laranja-queimado', 'burnt orange', 'terracota'],
    'terracota': ['terracota', 'terracotta', 'terra cota'],
    'pêssego': ['pessego', 'peach', 'peach pink'],
    
    // Roxos e Lilás
    'roxo': ['roxo', 'purple', 'violeta', 'violet'],
    'roxo escuro': ['roxo escuro', 'roxo-escuro', 'dark purple', 'uva'],
    'lilás': ['lilas', 'lilac', 'lavanda', 'lavender'],
    'lavanda': ['lavanda', 'lavender', 'lilas claro'],
    'berinjela': ['berinjela', 'eggplant', 'aubergine'],
    'uva': ['uva', 'grape', 'roxo uva'],
    
    // Cinzas
    'cinza': ['cinza', 'gray', 'grey', 'grafite'],
    'cinza claro': ['cinza claro', 'cinza-claro', 'light gray', 'prata'],
    'cinza escuro': ['cinza escuro', 'cinza-escuro', 'dark gray', 'chumbo'],
    'cinza mescla': ['mescla', 'cinza mescla', 'cinza-mescla', 'heather'],
    'grafite': ['grafite', 'graphite', 'charcoal'],
    'chumbo': ['chumbo', 'lead', 'dark grey'],
    
    // Marrons e Beges
    'marrom': ['marrom', 'brown', 'cafe', 'chocolate', 'castanho'],
    'marrom escuro': ['marrom escuro', 'marrom-escuro', 'dark brown', 'cacau'],
    'café': ['cafe', 'coffee', 'marrom cafe'],
    'chocolate': ['chocolate', 'marrom chocolate', 'cacau'],
    'caramelo': ['caramelo', 'caramel', 'toffee'],
    'bege': ['bege', 'beige', 'areia', 'sand'],
    'areia': ['areia', 'sand', 'sandy'],
    'nude': ['nude', 'pele', 'skin', 'neutro'],
    'caqui': ['caqui', 'khaki', 'kaki'],
    
    // Vinhos e Bordôs
    'vinho': ['vinho', 'burgundy', 'bordô', 'bordo', 'wine'],
    'marsala': ['marsala', 'marsalla'],
    'bordô': ['bordo', 'burgundy', 'bordeaux'],
    
    // Corais e Salmões
    'coral': ['coral', 'coral pink'],
    'salmão': ['salmao', 'salmon', 'rosa salmao'],
    
    // Fúcsias e Magentas
    'fucsia': ['fucsia', 'fuchsia', 'magenta', 'pink escuro'],
    'magenta': ['magenta', 'pink magenta'],
    
    // Metálicos
    'dourado': ['dourado', 'gold', 'ouro', 'golden'],
    'prata': ['prata', 'silver', 'prateado'],
    'bronze': ['bronze', 'cobre', 'copper'],
    'rose gold': ['rose gold', 'rosegold', 'ouro rose', 'ouro-rose'],
    
    // Especiais
    'turquesa': ['turquesa', 'turquoise', 'tiffany', 'cyan'],
    'ciano': ['ciano', 'cyan', 'aqua'],
    'neon': ['neon', 'fluorescente', 'fluor'],
    'animal print': ['animal print', 'animal-print', 'onca', 'leopardo', 'zebra'],
    'tie dye': ['tie dye', 'tie-dye', 'tiedye', 'manchado'],
    'estampado': ['estampado', 'estampa', 'print', 'floral'],
  };

  // Find image index using smart color matching
  const findImageIndexForColor = (colorName: string): number => {
    if (!product || colors.length === 0) return 0;
    
    const normalizedColorName = normalizeForMatch(colorName);
    const images = product.images.edges;
    
    // Strategy 1: Exact match in altText
    let idx = images.findIndex(img => {
      const altText = normalizeForMatch(img.node.altText || '');
      return altText.includes(normalizedColorName);
    });
    if (idx >= 0) return idx;
    
    // Strategy 2: Match color variations in altText
    const variations = colorVariations[normalizedColorName] || [normalizedColorName];
    idx = images.findIndex(img => {
      const altText = normalizeForMatch(img.node.altText || '');
      return variations.some(v => altText.includes(normalizeForMatch(v)));
    });
    if (idx >= 0) return idx;
    
    // Strategy 3: Match in image URL/filename
    idx = images.findIndex(img => {
      const url = img.node.url || '';
      const filename = normalizeForMatch(url.split('/').pop() || '');
      return variations.some(v => filename.includes(normalizeForMatch(v)));
    });
    if (idx >= 0) return idx;
    
    // Strategy 4: Partial word match in altText (color at word boundary)
    idx = images.findIndex(img => {
      const altText = normalizeForMatch(img.node.altText || '');
      const words = altText.split(' ');
      return variations.some(v => 
        words.some(word => word === normalizeForMatch(v) || word.startsWith(normalizeForMatch(v)))
      );
    });
    if (idx >= 0) return idx;
    
    // Strategy 5: Fallback to index-based mapping (first color = first image)
    const colorIndex = colors.findIndex(c => normalizeForMatch(c) === normalizedColorName);
    if (colorIndex >= 0 && colorIndex < images.length) {
      return colorIndex;
    }
    
    return 0;
  };

  // Find color from image index using same smart matching
  const findColorForImageIndex = (imageIndex: number): string | null => {
    if (!product || colors.length === 0) return null;
    
    const image = product.images.edges[imageIndex];
    if (!image) return null;
    
    const altText = normalizeForMatch(image.node.altText || '');
    const url = image.node.url || '';
    const filename = normalizeForMatch(url.split('/').pop() || '');
    
    // Try to match each color against the image
    for (const color of colors) {
      const normalizedColor = normalizeForMatch(color);
      const variations = colorVariations[normalizedColor] || [normalizedColor];
      
      // Check altText
      if (variations.some(v => altText.includes(normalizeForMatch(v)))) {
        return color;
      }
      
      // Check filename
      if (variations.some(v => filename.includes(normalizeForMatch(v)))) {
        return color;
      }
    }
    
    // Fallback to index-based mapping
    if (imageIndex < colors.length) {
      return colors[imageIndex];
    }
    
    return null;
  };

  // Handle color selection and navigate to corresponding image
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const imageIndex = findImageIndexForColor(color);
    setCurrentImage(imageIndex);
  };

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
                  {images.map((img, i) => {
                    // Smart color detection for this image
                    const detectedColor = findColorForImageIndex(i);
                    
                    // Color mapping for background colors (expanded)
                    const colorMap: Record<string, { bg: string; text: string }> = {
                      // Rosas
                      'rosa': { bg: '#FF69B4', text: '#000' },
                      'pink': { bg: '#FF69B4', text: '#000' },
                      'rosa bebê': { bg: '#F4C2C2', text: '#000' },
                      'rosa chiclete': { bg: '#FF1493', text: '#fff' },
                      'rosa choque': { bg: '#FF007F', text: '#fff' },
                      'rosa antigo': { bg: '#C08081', text: '#fff' },
                      'algodão doce': { bg: '#FFBCD9', text: '#000' },
                      'algodao doce': { bg: '#FFBCD9', text: '#000' },
                      
                      // Pretos e Brancos
                      'preto': { bg: '#1a1a1a', text: '#fff' },
                      'black': { bg: '#1a1a1a', text: '#fff' },
                      'branco': { bg: '#f5f5f5', text: '#000' },
                      'white': { bg: '#f5f5f5', text: '#000' },
                      'off-white': { bg: '#faf9f6', text: '#000' },
                      'offwhite': { bg: '#faf9f6', text: '#000' },
                      'creme': { bg: '#fffdd0', text: '#000' },
                      'cream': { bg: '#fffdd0', text: '#000' },
                      
                      // Azuis
                      'azul': { bg: '#2563eb', text: '#fff' },
                      'blue': { bg: '#2563eb', text: '#fff' },
                      'azul royal': { bg: '#4169E1', text: '#fff' },
                      'royal': { bg: '#4169E1', text: '#fff' },
                      'azul marinho': { bg: '#1e3a5f', text: '#fff' },
                      'marinho': { bg: '#1e3a5f', text: '#fff' },
                      'navy': { bg: '#1e3a5f', text: '#fff' },
                      'azul bebê': { bg: '#89CFF0', text: '#000' },
                      'azul bebe': { bg: '#89CFF0', text: '#000' },
                      'azul céu': { bg: '#87CEEB', text: '#000' },
                      'azul ceu': { bg: '#87CEEB', text: '#000' },
                      'celeste': { bg: '#87CEEB', text: '#000' },
                      'azul petróleo': { bg: '#008080', text: '#fff' },
                      'azul petroleo': { bg: '#008080', text: '#fff' },
                      'azul piscina': { bg: '#00CED1', text: '#000' },
                      'piscina': { bg: '#00CED1', text: '#000' },
                      'azul cobalto': { bg: '#0047AB', text: '#fff' },
                      'cobalto': { bg: '#0047AB', text: '#fff' },
                      
                      // Verdes
                      'verde': { bg: '#16a34a', text: '#fff' },
                      'green': { bg: '#16a34a', text: '#fff' },
                      'verde limão': { bg: '#32CD32', text: '#000' },
                      'verde limao': { bg: '#32CD32', text: '#000' },
                      'limão': { bg: '#32CD32', text: '#000' },
                      'limao': { bg: '#32CD32', text: '#000' },
                      'lime': { bg: '#32CD32', text: '#000' },
                      'verde água': { bg: '#66CDAA', text: '#000' },
                      'verde agua': { bg: '#66CDAA', text: '#000' },
                      'verde menta': { bg: '#98FF98', text: '#000' },
                      'menta': { bg: '#98FF98', text: '#000' },
                      'mint': { bg: '#98FF98', text: '#000' },
                      'verde militar': { bg: '#4B5320', text: '#fff' },
                      'militar': { bg: '#4B5320', text: '#fff' },
                      'verde musgo': { bg: '#556b2f', text: '#fff' },
                      'musgo': { bg: '#556b2f', text: '#fff' },
                      'moss': { bg: '#556b2f', text: '#fff' },
                      'verde oliva': { bg: '#808000', text: '#fff' },
                      'oliva': { bg: '#808000', text: '#fff' },
                      'olive': { bg: '#808000', text: '#fff' },
                      'verde esmeralda': { bg: '#50C878', text: '#000' },
                      'esmeralda': { bg: '#50C878', text: '#000' },
                      'verde bandeira': { bg: '#009739', text: '#fff' },
                      'verde floresta': { bg: '#228B22', text: '#fff' },
                      'floresta': { bg: '#228B22', text: '#fff' },
                      
                      // Vermelhos
                      'vermelho': { bg: '#dc2626', text: '#fff' },
                      'red': { bg: '#dc2626', text: '#fff' },
                      'vermelho escuro': { bg: '#8B0000', text: '#fff' },
                      'cereja': { bg: '#DE3163', text: '#fff' },
                      'tomate': { bg: '#FF6347', text: '#000' },
                      
                      // Amarelos e Laranjas
                      'amarelo': { bg: '#facc15', text: '#000' },
                      'yellow': { bg: '#facc15', text: '#000' },
                      'amarelo ouro': { bg: '#FFD700', text: '#000' },
                      'mostarda': { bg: '#FFDB58', text: '#000' },
                      'amarelo canário': { bg: '#FFEF00', text: '#000' },
                      'amarelo bebê': { bg: '#FFFACD', text: '#000' },
                      'laranja': { bg: '#f97316', text: '#fff' },
                      'orange': { bg: '#f97316', text: '#fff' },
                      'laranja queimado': { bg: '#CC5500', text: '#fff' },
                      'terracota': { bg: '#E2725B', text: '#fff' },
                      'pêssego': { bg: '#FFCBA4', text: '#000' },
                      'pessego': { bg: '#FFCBA4', text: '#000' },
                      'peach': { bg: '#FFCBA4', text: '#000' },
                      
                      // Roxos e Lilás
                      'roxo': { bg: '#9333ea', text: '#fff' },
                      'purple': { bg: '#9333ea', text: '#fff' },
                      'roxo escuro': { bg: '#4B0082', text: '#fff' },
                      'lilás': { bg: '#c8a2c8', text: '#000' },
                      'lilas': { bg: '#c8a2c8', text: '#000' },
                      'lilac': { bg: '#c8a2c8', text: '#000' },
                      'lavanda': { bg: '#E6E6FA', text: '#000' },
                      'lavender': { bg: '#E6E6FA', text: '#000' },
                      'berinjela': { bg: '#614051', text: '#fff' },
                      'uva': { bg: '#6F2DA8', text: '#fff' },
                      
                      // Cinzas
                      'cinza': { bg: '#6b7280', text: '#fff' },
                      'gray': { bg: '#6b7280', text: '#fff' },
                      'grey': { bg: '#6b7280', text: '#fff' },
                      'cinza claro': { bg: '#D3D3D3', text: '#000' },
                      'cinza escuro': { bg: '#4A4A4A', text: '#fff' },
                      'cinza mescla': { bg: '#9CA3AF', text: '#000' },
                      'mescla': { bg: '#9CA3AF', text: '#000' },
                      'grafite': { bg: '#474747', text: '#fff' },
                      'chumbo': { bg: '#36454F', text: '#fff' },
                      
                      // Marrons e Beges
                      'marrom': { bg: '#78350f', text: '#fff' },
                      'brown': { bg: '#78350f', text: '#fff' },
                      'marrom escuro': { bg: '#3D2314', text: '#fff' },
                      'café': { bg: '#6F4E37', text: '#fff' },
                      'cafe': { bg: '#6F4E37', text: '#fff' },
                      'chocolate': { bg: '#7B3F00', text: '#fff' },
                      'caramelo': { bg: '#FFD59A', text: '#000' },
                      'bege': { bg: '#d4a574', text: '#000' },
                      'beige': { bg: '#d4a574', text: '#000' },
                      'areia': { bg: '#C2B280', text: '#000' },
                      'sand': { bg: '#C2B280', text: '#000' },
                      'nude': { bg: '#e8c4a0', text: '#000' },
                      'caqui': { bg: '#C3B091', text: '#000' },
                      'khaki': { bg: '#C3B091', text: '#000' },
                      
                      // Vinhos e Bordôs
                      'vinho': { bg: '#722f37', text: '#fff' },
                      'burgundy': { bg: '#722f37', text: '#fff' },
                      'marsala': { bg: '#8e4c54', text: '#fff' },
                      'bordô': { bg: '#800020', text: '#fff' },
                      'bordo': { bg: '#800020', text: '#fff' },
                      
                      // Corais e Salmões
                      'coral': { bg: '#ff7f50', text: '#000' },
                      'salmão': { bg: '#fa8072', text: '#000' },
                      'salmao': { bg: '#fa8072', text: '#000' },
                      'salmon': { bg: '#fa8072', text: '#000' },
                      
                      // Fúcsias e Magentas
                      'fucsia': { bg: '#ff00ff', text: '#fff' },
                      'fúcsia': { bg: '#ff00ff', text: '#fff' },
                      'fuchsia': { bg: '#ff00ff', text: '#fff' },
                      'magenta': { bg: '#ff00ff', text: '#fff' },
                      
                      // Turquesas e Cianos
                      'turquesa': { bg: '#40e0d0', text: '#000' },
                      'turquoise': { bg: '#40e0d0', text: '#000' },
                      'tiffany': { bg: '#0ABAB5', text: '#000' },
                      'ciano': { bg: '#00ffff', text: '#000' },
                      'cyan': { bg: '#00ffff', text: '#000' },
                      'aqua': { bg: '#00FFFF', text: '#000' },
                      
                      // Metálicos
                      'dourado': { bg: '#d4af37', text: '#000' },
                      'gold': { bg: '#d4af37', text: '#000' },
                      'ouro': { bg: '#d4af37', text: '#000' },
                      'prata': { bg: '#c0c0c0', text: '#000' },
                      'silver': { bg: '#c0c0c0', text: '#000' },
                      'bronze': { bg: '#CD7F32', text: '#000' },
                      'cobre': { bg: '#B87333', text: '#fff' },
                      'rose gold': { bg: '#B76E79', text: '#fff' },
                      'rosegold': { bg: '#B76E79', text: '#fff' },
                      
                      // Especiais
                      'neon': { bg: '#39FF14', text: '#000' },
                      'fluorescente': { bg: '#39FF14', text: '#000' },
                    };
                    
                    const getColorStyle = (colorName: string | undefined) => {
                      if (!colorName) return null;
                      const lowerColor = colorName.toLowerCase();
                      return colorMap[lowerColor] || { bg: '#6b7280', text: '#fff' };
                    };
                    
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
                        <img src={img.node.url} alt={img.node.altText || `Imagem ${i + 1}`} className="w-full h-full object-cover" />
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
                      {topSizes.map((size) => (
                        <button
                          key={`top-${size}`}
                          onClick={() => {
                            setSelectedTopSize(size);
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
                      toast.success(`Tamanho ${size} selecionado!`, {
                        description: "Baseado nas suas medidas",
                        position: "top-center"
                      });
                    }}
                  />
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
                        <button
                          key={color}
                          onClick={() => isAvailable && handleColorSelect(color)}
                          onMouseEnter={() => isAvailable && handleColorSelect(color)}
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