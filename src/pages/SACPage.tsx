import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  HelpCircle,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sacSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  whatsapp: z.string().trim().max(20, "WhatsApp muito longo").optional(),
  order_number: z.string().trim().max(50, "Número do pedido muito longo").optional(),
  ticket_type: z.enum(["reclamacao", "sugestao", "elogio", "duvida"]),
  subject: z.string().trim().min(3, "Assunto deve ter pelo menos 3 caracteres").max(200, "Assunto muito longo"),
  message: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(2000, "Mensagem muito longa"),
});

type SACFormData = z.infer<typeof sacSchema>;

const ticketTypes = [
  {
    id: "reclamacao",
    label: "Reclamação",
    description: "Problemas com produtos ou serviços",
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    selectedBg: "bg-red-100 dark:bg-red-900/50",
  },
  {
    id: "sugestao",
    label: "Sugestão",
    description: "Ideias para melhorias",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    selectedBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    id: "elogio",
    label: "Elogio",
    description: "Reconheça nosso trabalho",
    icon: ThumbsUp,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    selectedBg: "bg-green-100 dark:bg-green-900/50",
  },
  {
    id: "duvida",
    label: "Dúvida",
    description: "Tire suas dúvidas",
    icon: HelpCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    selectedBg: "bg-amber-100 dark:bg-amber-900/50",
  },
];

const SACPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SACFormData>({
    resolver: zodResolver(sacSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      order_number: "",
      ticket_type: "reclamacao",
      subject: "",
      message: "",
    },
  });

  const selectedType = form.watch("ticket_type");

  const onSubmit = async (data: SACFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("sac_tickets").insert({
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp || null,
        order_number: data.order_number || null,
        ticket_type: data.ticket_type,
        subject: data.subject,
        message: data.message,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Error submitting SAC ticket:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Solicitação Enviada!</h1>
            <p className="text-muted-foreground">
              Sua solicitação foi registrada com sucesso. Nossa equipe analisará e retornará em até 48 horas úteis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Voltar
              </Button>
              <Button onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}>
                Nova Solicitação
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-12 md:py-16">
        <div className="container text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Central de Atendimento</h1>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Sua opinião é muito importante para nós. Estamos aqui para ouvir você!
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
            <MessageSquare className="w-4 h-4" />
            Responderemos em até 48 horas úteis
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-3xl">
          {/* Info Box */}
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 mb-8">
            <p className="text-sm text-foreground">
              <strong>Como funciona:</strong> Preencha o formulário abaixo com suas informações e descreva detalhadamente sua solicitação. Nossa equipe analisará e retornará o mais breve possível.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Contact Info */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Informações de Contato</h2>
                    <p className="text-sm text-muted-foreground">Seus dados para retorno</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Pedido</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: #12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Ticket Type */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Tipo de Solicitação</h2>
                    <p className="text-sm text-muted-foreground">Selecione o motivo do seu contato</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="ticket_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {ticketTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = field.value === type.id;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => field.onChange(type.id)}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                                  type.bgColor,
                                  type.borderColor,
                                  isSelected && type.selectedBg,
                                  isSelected && "ring-2 ring-primary ring-offset-2"
                                )}
                              >
                                <Icon className={cn("w-6 h-6", type.color)} />
                                <span className="font-medium text-sm text-foreground">{type.label}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight hidden md:block">
                                  {type.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 3: Details */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Detalhes da Solicitação</h2>
                    <p className="text-sm text-muted-foreground">Descreva sua solicitação com o máximo de detalhes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Resumo da sua solicitação" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva detalhadamente sua solicitação..."
                            className="min-h-[150px] resize-none"
                            maxLength={2000}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <span className="text-xs text-muted-foreground">
                            {field.value.length}/2000 caracteres
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-xs text-muted-foreground text-center">
                Ao enviar este formulário, você concorda com nossa{" "}
                <span className="text-primary hover:underline cursor-pointer">Política de Privacidade</span>.
                Seus dados serão utilizados exclusivamente para atender sua solicitação.
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitação"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SACPage;
