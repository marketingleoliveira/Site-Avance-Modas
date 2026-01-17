import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  ImagePlus, 
  Type, 
  Sparkles, 
  MousePointer, 
  Eye, 
  Upload,
  Trash2,
  RefreshCw
} from "lucide-react";
import { HeroSettings, uploadSiteImage } from "@/lib/site-settings";
import { toast } from "sonner";

interface HeroEditorProps {
  settings: HeroSettings | null;
  onChange: (settings: HeroSettings) => void;
  type: 'atacado' | 'varejo';
}

const HeroEditor = ({ settings, onChange, type }: HeroEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!settings) return;
    
    setUploading(true);
    const path = `hero_${type}/image_url-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    setUploading(false);
    
    if (url) {
      onChange({ ...settings, image_url: url });
      toast.success("Imagem enviada com sucesso!");
    } else {
      toast.error("Erro ao enviar imagem");
    }
  };

  const updateField = (field: keyof HeroSettings, value: string) => {
    if (!settings) return;
    onChange({ ...settings, [field]: value });
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary/50 rounded-xl border-2 border-dashed border-border">
        <div className="text-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          Hero {type === 'atacado' ? 'Atacado' : 'Varejo'}
        </h3>
        <Button 
          variant={previewMode ? "default" : "outline"} 
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {previewMode ? 'Editando' : 'Preview'}
        </Button>
      </div>

      {/* Live Preview */}
      <Card className="overflow-hidden">
        <div 
          className="relative h-[400px] bg-cover bg-center transition-all duration-500"
          style={{ 
            backgroundImage: settings.image_url ? `url(${settings.image_url})` : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          
          {/* Content Preview */}
          <div className="absolute inset-0 flex items-center">
            <div className="container">
              <div className="max-w-lg space-y-4 text-white">
                {settings.promo_text && (
                  <div className="inline-block">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase">
                      {settings.promo_text}
                      {settings.promo_subtitle && (
                        <span className="ml-2 text-white/80">{settings.promo_subtitle}</span>
                      )}
                    </span>
                  </div>
                )}
                
                {settings.title && (
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {settings.title}
                  </h1>
                )}
                
                {settings.subtitle && (
                  <p className="text-lg text-white/90">
                    {settings.subtitle}
                  </p>
                )}
                
                {settings.button_text && (
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">
                    {settings.button_text}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Overlay */}
          {!previewMode && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-3 p-8 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/30 hover:border-white/60 transition-colors">
                  {uploading ? (
                    <RefreshCw className="w-12 h-12 text-white animate-spin" />
                  ) : (
                    <ImagePlus className="w-12 h-12 text-white" />
                  )}
                  <span className="text-white font-medium">
                    {uploading ? 'Enviando...' : 'Clique para trocar a imagem'}
                  </span>
                  <span className="text-white/60 text-sm">
                    Recomendado: 1920x800px
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Editor Fields */}
      {!previewMode && (
        <div className="grid gap-6">
          {/* Promo Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Badge Promocional</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Texto Principal</Label>
                  <Input
                    value={settings.promo_text || ''}
                    onChange={(e) => updateField('promo_text', e.target.value)}
                    placeholder="ATÉ 30% OFF"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Subtítulo</Label>
                  <Input
                    value={settings.promo_subtitle || ''}
                    onChange={(e) => updateField('promo_subtitle', e.target.value)}
                    placeholder="ATACADO"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Títulos */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Textos</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Título Principal</Label>
                  <Input
                    value={settings.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Coleção Verão 2026"
                    className="text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Subtítulo</Label>
                  <Textarea
                    value={settings.subtitle || ''}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="Descubra as últimas tendências em moda fitness"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MousePointer className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Botão de Ação</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Texto do Botão</Label>
                  <Input
                    value={settings.button_text || ''}
                    onChange={(e) => updateField('button_text', e.target.value)}
                    placeholder="COMPRE AGORA"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Link do Botão</Label>
                  <Input
                    value={settings.button_link || ''}
                    onChange={(e) => updateField('button_link', e.target.value)}
                    placeholder="/categoria/lancamentos"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image URL Manual */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">URL da Imagem (Avançado)</h4>
              </div>
              <div className="space-y-2">
                <Input
                  value={settings.image_url || ''}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  placeholder="https://..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Cole uma URL direta ou use o upload acima
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HeroEditor;