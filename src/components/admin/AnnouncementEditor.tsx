import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export interface AnnouncementSettings {
  enabled: boolean;
  messages: string[];
  interval: number;
}

interface AnnouncementEditorProps {
  settings: AnnouncementSettings | null;
  onChange: (settings: AnnouncementSettings) => void;
}

const defaultSettings: AnnouncementSettings = {
  enabled: true,
  messages: [
    "FRETE GRÁTIS ACIMA DE R$299",
    "GRADE ABERTA - QUALQUER QUANTIDADE",
    "ATÉ 6X SEM JUROS"
  ],
  interval: 4000
};

const AnnouncementEditor = ({ settings, onChange }: AnnouncementEditorProps) => {
  const current = settings || defaultSettings;
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!current.enabled || current.messages.length === 0) return;
    
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % current.messages.length);
    }, current.interval);

    return () => clearInterval(timer);
  }, [current.enabled, current.messages.length, current.interval]);

  const updateField = (field: keyof AnnouncementSettings, value: boolean | string[] | number) => {
    onChange({ ...current, [field]: value });
  };

  const addMessage = () => {
    updateField('messages', [...current.messages, "NOVO ANÚNCIO"]);
  };

  const removeMessage = (index: number) => {
    const newMessages = current.messages.filter((_, i) => i !== index);
    updateField('messages', newMessages);
    if (previewIndex >= newMessages.length) {
      setPreviewIndex(Math.max(0, newMessages.length - 1));
    }
  };

  const updateMessage = (index: number, value: string) => {
    const newMessages = [...current.messages];
    newMessages[index] = value;
    updateField('messages', newMessages);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview</CardTitle>
          <CardDescription className="text-xs">
            Visualização da barra de anúncios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current.enabled && current.messages.length > 0 ? (
            <div className="bg-foreground text-background py-2 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setPreviewIndex((prev) => (prev - 1 + current.messages.length) % current.messages.length)}
                  className="p-0.5 hover:opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase">
                  {current.messages[previewIndex]}
                </span>
                <button 
                  onClick={() => setPreviewIndex((prev) => (prev + 1) % current.messages.length)}
                  className="p-0.5 hover:opacity-70 transition-opacity"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground text-sm">
              Barra de anúncios desativada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="font-semibold">Exibir Barra de Anúncios</Label>
            <p className="text-xs text-muted-foreground">Ativar ou desativar a barra no topo do site</p>
          </div>
          <Switch
            checked={current.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label>Intervalo entre anúncios (ms)</Label>
          <Input
            type="number"
            min={1000}
            max={10000}
            step={500}
            value={current.interval}
            onChange={(e) => updateField('interval', parseInt(e.target.value) || 4000)}
            placeholder="4000"
          />
          <p className="text-xs text-muted-foreground">Tempo em milissegundos (1000ms = 1 segundo)</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Mensagens</Label>
            <Button variant="outline" size="sm" onClick={addMessage}>
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>
          
          {current.messages.map((message, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => updateMessage(index, e.target.value)}
                placeholder="Texto do anúncio"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMessage(index)}
                disabled={current.messages.length <= 1}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementEditor;
