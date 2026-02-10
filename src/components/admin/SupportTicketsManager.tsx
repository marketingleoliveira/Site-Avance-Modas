import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HeadphonesIcon,
  Loader2,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Bell,
  ShoppingCart,
  CreditCard,
  Ruler,
  Package,
  Archive,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupportTicket {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string | null;
  product_handle: string | null;
  product_title: string | null;
  issue_type: string;
  description: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  session_id: string | null;
}

interface TicketNote {
  id: string;
  ticket_id: string;
  author_id: string;
  author_email: string;
  content: string;
  action_taken: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  aberto: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  em_atendimento: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  aguardando_cliente: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolvido: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  aguardando_cliente: "Aguardando Cliente",
  resolvido: "Resolvido",
};

const issueTypeIcons: Record<string, typeof ShoppingCart> = {
  compra: ShoppingCart,
  pagamento: CreditCard,
  tamanho: Ruler,
  produto: Package,
  estoque: Archive,
  outro: HelpCircle,
};

const issueTypeLabels: Record<string, string> = {
  compra: "Dificuldade na compra",
  pagamento: "Problema com pagamento",
  tamanho: "Dúvida sobre tamanho",
  produto: "Dúvida sobre produto",
  estoque: "Disponibilidade",
  outro: "Outro",
};

const SupportTicketsManager = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  const [ticketNotes, setTicketNotes] = useState<TicketNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets((data as SupportTicket[]) || []);
      setNewTicketsCount((data as SupportTicket[])?.filter((t) => t.status === "aberto").length || 0);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      toast.error("Erro ao carregar tickets de suporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("support_tickets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTicket = payload.new as SupportTicket;
            setTickets((prev) => [newTicket, ...prev]);
            setNewTicketsCount((prev) => prev + 1);
            toast.info(`Novo ticket de suporte: ${newTicket.customer_name}`, {
              description: newTicket.description.substring(0, 50) + "...",
            });
          } else if (payload.eventType === "UPDATE") {
            setTickets((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as SupportTicket) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openTicketDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAdminResponse(ticket.admin_response || "");
    setNewStatus(ticket.status);
    setIsDialogOpen(true);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        admin_response: adminResponse,
      };

      if (newStatus === "resolvido" && selectedTicket.status !== "resolvido") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", selectedTicket.id);

      if (error) throw error;

      toast.success("Ticket atualizado com sucesso!");
      setIsDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Erro ao atualizar ticket");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Tem certeza que deseja excluir este ticket?")) return;

    try {
      const { error } = await supabase.from("support_tickets").delete().eq("id", ticketId);

      if (error) throw error;

      toast.success("Ticket excluído com sucesso!");
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Erro ao excluir ticket");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.product_title && ticket.product_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    aberto: tickets.filter((t) => t.status === "aberto").length,
    em_atendimento: tickets.filter((t) => t.status === "em_atendimento").length,
    resolvido: tickets.filter((t) => t.status === "resolvido").length,
  };

  return (
    <div className="space-y-6">
      {/* Header with realtime indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeadphonesIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Suporte em Tempo Real</h2>
          <div className="flex items-center gap-1 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">Ao vivo</span>
          </div>
        </div>
        {newTicketsCount > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            <Bell className="w-3 h-3 mr-1" />
            {newTicketsCount} novo{newTicketsCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Abertos</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.aberto}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">Em Atendimento</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.em_atendimento}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Resolvidos</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolvido}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
            <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
            <SelectItem value="resolvido">Resolvido</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchTickets}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <HeadphonesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum ticket de suporte encontrado</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const IssueIcon = issueTypeIcons[ticket.issue_type] || HelpCircle;
                const isNew = ticket.status === "aberto";
                return (
                  <TableRow key={ticket.id} className={isNew ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <TableCell>
                      <IssueIcon className="w-5 h-5 text-primary" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {ticket.customer_name}
                          {isNew && (
                            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                              NOVO
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{ticket.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ticket.product_title ? (
                        <p className="text-sm truncate max-w-[150px]">{ticket.product_title}</p>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status] || ""}>
                        {statusLabels[ticket.status] || ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openTicketDetails(ticket)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Ticket Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5 text-primary" />
              Ticket de Suporte
            </DialogTitle>
            <DialogDescription>
              {selectedTicket &&
                format(new Date(selectedTicket.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedTicket.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedTicket.customer_email}</p>
                </div>
                {selectedTicket.customer_whatsapp && (
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{selectedTicket.customer_whatsapp}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de Problema</p>
                  <p className="font-medium">
                    {issueTypeLabels[selectedTicket.issue_type] || selectedTicket.issue_type}
                  </p>
                </div>
              </div>

              {/* Product Info */}
              {selectedTicket.product_title && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Produto Relacionado</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{selectedTicket.product_title}</p>
                    {selectedTicket.product_handle && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/produto/${selectedTicket.product_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver Produto
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm font-medium mb-2">Descrição do Problema</p>
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 border-t pt-4">
                <div>
                  <p className="text-sm font-medium mb-2">Status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                      <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Resposta / Notas do Atendimento</p>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Adicione notas sobre o atendimento ou a resposta enviada ao cliente..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleUpdateTicket} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketsManager;
