import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Star, Save, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  location: string | null;
  product_name: string | null;
  is_active: boolean;
  display_order: number;
  source: string | null;
}

const emptyForm = {
  customer_name: "",
  rating: 5,
  comment: "",
  location: "",
  product_name: "",
  display_order: 0,
};

const TestimonialsManager = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar depoimentos");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!form.customer_name.trim() || !form.comment.trim()) {
      toast.error("Nome e comentário são obrigatórios");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("testimonials").insert({
      customer_name: form.customer_name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      location: form.location.trim() || null,
      product_name: form.product_name.trim() || null,
      display_order: form.display_order || items.length + 1,
      source: "manual",
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao adicionar depoimento");
    } else {
      toast.success("Depoimento adicionado!");
      setForm(emptyForm);
      load();
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_active: !current })
      .eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else load();
  };

  const handleUpdate = async (item: Testimonial) => {
    const { error } = await supabase
      .from("testimonials")
      .update({
        customer_name: item.customer_name,
        rating: item.rating,
        comment: item.comment,
        location: item.location,
        product_name: item.product_name,
        display_order: item.display_order,
      })
      .eq("id", item.id);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Depoimento atualizado!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Depoimento excluído");
      load();
    }
  };

  const updateLocal = (id: string, patch: Partial<Testimonial>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            Adicionar Novo Depoimento
          </CardTitle>
          <CardDescription>
            Os depoimentos ativos aparecem na home e nas páginas de categoria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome da Cliente *</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="Ex: Juliana M."
                maxLength={100}
              />
            </div>
            <div>
              <Label>Localização</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: São Paulo - SP"
                maxLength={100}
              />
            </div>
            <div>
              <Label>Produto (opcional)</Label>
              <Input
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                placeholder="Ex: Legging Cintura Alta"
                maxLength={100}
              />
            </div>
            <div>
              <Label>Nota (1 a 5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) })
                }
              />
            </div>
          </div>
          <div>
            <Label>Comentário *</Label>
            <Textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Escreva o depoimento da cliente..."
              rows={4}
              maxLength={500}
            />
          </div>
          <Button onClick={handleAdd} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adicionar Depoimento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Depoimentos Cadastrados ({items.length})</CardTitle>
          <CardDescription>
            Edite, ative/desative ou exclua depoimentos existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum depoimento cadastrado.</div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={() => handleToggleActive(item.id, item.is_active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.is_active ? "Ativo" : "Inativo"}
                      </span>
                      {item.source === "shopee" && (
                        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-semibold">
                          SHOPEE
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleUpdate(item)} className="gap-1">
                        <Save className="w-3 h-3" /> Salvar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      value={item.customer_name}
                      onChange={(e) => updateLocal(item.id, { customer_name: e.target.value })}
                      placeholder="Nome"
                    />
                    <Input
                      value={item.location || ""}
                      onChange={(e) => updateLocal(item.id, { location: e.target.value })}
                      placeholder="Localização"
                    />
                    <Input
                      value={item.product_name || ""}
                      onChange={(e) => updateLocal(item.id, { product_name: e.target.value })}
                      placeholder="Produto"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={item.rating}
                        onChange={(e) =>
                          updateLocal(item.id, {
                            rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)),
                          })
                        }
                        placeholder="Nota"
                      />
                      <Input
                        type="number"
                        value={item.display_order}
                        onChange={(e) =>
                          updateLocal(item.id, { display_order: parseInt(e.target.value) || 0 })
                        }
                        placeholder="Ordem"
                      />
                    </div>
                  </div>
                  <Textarea
                    value={item.comment}
                    onChange={(e) => updateLocal(item.id, { comment: e.target.value })}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialsManager;