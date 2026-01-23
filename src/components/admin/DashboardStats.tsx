import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Mail, Clock, CheckCircle, AlertCircle, Users, TrendingUp, Calendar } from "lucide-react";

interface DashboardStats {
  sacPending: number;
  sacResolved: number;
  sacInProgress: number;
  sacTotal: number;
  subscribersTotal: number;
  subscribersNew7Days: number;
  subscribersNew30Days: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    sacPending: 0,
    sacResolved: 0,
    sacInProgress: 0,
    sacTotal: 0,
    subscribersTotal: 0,
    subscribersNew7Days: 0,
    subscribersNew30Days: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // SAC Stats
        const { count: sacPending } = await supabase
          .from('sac_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente');

        const { count: sacResolved } = await supabase
          .from('sac_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolvido');

        const { count: sacInProgress } = await supabase
          .from('sac_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'em_andamento');

        const { count: sacTotal } = await supabase
          .from('sac_tickets')
          .select('*', { count: 'exact', head: true });

        // Newsletter Stats
        const { count: subscribersTotal } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: subscribersNew7Days } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .gte('subscribed_at', sevenDaysAgo.toISOString())
          .eq('is_active', true);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: subscribersNew30Days } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .gte('subscribed_at', thirtyDaysAgo.toISOString())
          .eq('is_active', true);

        setStats({
          sacPending: sacPending || 0,
          sacResolved: sacResolved || 0,
          sacInProgress: sacInProgress || 0,
          sacTotal: sacTotal || 0,
          subscribersTotal: subscribersTotal || 0,
          subscribersNew7Days: subscribersNew7Days || 0,
          subscribersNew30Days: subscribersNew30Days || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu painel de controle
        </p>
      </div>

      {/* SAC Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SAC - Atendimento ao Cliente
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.sacPending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando atendimento
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.sacInProgress}</div>
              <p className="text-xs text-muted-foreground">
                Sendo processados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.sacResolved}</div>
              <p className="text-xs text-muted-foreground">
                Tickets finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.sacTotal}</div>
              <p className="text-xs text-muted-foreground">
                Todos os tickets
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Newsletter - Inscritos
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscritos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.subscribersTotal}</div>
              <p className="text-xs text-muted-foreground">
                Inscritos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Últimos 7 dias</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">+{stats.subscribersNew7Days}</div>
              <p className="text-xs text-muted-foreground">
                Novos inscritos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Últimos 30 dias</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">+{stats.subscribersNew30Days}</div>
              <p className="text-xs text-muted-foreground">
                Novos inscritos no mês
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Summary */}
      {stats.sacPending > 0 && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Atenção Necessária
            </CardTitle>
            <CardDescription>
              Você tem <strong>{stats.sacPending}</strong> ticket(s) pendente(s) aguardando atendimento.
              Acesse a aba "SAC - Atendimento" para gerenciá-los.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default DashboardStats;
