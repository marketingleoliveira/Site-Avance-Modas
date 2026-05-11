import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  HelpCircle,
  Loader2,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Download,
  FileImage,
  FileText,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Convert a stored attachment reference (legacy public URL or new storage path)
// into a short-lived signed URL that admins can open.
const resolveAttachmentUrl = async (ref: string): Promise<string> => {
  let path = ref;
  const marker = "/sac-attachments/";
  const idx = ref.indexOf(marker);
  if (idx !== -1) {
    path = ref.substring(idx + marker.length);
  }
  const { data, error } = await supabase.storage
    .from("sac-attachments")
    .createSignedUrl(path, 60 * 10); // 10 minutes
  if (error || !data) return ref;
  return data.signedUrl;
};

const getAttachmentIcon = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
    return <FileImage className="w-4 h-4 text-blue-500" />;
  }
  return <FileText className="w-4 h-4 text-orange-500" />;
};

const getAttachmentName = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1].split("?")[0];
};

interface SACTicket {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  order_number: string | null;
  ticket_type: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  em_andamento: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolvido: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

const typeIcons: Record<string, typeof AlertCircle> = {
  reclamacao: AlertCircle,
  sugestao: MessageSquare,
  elogio: ThumbsUp,
  duvida: HelpCircle,
};

const typeLabels: Record<string, string> = {
  reclamacao: "Reclamação",
  sugestao: "Sugestão",
  elogio: "Elogio",
  duvida: "Dúvida",
};

const typeColors: Record<string, string> = {
  reclamacao: "text-red-500",
  sugestao: "text-blue-500",
  elogio: "text-green-500",
  duvida: "text-amber-500",
};

const SACManager = () => {
  const [tickets, setTickets] = useState<SACTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SACTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [signedAttachments, setSignedAttachments] = useState<string[]>([]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sac_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketDetails = async (ticket: SACTicket) => {
    setSelectedTicket(ticket);
    setAdminNotes(ticket.admin_notes || "");
    setNewStatus(ticket.status);
    setIsDialogOpen(true);
    if (ticket.attachments && ticket.attachments.length > 0) {
      const signed = await Promise.all(
        ticket.attachments.map((ref) => resolveAttachmentUrl(ref))
      );
      setSignedAttachments(signed);
    } else {
      setSignedAttachments([]);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("sac_tickets")
        .update({
          status: newStatus,
          admin_notes: adminNotes,
        })
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
      const { error } = await supabase
        .from("sac_tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;

      toast.success("Ticket excluído com sucesso!");
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Erro ao excluir ticket");
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Nome", "Email", "WhatsApp", "Pedido", "Tipo", "Assunto", "Mensagem", "Status", "Data"];
    const csvContent = [
      headers.join(","),
      ...filteredTickets.map((t) =>
        [
          t.id,
          `"${t.name}"`,
          t.email,
          t.whatsapp || "",
          t.order_number || "",
          typeLabels[t.ticket_type] || t.ticket_type,
          `"${t.subject}"`,
          `"${t.message.replace(/"/g, '""')}"`,
          statusLabels[t.status] || t.status,
          format(new Date(t.created_at), "dd/MM/yyyy HH:mm"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sac-tickets-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.order_number && ticket.order_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesType = typeFilter === "all" || ticket.ticket_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: tickets.length,
    pendente: tickets.filter((t) => t.status === "pendente").length,
    em_andamento: tickets.filter((t) => t.status === "em_andamento").length,
    resolvido: tickets.filter((t) => t.status === "resolvido").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">Pendentes</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pendente}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">Em Andamento</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.em_andamento}</p>
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
            placeholder="Buscar por nome, email, assunto..."
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
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="resolvido">Resolvido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="reclamacao">Reclamação</SelectItem>
            <SelectItem value="sugestao">Sugestão</SelectItem>
            <SelectItem value="elogio">Elogio</SelectItem>
            <SelectItem value="duvida">Dúvida</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchTickets}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const TypeIcon = typeIcons[ticket.ticket_type] || AlertCircle;
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <TypeIcon className={`w-5 h-5 ${typeColors[ticket.ticket_type] || "text-muted-foreground"}`} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{ticket.name}</p>
                        <p className="text-xs text-muted-foreground">{ticket.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm truncate max-w-[200px]">{ticket.subject}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status] || ""}>
                        {statusLabels[ticket.status] || ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openTicketDetails(ticket)}
                        >
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
              {selectedTicket && (
                <>
                  {(() => {
                    const TypeIcon = typeIcons[selectedTicket.ticket_type] || AlertCircle;
                    return <TypeIcon className={`w-5 h-5 ${typeColors[selectedTicket.ticket_type]}`} />;
                  })()}
                  {typeLabels[selectedTicket.ticket_type]} - {selectedTicket.subject}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTicket && format(new Date(selectedTicket.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedTicket.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedTicket.email}</p>
                </div>
                {selectedTicket.whatsapp && (
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{selectedTicket.whatsapp}</p>
                  </div>
                )}
                {selectedTicket.order_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido</p>
                    <p className="font-medium">{selectedTicket.order_number}</p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Anexos ({selectedTicket.attachments.length})
                  </p>
                   <div className="grid grid-cols-2 gap-2">
                    {selectedTicket.attachments.map((origRef, index) => {
                      const url = signedAttachments[index] || origRef;
                      const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                        >
                          {isImage ? (
                            <img
                              src={url}
                              alt={`Anexo ${index + 1}`}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            getAttachmentIcon(url)
                          )}
                          <span className="flex-1 text-xs truncate">
                            {getAttachmentName(origRef)}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-sm font-medium mb-2">Mensagem</p>
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedTicket.message}
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
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Notas do Administrador</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione notas internas sobre este ticket..."
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

export default SACManager;
