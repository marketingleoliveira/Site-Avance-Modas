import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export interface PromoBannerSettings {
  enabled: boolean;
  tag: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

interface PromoBannerEditorProps {
  settings: PromoBannerSettings | null;
  onChange: (settings: PromoBannerSettings) => void;
}

const defaultSettings: PromoBannerSettings = {
  enabled: true,
  tag: "Oferta Especial",
  title: "COMPRE 3 E GANHE 20% OFF",
  description: "Promoção por tempo limitado. Não perca!",
  button_text: "Aproveitar",
  button_link: "/#produtos"
};

const PromoBannerEditor = ({ settings, onChange }: PromoBannerEditorProps) => {
  const current = settings || defaultSettings;

  const updateField = (field: keyof PromoBannerSettings, value: string | boolean) => {
    onChange({ ...current, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview</CardTitle>
          <CardDescription className="text-xs">
            Visualização do banner promocional
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current.enabled ? (
            <div className="relative overflow-hidden bg-gradient-to-r from-foreground to-foreground/90 text-background rounded-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                <div className="text-center md:text-left">
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-70 mb-1 block">
                    {current.tag || "Oferta Especial"}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold mb-1">
                    {current.title || "TÍTULO DA PROMOÇÃO"}
                  </h2>
                  <p className="text-xs opacity-80">
                    {current.description || "Descrição da promoção"}
                  </p>
                </div>
                
                <div className="border border-background/50 text-background px-4 py-2 text-xs font-semibold tracking-wide flex items-center gap-2 shrink-0">
                  {current.button_text || "Aproveitar"}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground text-sm">
              Banner desativado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="font-semibold">Exibir Banner</Label>
            <p className="text-xs text-muted-foreground">Ativar ou desativar o banner promocional</p>
          </div>
          <Switch
            checked={current.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tag (texto pequeno)</Label>
            <Input
              value={current.tag}
              onChange={(e) => updateField('tag', e.target.value)}
              placeholder="Ex: Oferta Especial"
            />
          </div>
          <div className="space-y-2">
            <Label>Título Principal</Label>
            <Input
              value={current.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex: COMPRE 3 E GANHE 20% OFF"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Input
            value={current.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Ex: Promoção por tempo limitado. Não perca!"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Texto do Botão</Label>
            <Input
              value={current.button_text}
              onChange={(e) => updateField('button_text', e.target.value)}
              placeholder="Ex: Aproveitar"
            />
          </div>
          <div className="space-y-2">
            <Label>Link do Botão</Label>
            <Input
              value={current.button_link}
              onChange={(e) => updateField('button_link', e.target.value)}
              placeholder="Ex: /#produtos"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBannerEditor;
