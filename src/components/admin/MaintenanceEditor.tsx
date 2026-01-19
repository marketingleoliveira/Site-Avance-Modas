import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Save, 
  AlertTriangle,
  Wrench,
  ExternalLink,
  Loader2,
  CalendarIcon,
  Clock,
  X
} from "lucide-react";
import { updateSiteSetting } from "@/lib/site-settings";
import { invalidateMaintenanceCache } from "@/hooks/useMaintenanceMode";
import { toast } from "sonner";

export interface MaintenanceSettings {
  enabled: boolean;
  message?: string;
  scheduled_end?: string | null;
}

interface MaintenanceEditorProps {
  settings: MaintenanceSettings | null;
  onUpdate: () => void;
}

export default function MaintenanceEditor({ settings, onUpdate }: MaintenanceEditorProps) {
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<MaintenanceSettings>(settings || {
    enabled: false,
    message: "",
    scheduled_end: null
  });
  
  const scheduledDate = localSettings.scheduled_end ? new Date(localSettings.scheduled_end) : null;

  const handleToggle = async (enabled: boolean) => {
    setLocalSettings({ ...localSettings, enabled });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Preserve existing time or default to current time
      const existingDate = scheduledDate || new Date();
      date.setHours(existingDate.getHours());
      date.setMinutes(existingDate.getMinutes());
      setLocalSettings({ ...localSettings, scheduled_end: date.toISOString() });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const date = scheduledDate ? new Date(scheduledDate) : new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    setLocalSettings({ ...localSettings, scheduled_end: date.toISOString() });
  };

  const clearSchedule = () => {
    setLocalSettings({ ...localSettings, scheduled_end: null });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSiteSetting('maintenance_settings', localSettings);
      if (success) {
        // Invalidate cache so the change takes effect immediately
        invalidateMaintenanceCache();
        
        let message = localSettings.enabled 
          ? "Modo manutenção ATIVADO! O site está em manutenção." 
          : "Modo manutenção DESATIVADO! O site está funcionando normalmente.";
        
        if (localSettings.enabled && localSettings.scheduled_end) {
          const endDate = new Date(localSettings.scheduled_end);
          message += ` Término agendado para ${format(endDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.`;
        }
        
        toast.success(message);
        onUpdate();
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error('Error saving maintenance settings:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const timeValue = scheduledDate 
    ? `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`
    : '';

  return (
    <Card className={localSettings.enabled ? "border-amber-500 border-2" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${localSettings.enabled ? 'bg-amber-100' : 'bg-secondary'}`}>
              <Wrench className={`w-5 h-5 ${localSettings.enabled ? 'text-amber-600' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Modo Manutenção
                {localSettings.enabled && (
                  <Badge variant="destructive" className="animate-pulse">
                    ATIVO
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Ative para exibir uma página de manutenção para os visitantes
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border">
          <div className="space-y-1">
            <Label htmlFor="maintenance-toggle" className="text-base font-medium">
              {localSettings.enabled ? "Site em Manutenção" : "Site Funcionando Normalmente"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {localSettings.enabled 
                ? "Visitantes verão a página de manutenção" 
                : "Visitantes têm acesso normal ao site"}
            </p>
          </div>
          <Switch
            id="maintenance-toggle"
            checked={localSettings.enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>

        {/* Schedule End Time */}
        {localSettings.enabled && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <Label className="text-base font-medium text-blue-800">
                Agendar Término da Manutenção
              </Label>
            </div>
            <p className="text-sm text-blue-600">
              O site voltará automaticamente ao normal na data e hora programada.
            </p>
            
            <div className="flex flex-wrap gap-3 items-end">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="text-sm text-blue-700">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate || undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <Label className="text-sm text-blue-700">Horário</Label>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="w-[140px]"
                  disabled={!scheduledDate}
                />
              </div>

              {/* Clear Button */}
              {scheduledDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSchedule}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {scheduledDate && (
              <div className="mt-3 p-3 bg-blue-100 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  ✓ Manutenção terminará automaticamente em:{" "}
                  <span className="font-bold">
                    {format(scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Warning when enabled */}
        {localSettings.enabled && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Atenção!</AlertTitle>
            <AlertDescription className="text-amber-700">
              O modo manutenção está ativado. Todos os visitantes serão redirecionados para a página de manutenção.
              <br />
              <strong>O painel admin continuará acessível normalmente.</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview Info */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <p className="text-sm font-medium">A página de manutenção exibirá:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Logo da loja</li>
            <li>• Mensagem "Estamos em Manutenção"</li>
            <li>• Aviso "Voltamos em breve!"</li>
            {localSettings.scheduled_end && (
              <li className="text-blue-600 font-medium">• Contagem regressiva até o término</li>
            )}
            <li>• Links para Instagram e TikTok (@avancemodasoficial)</li>
            <li>• Botão de WhatsApp para contato</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {localSettings.enabled ? "Ativar Manutenção" : "Salvar Configurações"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.open('/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
