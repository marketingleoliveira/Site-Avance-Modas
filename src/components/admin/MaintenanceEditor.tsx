import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  AlertTriangle,
  Wrench,
  ExternalLink,
  Loader2
} from "lucide-react";
import { updateSiteSetting } from "@/lib/site-settings";
import { invalidateMaintenanceCache } from "@/hooks/useMaintenanceMode";
import { toast } from "sonner";

export interface MaintenanceSettings {
  enabled: boolean;
  message?: string;
}

interface MaintenanceEditorProps {
  settings: MaintenanceSettings | null;
  onUpdate: () => void;
}

export default function MaintenanceEditor({ settings, onUpdate }: MaintenanceEditorProps) {
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<MaintenanceSettings>(settings || {
    enabled: false,
    message: ""
  });

  const handleToggle = async (enabled: boolean) => {
    setLocalSettings({ ...localSettings, enabled });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSiteSetting('maintenance_settings', localSettings);
      if (success) {
        // Invalidate cache so the change takes effect immediately
        invalidateMaintenanceCache();
        toast.success(localSettings.enabled 
          ? "Modo manutenção ATIVADO! O site está em manutenção." 
          : "Modo manutenção DESATIVADO! O site está funcionando normalmente."
        );
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
