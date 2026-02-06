import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, HeadphonesIcon, CheckCircle } from "lucide-react";

const ticketSchema = z.object({
  customer_name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  customer_email: z.string().trim().email("E-mail inválido").max(255),
  customer_whatsapp: z.string().optional(),
  issue_type: z.string().min(1, "Selecione o tipo de problema"),
  description: z.string().trim().min(10, "Descreva seu problema com mais detalhes").max(1000),
});

interface SupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productHandle?: string;
  productTitle?: string;
}

const issueTypes = [
  { value: "compra", label: "Dificuldade na compra" },
  { value: "pagamento", label: "Problema com pagamento" },
  { value: "tamanho", label: "Dúvida sobre tamanho" },
  { value: "produto", label: "Dúvida sobre produto" },
  { value: "estoque", label: "Disponibilidade de estoque" },
  { value: "outro", label: "Outro" },
];

const SupportTicketModal = ({
  open,
  onOpenChange,
  productHandle,
  productTitle,
}: SupportTicketModalProps) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_whatsapp: "",
    issue_type: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = ticketSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await supabase.from("support_tickets").insert({
        customer_name: result.data.customer_name,
        customer_email: result.data.customer_email,
        customer_whatsapp: result.data.customer_whatsapp || null,
        issue_type: result.data.issue_type,
        description: result.data.description,
        product_handle: productHandle || null,
        product_title: productTitle || null,
        session_id: sessionId,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Solicitação enviada! Nossa equipe entrará em contato em breve.");

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          customer_name: "",
          customer_email: "",
          customer_whatsapp: "",
          issue_type: "",
          description: "",
        });
        onOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsSuccess(false);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Solicitação Enviada!</h3>
            <p className="text-muted-foreground">
              Nossa equipe recebeu sua solicitação e entrará em contato em breve.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HeadphonesIcon className="w-5 h-5 text-primary" />
                Solicitar Ajuda
              </DialogTitle>
              <DialogDescription>
                Preencha o formulário abaixo e nossa equipe entrará em contato para ajudá-lo.
              </DialogDescription>
            </DialogHeader>

            {productTitle && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Produto: </span>
                <span className="font-medium">{productTitle}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Seu nome *"
                  value={formData.customer_name}
                  onChange={(e) => handleChange("customer_name", e.target.value)}
                  disabled={isLoading}
                  className={errors.customer_name ? "border-destructive" : ""}
                />
                {errors.customer_name && (
                  <p className="text-xs text-destructive mt-1">{errors.customer_name}</p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Seu e-mail *"
                  value={formData.customer_email}
                  onChange={(e) => handleChange("customer_email", e.target.value)}
                  disabled={isLoading}
                  className={errors.customer_email ? "border-destructive" : ""}
                />
                {errors.customer_email && (
                  <p className="text-xs text-destructive mt-1">{errors.customer_email}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="WhatsApp (opcional)"
                  value={formData.customer_whatsapp}
                  onChange={(e) => handleChange("customer_whatsapp", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Select
                  value={formData.issue_type}
                  onValueChange={(value) => handleChange("issue_type", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.issue_type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Tipo de problema *" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.issue_type && (
                  <p className="text-xs text-destructive mt-1">{errors.issue_type}</p>
                )}
              </div>

              <div>
                <Textarea
                  placeholder="Descreva seu problema ou dúvida *"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={isLoading}
                  className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitação"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketModal;
