import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { uploadSiteImage } from "@/lib/site-settings";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify-api";
import { toast } from "sonner";
import { Plus, Trash2, Play, Video, Image as ImageIcon, Search, X, ShoppingBag } from "lucide-react";

export interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  product_handle?: string;
  product_title?: string;
  product_price?: string;
  product_original_price?: string;
  product_image?: string;
}

export interface VideosSettings {
  videos: VideoItem[];
}

interface VideosEditorProps {
  settings: VideosSettings | null;
  onChange: (settings: VideosSettings) => void;
}

const createEmptyVideo = (): VideoItem => ({
  id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  video_url: "",
  thumbnail_url: "",
  title: "",
  product_handle: "",
  product_title: "",
  product_price: "",
  product_original_price: "",
  product_image: "",
});

const uploadVideo = async (file: File, path: string): Promise<string | null> => {
  const uploadPromise = supabase.storage
    .from('site-images')
    .upload(path, file, { upsert: true, contentType: file.type || 'video/mp4' });

  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error('O upload demorou demais. Verifique sua conexão e tente novamente.'));
    }, 60000);
  });

  const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    console.error('Error uploading video:', error);
    throw new Error(error.message || 'Falha no upload do vídeo');
  }

  const { data: urlData } = supabase.storage
    .from('site-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

const formatPrice = (amount: string, currencyCode: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode
  }).format(parseFloat(amount));
};

