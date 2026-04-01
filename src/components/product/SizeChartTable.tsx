import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import tabelaMedidas from "@/assets/tabela-medidas.jpg";

interface SizeChartTableProps {
  productHandle?: string;
}

const SizeChartTable = ({ productHandle }: SizeChartTableProps) => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!productHandle);

  useEffect(() => {
    if (!productHandle) return;
    
    const fetchChart = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("product_size_charts")
        .select("image_url")
        .eq("product_handle", productHandle)
        .maybeSingle();
      
      setCustomImage(data?.image_url || null);
      setLoading(false);
    };
    fetchChart();
  }, [productHandle]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-muted animate-pulse rounded-lg" />
    );
  }

  const imageSrc = customImage || tabelaMedidas;

  return (
    <div className="w-full">
      <img 
        src={imageSrc} 
        alt="Tabela de Medidas" 
        className="w-full h-auto rounded-lg shadow-sm"
      />
    </div>
  );
};

export default SizeChartTable;
