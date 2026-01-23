import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface CountdownBannerSettings {
  enabled: boolean;
  promo_text: string;
  button_text: string;
  button_link: string;
  end_time: string; // ISO date string
}

interface CountdownBannerEditorProps {
  settings: CountdownBannerSettings | null;
  onChange: (settings: CountdownBannerSettings) => void;
}

const defaultSettings: CountdownBannerSettings = {
  enabled: false,
  promo_text: "PROMO - FRETE EXPRESSO POR 14,90 PARA TODO O BRASIL!",
  button_text: "APROVEITAR AGORA",
  button_link: "/#produtos",
  end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
};

const CountdownBannerEditor = ({ settings, onChange }: CountdownBannerEditorProps) => {
  const current = settings || defaultSettings;

  const updateField = (field: keyof CountdownBannerSettings, value: string | boolean) => {
    onChange({ ...current, [field]: value });
  };

  // Format date for datetime-local input
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // Convert datetime-local to ISO
  const handleDateChange = (localDateTime: string) => {
    if (!localDateTime) return;
    const date = new Date(localDateTime);
    updateField("end_time", date.toISOString());
  };

  // Calculate time remaining for preview
  const getTimeRemaining = () => {
    const endTime = new Date(current.end_time).getTime();
    const now = new Date().getTime();
    const diff = endTime - now;

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

    return {
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  const timeRemaining = getTimeRemaining();
  const formatNum = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Preview
          </CardTitle>
          <CardDescription className="text-xs">
            Banner de contagem regressiva - aparece acima dos anúncios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current.enabled ? (
            <div className="bg-[#8B0000] text-white py-2.5 px-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-center">
                  {current.promo_text || "PROMO - FRETE EXPRESSO POR 14,90"}
                </span>

                <div className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/70 uppercase tracking-wider">Horas</span>
                    <div className="bg-black text-white font-bold text-lg px-2 py-0.5 rounded min-w-[36px] text-center">
                      {formatNum(timeRemaining.hours)}
                    </div>
                  </div>
                  <span className="text-white font-bold text-lg mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/70 uppercase tracking-wider">Minutos</span>
                    <div className="bg-black text-white font-bold text-lg px-2 py-0.5 rounded min-w-[36px] text-center">
                      {formatNum(timeRemaining.minutes)}
                    </div>
                  </div>
                  <span className="text-white font-bold text-lg mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/70 uppercase tracking-wider">Segundos</span>
                    <div className="bg-black text-white font-bold text-lg px-2 py-0.5 rounded min-w-[36px] text-center">
                      {formatNum(timeRemaining.seconds)}
                    </div>
                  </div>
                </div>

                <div className="bg-[#22C55E] text-white font-bold text-xs uppercase tracking-wide px-4 py-1.5 rounded-sm">
                  {current.button_text || "APROVEITAR AGORA"}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground text-sm">
              Banner de contagem regressiva desativado
            </div>
          )}
          {timeRemaining.expired && current.enabled && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ O tempo expirou! Atualize a data de término para exibir o banner.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="font-semibold">Exibir Banner</Label>
            <p className="text-xs text-muted-foreground">
              Ativar ou desativar o banner de contagem regressiva
            </p>
          </div>
          <Switch
            checked={current.enabled}
            onCheckedChange={(checked) => updateField("enabled", checked)}
          />
        </div>

        <div className="space-y-2">
          <Label>Texto da Promoção</Label>
          <Input
            value={current.promo_text}
            onChange={(e) => updateField("promo_text", e.target.value)}
            placeholder="Ex: PROMO - FRETE EXPRESSO POR 14,90 PARA TODO O BRASIL!"
          />
        </div>

        <div className="space-y-2">
          <Label>Data e Hora de Término</Label>
          <Input
            type="datetime-local"
            value={formatDateForInput(current.end_time)}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            O banner será ocultado automaticamente quando o tempo expirar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Texto do Botão</Label>
            <Input
              value={current.button_text}
              onChange={(e) => updateField("button_text", e.target.value)}
              placeholder="Ex: APROVEITAR AGORA"
            />
          </div>
          <div className="space-y-2">
            <Label>Link do Botão</Label>
            <Input
              value={current.button_link}
              onChange={(e) => updateField("button_link", e.target.value)}
              placeholder="Ex: /#produtos"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownBannerEditor;
