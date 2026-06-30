import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, RefreshCw, Search } from "lucide-react";

interface SiteEntry {
  siteUrl: string;
  permissionLevel: string;
}

interface AnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const DEFAULT_SITE = "https://avancemodas.com.br/";

async function callGsc(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("gsc-proxy", {
    body: { action, ...body },
  });
  if (error) throw error;
  return data as { ok: boolean; status: number; data: unknown };
}

const SearchConsoleDashboard = () => {
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [siteUrl, setSiteUrl] = useState(DEFAULT_SITE);
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState<AnalyticsRow[]>([]);
  const [pages, setPages] = useState<AnalyticsRow[]>([]);
  const [inspectUrl, setInspectUrl] = useState(DEFAULT_SITE);
  const [inspectResult, setInspectResult] = useState<unknown>(null);
  const [days, setDays] = useState(28);

  const range = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(start), endDate: fmt(end) };
  }, [days]);

  async function loadSites() {
    try {
      const res = await callGsc("list_sites");
      const list = (res.data as { siteEntry?: SiteEntry[] })?.siteEntry ?? [];
      setSites(list);
      if (list.length && !list.find((s) => s.siteUrl === siteUrl)) {
        setSiteUrl(list[0].siteUrl);
      }
    } catch (e) {
      toast.error("Falha ao listar sites do Search Console", {
        description: (e as Error).message,
      });
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const [q, p] = await Promise.all([
        callGsc("search_analytics", {
          siteUrl,
          payload: { ...range, dimensions: ["query"], rowLimit: 25 },
        }),
        callGsc("search_analytics", {
          siteUrl,
          payload: { ...range, dimensions: ["page"], rowLimit: 25 },
        }),
      ]);
      setQueries(((q.data as { rows?: AnalyticsRow[] })?.rows) ?? []);
      setPages(((p.data as { rows?: AnalyticsRow[] })?.rows) ?? []);
    } catch (e) {
      toast.error("Falha ao consultar dados", {
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function inspect() {
    try {
      const res = await callGsc("inspect_url", {
        payload: { inspectionUrl: inspectUrl, siteUrl },
      });
      setInspectResult(res.data);
    } catch (e) {
      toast.error("Falha ao inspecionar URL", { description: (e as Error).message });
    }
  }

  useEffect(() => {
    loadSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <Label>Propriedade (siteUrl)</Label>
          <select
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="w-full mt-1 border rounded-md h-10 px-3 bg-background text-sm"
          >
            {!sites.length && <option value={DEFAULT_SITE}>{DEFAULT_SITE}</option>}
            {sites.map((s) => (
              <option key={s.siteUrl} value={s.siteUrl}>
                {s.siteUrl} ({s.permissionLevel})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Período (dias)</Label>
          <Input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 28)}
            className="w-24 mt-1"
          />
        </div>
        <Button onClick={loadData} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Atualizar
        </Button>
        <Button variant="outline" onClick={loadSites}>
          Recarregar sites
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ResultTable title="Principais consultas" rows={queries} keyLabel="Consulta" />
        <ResultTable title="Páginas mais acessadas" rows={pages} keyLabel="Página" />
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Search className="w-4 h-4" /> Inspecionar URL
        </h3>
        <div className="flex gap-2">
          <Input
            value={inspectUrl}
            onChange={(e) => setInspectUrl(e.target.value)}
            placeholder="https://avancemodas.com.br/varejo"
          />
          <Button onClick={inspect}>Inspecionar</Button>
        </div>
        {inspectResult ? (
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-80">
            {JSON.stringify(inspectResult, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-muted-foreground">
            Consulta indexação, cobertura, usabilidade móvel e rich results de uma URL específica.
          </p>
        )}
      </div>
    </div>
  );
};

const ResultTable = ({
  title,
  rows,
  keyLabel,
}: {
  title: string;
  rows: AnalyticsRow[];
  keyLabel: string;
}) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-semibold mb-3">{title}</h3>
    {rows.length === 0 ? (
      <p className="text-xs text-muted-foreground">Sem dados ainda. Clique em Atualizar.</p>
    ) : (
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-2 pr-2">{keyLabel}</th>
              <th className="py-2 px-2 text-right">Cliques</th>
              <th className="py-2 px-2 text-right">Impr.</th>
              <th className="py-2 px-2 text-right">CTR</th>
              <th className="py-2 pl-2 text-right">Pos.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 pr-2 truncate max-w-[260px]">{r.keys?.[0]}</td>
                <td className="py-2 px-2 text-right">{r.clicks}</td>
                <td className="py-2 px-2 text-right">{r.impressions}</td>
                <td className="py-2 px-2 text-right">{(r.ctr * 100).toFixed(1)}%</td>
                <td className="py-2 pl-2 text-right">{r.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default SearchConsoleDashboard;