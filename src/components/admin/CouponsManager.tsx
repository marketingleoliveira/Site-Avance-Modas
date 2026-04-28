import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  is_active: boolean;
  applies_to: 'varejo' | 'atacado' | 'all';
  created_at: string;
}

const CouponsManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [percent, setPercent] = useState<number>(8);
  const [appliesTo, setAppliesTo] = useState<'varejo' | 'atacado' | 'all'>('varejo');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao carregar cupons");
    } else {
      setCoupons((data || []) as Coupon[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error("Informe o código do cupom"); return; }
    if (percent <= 0 || percent > 100) { toast.error("Percentual deve ser entre 1 e 100"); return; }
    setCreating(true);
    const { error } = await supabase.from('coupons').insert({
      code: trimmed,
      description: description.trim() || null,
      discount_percent: percent,
      applies_to: appliesTo,
      is_active: true,
    });
    setCreating(false);
    if (error) {
      if (error.code === '23505') {
        toast.error("Já existe um cupom com esse código");
      } else {
        toast.error("Erro ao criar cupom: " + error.message);
      }
      return;
    }
    toast.success(`Cupom ${trimmed} criado!`, {
      description: "Lembre-se de criar o mesmo código no Shopify Admin para que o desconto seja aplicado no checkout.",
    });
    setCode(""); setDescription(""); setPercent(8); setAppliesTo('varejo');
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    if (error) toast.error("Erro ao atualizar cupom");
    else { toast.success(current ? "Cupom desativado" : "Cupom ativado"); load(); }
  };

  const handleDelete = async (id: string, codeText: string) => {
    if (!confirm(`Excluir o cupom ${codeText}? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir cupom");
    else { toast.success("Cupom excluído"); load(); }
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopied(c);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>⚠️ Importante:</strong> O desconto é aplicado pelo <strong>Shopify</strong> no checkout para evitar conflitos com o sistema de pagamento. 
          Para cada cupom criado aqui, você precisa também criar o mesmo código no <strong>Shopify Admin → Discounts</strong> com o mesmo percentual.
          Assim o desconto entra automaticamente no valor final ao redirecionar para o Shopify.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Criar Novo Cupom
          </CardTitle>
          <CardDescription>O código será automaticamente convertido em maiúsculas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código do Cupom</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="EX: AVANCE8" />
            </div>
            <div className="space-y-2">
              <Label>Percentual de Desconto (%)</Label>
              <Input type="number" min={1} max={100} value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: 8% off em todos os produtos" />
            </div>
            <div className="space-y-2">
              <Label>Aplica-se a</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as 'varejo' | 'atacado' | 'all')}
              >
                <option value="varejo">Varejo</option>
                <option value="atacado">Atacado</option>
                <option value="all">Ambos</option>
              </select>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Criar Cupom
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" /> Cupons Cadastrados ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : coupons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cupom cadastrado</p>
          ) : (
            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-background">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => copyCode(c.code)}
                        className="font-mono font-bold text-base flex items-center gap-1 hover:text-primary"
                        title="Copiar código"
                      >
                        {c.code}
                        {copied === c.code ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 opacity-50" />}
                      </button>
                      <Badge variant="secondary">{c.discount_percent}% OFF</Badge>
                      <Badge variant="outline">
                        {c.applies_to === 'all' ? 'Ambos' : c.applies_to === 'varejo' ? 'Varejo' : 'Atacado'}
                      </Badge>
                      {!c.is_active && <Badge variant="destructive">Inativo</Badge>}
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c.id, c.is_active)} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id, c.code)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsManager;