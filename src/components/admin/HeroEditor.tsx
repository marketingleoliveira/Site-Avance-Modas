import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ImagePlus, 
  Type, 
  Sparkles, 
  MousePointer, 
  Eye, 
  Upload,
  Trash2,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Copy,
  Clock
} from "lucide-react";
import { HeroSettings, HeroSlide, uploadSiteImage } from "@/lib/site-settings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HeroEditorProps {
  settings: HeroSettings | null;
  onChange: (settings: HeroSettings) => void;
  type: 'atacado' | 'varejo';
}

const createEmptySlide = (): HeroSlide => ({
  id: `slide-${Date.now()}`,
  image_url: '',
  title: '',
  subtitle: '',
  promo_text: '',
  promo_subtitle: '',
  button_text: 'VER COLEÇÃO',
  button_link: '#',
  button_enabled: true,
});

const HeroEditor = ({ settings, onChange, type }: HeroEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Convert legacy settings to slides array
  const getSlides = (): HeroSlide[] => {
    if (settings?.slides?.length) {
      return settings.slides;
    }
    // Convert single slide to array
    return [{
      id: 'default',
      image_url: settings?.image_url || '',
      title: settings?.title || '',
      subtitle: settings?.subtitle || '',
      promo_text: settings?.promo_text || '',
      promo_subtitle: settings?.promo_subtitle || '',
      button_text: settings?.button_text || 'VER COLEÇÃO',
      button_link: settings?.button_link || '#',
    }];
  };

  const slides = getSlides();
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const updateSlides = (newSlides: HeroSlide[]) => {
    onChange({
      ...settings,
      slides: newSlides,
      autoplay: settings?.autoplay ?? true,
      autoplay_interval: settings?.autoplay_interval ?? 5000,
    });
  };

  const updateCurrentSlide = (field: keyof HeroSlide, value: string) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = { ...currentSlide, [field]: value };
    updateSlides(newSlides);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `hero_${type}/slide-${currentSlideIndex}-${Date.now()}.${ext}`;
      const url = await uploadSiteImage(file, path, true);
      
      if (url) {
        updateCurrentSlide('image_url', url);
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error("Erro ao enviar imagem");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const addSlide = () => {
    const newSlides = [...slides, createEmptySlide()];
    updateSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    toast.success("Novo slide adicionado!");
  };

  const duplicateSlide = () => {
    const newSlide = { ...currentSlide, id: `slide-${Date.now()}` };
    const newSlides = [...slides, newSlide];
    updateSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    toast.success("Slide duplicado!");
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      toast.error("Você precisa ter pelo menos um slide");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
    updateSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    toast.success("Slide removido!");
  };

  const moveSlide = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.max(0, currentSlideIndex - 1)
      : Math.min(slides.length - 1, currentSlideIndex + 1);
    
    if (newIndex === currentSlideIndex) return;

    const newSlides = [...slides];
    [newSlides[currentSlideIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[currentSlideIndex]];
    updateSlides(newSlides);
    setCurrentSlideIndex(newIndex);
  };

  const reorderSlides = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= slides.length || to >= slides.length) return;
    const newSlides = [...slides];
    const [moved] = newSlides.splice(from, 1);
    newSlides.splice(to, 0, moved);
    updateSlides(newSlides);
    // Keep the moved slide selected
    setCurrentSlideIndex(to);
    toast.success("Ordem dos slides atualizada!");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          Hero {type === 'atacado' ? 'Atacado' : 'Varejo'}
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={addSlide}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Slide
          </Button>
          <Button 
            variant={previewMode ? "default" : "outline"} 
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Editando' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Slides Thumbnails */}
      {slides.length > 1 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            Arraste as miniaturas para reordenar os slides
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIndex !== index) setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    reorderSlides(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={cn(
                  "relative flex-shrink-0 cursor-move transition-all",
                  draggedIndex === index && "opacity-40 scale-95",
                  dragOverIndex === index && draggedIndex !== index && "scale-105"
                )}
              >
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex(index)}
                  className={cn(
                    "relative block w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    index === currentSlideIndex 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50",
                    dragOverIndex === index && draggedIndex !== index && "border-primary ring-2 ring-primary/40"
                  )}
                >
                  {slide.image_url ? (
                    <img 
                      src={slide.image_url} 
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="absolute top-1 left-1 bg-black/60 text-white rounded p-0.5">
                    <GripVertical className="w-3 h-3" />
                  </span>
                  <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-black/60 text-white px-1.5 rounded">
                    {index + 1}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Preview */}
      <Card className="overflow-hidden">
        <div 
          className="relative h-[350px] bg-cover bg-center transition-all duration-500"
          style={{ 
            backgroundImage: currentSlide.image_url 
              ? `url(${currentSlide.image_url})` 
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          
          {/* Content Preview */}
          <div className="absolute inset-0 flex items-center">
            <div className="container">
              <div className="max-w-lg space-y-4 text-white">
                {currentSlide.promo_text && (
                  <div className="inline-block">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase">
                      {currentSlide.promo_text}
                      {currentSlide.promo_subtitle && (
                        <span className="ml-2 text-white/80">{currentSlide.promo_subtitle}</span>
                      )}
                    </span>
                  </div>
                )}
                
                {currentSlide.title && (
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    {currentSlide.title}
                  </h1>
                )}
                
                {currentSlide.subtitle && (
                  <p className="text-base text-white/90">
                    {currentSlide.subtitle}
                  </p>
                )}
                
                {currentSlide.button_text && (
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">
                    {currentSlide.button_text}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Slide Actions Overlay */}
          {!previewMode && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              {slides.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveSlide('left')}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveSlide('right')}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={duplicateSlide}
              >
                <Copy className="w-4 h-4" />
              </Button>
              {slides.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={deleteSlide}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Upload Overlay */}
          {!previewMode && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
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
                    Slide {currentSlideIndex + 1} de {slides.length}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.currentTarget.value = '';
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          )}

          {/* Dots indicator */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    index === currentSlideIndex 
                      ? "w-6 h-2 bg-white" 
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Autoplay Settings */}
      {slides.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Autoplay</h4>
                  <p className="text-sm text-muted-foreground">Trocar slides automaticamente</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Intervalo (ms)</Label>
                  <Input
                    type="number"
                    min="1000"
                    step="500"
                    value={settings.autoplay_interval || 5000}
                    onChange={(e) => onChange({ ...settings, autoplay_interval: parseInt(e.target.value) || 5000 })}
                    className="w-24"
                  />
                </div>
                <Switch
                  checked={settings.autoplay !== false}
                  onCheckedChange={(checked) => onChange({ ...settings, autoplay: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    value={currentSlide.promo_text || ''}
                    onChange={(e) => updateCurrentSlide('promo_text', e.target.value)}
                    placeholder="ATÉ 30% OFF"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Subtítulo</Label>
                  <Input
                    value={currentSlide.promo_subtitle || ''}
                    onChange={(e) => updateCurrentSlide('promo_subtitle', e.target.value)}
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
                    value={currentSlide.title || ''}
                    onChange={(e) => updateCurrentSlide('title', e.target.value)}
                    placeholder="Coleção Verão 2026"
                    className="text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Subtítulo</Label>
                  <Textarea
                    value={currentSlide.subtitle || ''}
                    onChange={(e) => updateCurrentSlide('subtitle', e.target.value)}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Botão de Ação</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Ativar botão</Label>
                  <Switch
                    checked={currentSlide.button_enabled !== false}
                    onCheckedChange={(checked) => {
                      const newSlides = [...slides];
                      newSlides[currentSlideIndex] = { ...currentSlide, button_enabled: checked };
                      updateSlides(newSlides);
                    }}
                  />
                </div>
              </div>
              {currentSlide.button_enabled !== false && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Texto do Botão</Label>
                    <Input
                      value={currentSlide.button_text || ''}
                      onChange={(e) => updateCurrentSlide('button_text', e.target.value)}
                      placeholder="COMPRE AGORA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Link do Botão</Label>
                    <Input
                      value={currentSlide.button_link || ''}
                      onChange={(e) => updateCurrentSlide('button_link', e.target.value)}
                      placeholder="/categoria/lancamentos"
                    />
                  </div>
                </div>
              )}
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
                  value={currentSlide.image_url || ''}
                  onChange={(e) => updateCurrentSlide('image_url', e.target.value)}
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