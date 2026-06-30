import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  category: string;
  tags: string[];
  reading_minutes: number;
  published: boolean;
  hero_image: string | null;
  related_slugs: string[];
  faq: Array<{ q: string; a: string }>;
  published_at: string | null;
  updated_at: string;
}

const empty = (): Partial<Guide> => ({
  slug: "",
  title: "",
  excerpt: "",
  body_md: "",
  category: "fitness",
  tags: [],
  reading_minutes: 5,
  published: false,
  related_slugs: [],
  faq: [],
});

const GuidesManager = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Guide> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setGuides((data as Guide[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    if (!editing.slug || !editing.title || !editing.excerpt || !editing.body_md) {
      toast.error("Preencha slug, título, resumo e conteúdo.");
      return;
    }
    setSaving(true);
    const payload = {
      ...editing,
      tags: editing.tags ?? [],
      related_slugs: editing.related_slugs ?? [],
      faq: editing.faq ?? [],
      published_at: editing.published ? new Date().toISOString() : null,
    };
    const { error } = editing.id
      ? await supabase.from("guides").update(payload).eq("id", editing.id)
      : await supabase.from("guides").insert(payload as never);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Guia salvo");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este guia?")) return;
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Guia excluído");
    load();
  }

  if (loading) return <Loader2 className="w-6 h-6 animate-spin" />;

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Slug</Label>
            <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Título</Label>
          <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        </div>
        <div>
          <Label>Resumo (excerpt)</Label>
          <Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
        </div>
        <div>
          <Label>Conteúdo (Markdown)</Label>
          <Textarea rows={16} value={editing.body_md ?? ""} onChange={(e) => setEditing({ ...editing, body_md: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Tempo de leitura (min)</Label>
            <Input type="number" value={editing.reading_minutes ?? 5} onChange={(e) => setEditing({ ...editing, reading_minutes: Number(e.target.value) || 5 })} />
          </div>
          <div>
            <Label>Tags (separadas por vírgula)</Label>
            <Input value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          </div>
          <div>
            <Label>Slugs relacionados (vírgula)</Label>
            <Input value={(editing.related_slugs ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, related_slugs: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={!!editing.published} onCheckedChange={(c) => setEditing({ ...editing, published: c })} />
          <Label>Publicado</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}</Button>
          <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{guides.length} guia(s)</p>
        <Button onClick={() => setEditing(empty())}><Plus className="w-4 h-4 mr-2" />Novo guia</Button>
      </div>
      <ul className="divide-y border rounded-md">
        {guides.map((g) => (
          <li key={g.id} className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{g.title}</p>
              <p className="text-xs text-muted-foreground truncate">/guias/{g.slug} · {g.category} · {g.published ? "publicado" : "rascunho"}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setEditing(g)}>Editar</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(g.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuidesManager;