import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { getSiteSetting, updateSiteSetting, uploadSiteImage } from "@/lib/site-settings";
import { toast } from "sonner";

interface PrivateLabelSettings {
  enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_cta_text: string;
  hero_cta_link: string;
  section1_title: string;
  section1_description: string;
  section1_features: Array<{ title: string; description: string }>;
  section2_title: string;
  section2_description: string;
  section2_image: string;
  section3_title: string;
  section3_steps: Array<{ title: string; description: string }>;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_whatsapp_number: string;
}

const defaultSettings: PrivateLabelSettings = {
  enabled: true,
  hero_title: "PRIVATE LABEL",
  hero_subtitle: "Crie sua própria marca de moda fitness com a qualidade Avance Modas. Oferecemos produção personalizada com seu logo e etiquetas exclusivas.",
  hero_image: "",
  hero_cta_text: "Solicitar Orçamento",
  hero_cta_link: "#contato",
  section1_title: "Por que escolher Private Label?",
  section1_description: "Tenha sua própria marca de roupas fitness sem precisar investir em estrutura de produção. Nós cuidamos de tudo para você.",
  section1_features: [
    { title: "Produção Própria", description: "Fabricamos internamente com controle total de qualidade." },
    { title: "Personalização Total", description: "Etiquetas, tags e embalagens com sua marca." },
    { title: "Pedido Mínimo Acessível", description: "Quantidades flexíveis para você começar." },
    { title: "Entrega Rápida", description: "Produção ágil e envio para todo o Brasil." },
  ],
  section2_title: "Qualidade Garantida",
  section2_description: "Utilizamos os mesmos tecidos e acabamentos premium da linha Avance Modas. Sua marca terá produtos de alta qualidade, reconhecidos no mercado fitness.",
  section2_image: "",
  section3_title: "Como Funciona",
  section3_steps: [
    { title: "Entre em Contato", description: "Fale conosco via WhatsApp ou formulário." },
    { title: "Escolha os Modelos", description: "Selecione os produtos do nosso catálogo." },
    { title: "Personalize", description: "Envie seu logo e informações da etiqueta." },
    { title: "Aprovação", description: "Validamos a arte e iniciamos a produção." },
    { title: "Entrega", description: "Receba seus produtos prontos para venda." },
  ],
  cta_title: "Pronto para começar sua marca?",
  cta_description: "Entre em contato agora e solicite um orçamento personalizado. Nossa equipe está pronta para ajudar você a criar sua linha exclusiva de moda fitness.",
  cta_button_text: "Falar no WhatsApp",
  cta_whatsapp_number: "5511932105187",
};

const PrivateLabelEditor = () => {
  const [settings, setSettings] = useState<PrivateLabelSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingSection2, setUploadingSection2] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSetting<PrivateLabelSettings>('private_label');
        if (data) {
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSetting('private_label', settings);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'hero' | 'section2') => {
    if (type === 'hero') setUploadingHero(true);
    else setUploadingSection2(true);

    try {
      const url = await uploadSiteImage(file, `private-label/${type}-${Date.now()}`);
      if (url) {
        setSettings(prev => ({
          ...prev,
          [type === 'hero' ? 'hero_image' : 'section2_image']: url
        }));
        toast.success("Imagem enviada com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    } finally {
      if (type === 'hero') setUploadingHero(false);
      else setUploadingSection2(false);
    }
  };

  const addFeature = () => {
    setSettings(prev => ({
      ...prev,
      section1_features: [...prev.section1_features, { title: "", description: "" }]
    }));
  };

  const removeFeature = (index: number) => {
    setSettings(prev => ({
      ...prev,
      section1_features: prev.section1_features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    setSettings(prev => ({
      ...prev,
      section1_features: prev.section1_features.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }));
  };

  const addStep = () => {
    setSettings(prev => ({
      ...prev,
      section3_steps: [...prev.section3_steps, { title: "", description: "" }]
    }));
  };

  const removeStep = (index: number) => {
    setSettings(prev => ({
      ...prev,
      section3_steps: prev.section3_steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: 'title' | 'description', value: string) => {
    setSettings(prev => ({
      ...prev,
      section3_steps: prev.section3_steps.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Private Label</h2>
          <p className="text-muted-foreground">Configure a página de Private Label</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status da Página</CardTitle>
              <CardDescription>Ative ou desative a página de Private Label</CardDescription>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Seção Hero</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={settings.hero_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Textarea
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Texto do Botão</Label>
                <Input
                  value={settings.hero_cta_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_cta_text: e.target.value }))}
                />
              </div>
              <div>
                <Label>Imagem de Fundo</Label>
                <div className="flex items-center gap-4">
                  {settings.hero_image && (
                    <img src={settings.hero_image} alt="Hero" className="w-24 h-16 object-cover rounded" />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploadingHero}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features Section */}
        <AccordionItem value="features" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Seção de Benefícios</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <Label>Título da Seção</Label>
                <Input
                  value={settings.section1_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, section1_title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={settings.section1_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, section1_description: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Benefícios</Label>
                <Button variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
              {settings.section1_features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 items-start p-3 bg-secondary/30 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Título"
                      value={feature.title}
                      onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Descrição"
                      value={feature.description}
                      onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFeature(idx)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Quality Section */}
        <AccordionItem value="quality" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Seção de Qualidade</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={settings.section2_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, section2_title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={settings.section2_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, section2_description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Imagem</Label>
                <div className="flex items-center gap-4">
                  {settings.section2_image && (
                    <img src={settings.section2_image} alt="Qualidade" className="w-24 h-16 object-cover rounded" />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploadingSection2}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'section2')}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Steps Section */}
        <AccordionItem value="steps" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Seção "Como Funciona"</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label>Título da Seção</Label>
              <Input
                value={settings.section3_title}
                onChange={(e) => setSettings(prev => ({ ...prev, section3_title: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Passos</Label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
              {settings.section3_steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start p-3 bg-secondary/30 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Título"
                      value={step.title}
                      onChange={(e) => updateStep(idx, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Descrição"
                      value={step.description}
                      onChange={(e) => updateStep(idx, 'description', e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeStep(idx)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* CTA Section */}
        <AccordionItem value="cta" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Seção de Contato (CTA)</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={settings.cta_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={settings.cta_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div>
                <Label>Texto do Botão</Label>
                <Input
                  value={settings.cta_button_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_button_text: e.target.value }))}
                />
              </div>
              <div>
                <Label>Número do WhatsApp (com código do país)</Label>
                <Input
                  value={settings.cta_whatsapp_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_whatsapp_number: e.target.value }))}
                  placeholder="5511932105187"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default PrivateLabelEditor;
