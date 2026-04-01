import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Search, Image, Loader2 } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify-api";

interface SizeChartEntry {
  id: string;
  product_handle: string;
  product_title: string | null;
  image_url: string;
  created_at: string;
}

const SizeChartManager = () => {
  const [entries, setEntries] = useState<SizeChartEntry[]>([]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [chartsRes, shopifyProducts] = await Promise.all([
      supabase.from("product_size_charts").select("*").order("product_title"),
      fetchProducts(100),
    ]);

    if (chartsRes.data) setEntries(chartsRes.data as SizeChartEntry[]);
    setProducts(shopifyProducts);
    setLoading(false);
  };

  const handleUpload = async (product: ShopifyProduct, file: File) => {
    const handle = product.node.handle;
    setUploading(handle);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `size-charts/${handle}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(path);

      const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("product_size_charts")
        .upsert({
          product_handle: handle,
          product_title: product.node.title,
          image_url: imageUrl,
        }, { onConflict: "product_handle" });

      if (dbError) throw dbError;

      toast.success("Tabela de medidas salva!");
      loadData();
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (entry: SizeChartEntry) => {
    const { error } = await supabase
      .from("product_size_charts")
      .delete()
      .eq("id", entry.id);

    if (error) {
      toast.error("Erro ao remover");
      return;
    }
    toast.success("Tabela de medidas removida");
    setEntries(prev => prev.filter(e => e.id !== entry.id));
  };

  const chartMap = new Map(entries.map(e => [e.product_handle, e]));

  const filteredProducts = products.filter(p =>
    p.node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.node.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {entries.length} produto(s) com tabela personalizada • {products.length} produtos totais
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredProducts.map(product => {
          const handle = product.node.handle;
          const existing = chartMap.get(handle);
          const isUploading = uploading === handle;
          const thumb = product.node.images.edges[0]?.node.url;

          return (
            <Card key={handle} className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 items-start">
                  {/* Product thumbnail */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{product.node.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{handle}</p>

                    <div className="flex items-center gap-2 mt-2">
                      {existing ? (
                        <>
                          <span className="text-xs text-green-600 font-medium">✓ Tabela cadastrada</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive"
                            onClick={() => handleDelete(existing)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem tabela personalizada</span>
                      )}
                    </div>
                  </div>

                  {/* Upload / Preview */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    {existing && (
                      <img
                        src={existing.image_url}
                        alt="Tabela"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain border rounded"
                      />
                    )}
                    <Label
                      className={`cursor-pointer inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border transition-colors ${
                        isUploading
                          ? "opacity-50 pointer-events-none"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      {existing ? "Trocar" : "Enviar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(product, file);
                          e.target.value = "";
                        }}
                      />
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SizeChartManager;