const VideosEditor = ({ settings, onChange }: VideosEditorProps) => {
  const [uploadingThumbnail, setUploadingThumbnail] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<number | null>(null);
  const [searchingProduct, setSearchingProduct] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const videos = settings?.videos || [];

  // Load products for search
  useEffect(() => {
    if (searchingProduct !== null && shopifyProducts.length === 0) {
      setLoadingProducts(true);
      fetchProducts(50).then(products => {
        setShopifyProducts(products);
        setLoadingProducts(false);
      });
    }
  }, [searchingProduct]);

  const filteredProducts = shopifyProducts.filter(p =>
    p.node.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const updateVideos = (newVideos: VideoItem[]) => {
    onChange({ ...settings, videos: newVideos });
  };

  const addVideo = () => {
    if (videos.length >= 4) {
      toast.error("Máximo de 4 vídeos permitidos");
      return;
    }
    updateVideos([...videos, createEmptyVideo()]);
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    updateVideos(newVideos);
  };

  const updateVideo = (index: number, field: keyof VideoItem, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    updateVideos(newVideos);
  };

  const selectProduct = (index: number, product: ShopifyProduct) => {
    const newVideos = [...videos];
    const price = product.node.priceRange.minVariantPrice;
    const compareAt = product.node.compareAtPriceRange?.minVariantPrice;
    const image = product.node.images.edges[0]?.node.url || "";

    newVideos[index] = {
      ...newVideos[index],
      product_handle: product.node.handle,
      product_title: product.node.title,
      product_price: formatPrice(price.amount, price.currencyCode),
      product_original_price: compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount)
        ? formatPrice(compareAt.amount, compareAt.currencyCode)
        : "",
      product_image: image,
    };
    updateVideos(newVideos);
    setSearchingProduct(null);
    setProductSearch("");
    toast.success("Produto vinculado ao vídeo!");
  };

  const clearProduct = (index: number) => {
    const newVideos = [...videos];
    newVideos[index] = {
      ...newVideos[index],
      product_handle: "",
      product_title: "",
      product_price: "",
      product_original_price: "",
      product_image: "",
    };
    updateVideos(newVideos);
  };

  const handleThumbnailUpload = async (file: File, index: number) => {
    setUploadingThumbnail(index);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `videos/thumbnail-${Date.now()}.${ext}`;
      const url = await uploadSiteImage(file, path);

      if (url) {
        updateVideo(index, 'thumbnail_url', url);
        toast.success("Thumbnail enviada!");
      } else {
        toast.error("Erro ao enviar thumbnail");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar thumbnail");
    } finally {
      setUploadingThumbnail(null);
    }
  };

  const handleVideoUpload = async (file: File, index: number) => {
    if (!file.type.startsWith('video/')) {
      toast.error("Arquivo inválido. Envie um vídeo.");
      return;
    }

    setUploadingVideo(index);
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const path = `videos/video-${Date.now()}.${ext}`;
      const url = await uploadVideo(file, path);

      if (url) {
        updateVideo(index, 'video_url', url);
        toast.success("Vídeo enviado com sucesso!");
      } else {
        toast.error("Erro ao enviar vídeo");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar vídeo");
    } finally {
      setUploadingVideo(null);
    }
  };

  const moveVideo = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= videos.length) return;
    const newVideos = [...videos];
    const [removed] = newVideos.splice(fromIndex, 1);
    newVideos.splice(toIndex, 0, removed);
    updateVideos(newVideos);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vídeos das Modelos</h3>
          <p className="text-sm text-muted-foreground">
            Adicione até 4 vídeos em formato de stories (9:16) e vincule produtos
          </p>
        </div>
        <Button
          onClick={addVideo}
          variant="outline"
          size="sm"
          disabled={videos.length >= 4}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum vídeo adicionado ainda.
              <br />
              Clique em "Adicionar Vídeo" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <Card key={video.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex gap-4">
                  {/* Thumbnail Preview */}
                  <div className="relative aspect-[9/16] w-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden group">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title || `Vídeo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : video.video_url ? (
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    {video.video_url && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/80 rounded text-white text-[10px] font-medium flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        OK
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeVideo(index)}
                        className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {(uploadingThumbnail === index || uploadingVideo === index) && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white text-xs">
                          {uploadingVideo === index ? "Enviando..." : "Enviando..."}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <div className="space-y-1">
                      <Label className="text-xs">Título do Vídeo</Label>
                      <Input
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        placeholder="Ex: Look Fitness"
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Upload Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="cursor-pointer">
                        <div className={`flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                          video.video_url 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}>
                          <Video className="w-3 h-3" />
                          {video.video_url ? 'Alterar' : 'Vídeo'}
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(file, index);
                          }}
                          disabled={uploadingVideo === index}
                        />
                      </label>

                      <label className="cursor-pointer">
                        <div className={`flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                          video.thumbnail_url 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}>
                          <ImageIcon className="w-3 h-3" />
                          Capa
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(file, index);
                          }}
                          disabled={uploadingThumbnail === index}
                        />
                      </label>
                    </div>

                    {/* Video URL */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ou cole URL do vídeo</Label>
                      <Input
                        value={video.video_url}
                        onChange={(e) => updateVideo(index, 'video_url', e.target.value)}
                        placeholder="https://..."
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Move Buttons */}
                    <div className="flex gap-2">
                      {index > 0 && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => moveVideo(index, index - 1)}>
                          ← Mover
                        </Button>
                      )}
                      {index < videos.length - 1 && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => moveVideo(index, index + 1)}>
                          Mover →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Linking Section */}
                <div className="border-t pt-3 space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Produto Vinculado
                  </Label>

                  {video.product_handle ? (
                    <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
                      {video.product_image && (
                        <img src={video.product_image} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{video.product_title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-accent">{video.product_price}</span>
                          {video.product_original_price && (
                            <span className="text-xs text-muted-foreground line-through">{video.product_original_price}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => clearProduct(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : searchingProduct === index ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Buscar produto..."
                          className="h-8 text-sm pl-8"
                          autoFocus
                        />
                        <Button 
                          variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => { setSearchingProduct(null); setProductSearch(""); }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                        {loadingProducts ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">Carregando produtos...</div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">Nenhum produto encontrado</div>
                        ) : filteredProducts.map(product => (
                          <button
                            key={product.node.id}
                            onClick={() => selectProduct(index, product)}
                            className="w-full flex items-center gap-2.5 p-2 hover:bg-secondary/50 transition-colors text-left"
                          >
                            <img
                              src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{product.node.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(product.node.priceRange.minVariantPrice.amount, product.node.priceRange.minVariantPrice.currencyCode)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => setSearchingProduct(index)}
                    >
                      <Search className="w-3.5 h-3.5 mr-1.5" />
                      Vincular Produto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Dicas:</strong>
        </p>
        <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 space-y-1 list-disc list-inside">
          <li>Vídeos em formato vertical (9:16) ficam melhores</li>
          <li>Vincule um produto para exibir informações e botão de compra no vídeo</li>
          <li>No site, o vídeo toca automaticamente em loop</li>
        </ul>
      </div>
    </div>
  );
};

export default VideosEditor;
