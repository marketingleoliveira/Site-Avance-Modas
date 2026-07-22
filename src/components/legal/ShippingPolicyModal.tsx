import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Truck } from "lucide-react";

interface ShippingPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShippingPolicyModal = ({ open, onOpenChange }: ShippingPolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Política de Entrega
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="text-xs text-muted-foreground/70 space-y-1">
              <p>Última atualização: Julho de 2026</p>
              <p className="font-medium">AVANCE MODAS - CNPJ: 61.705.129/0001-90</p>
            </div>

            <section className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-foreground font-medium mb-2">Resumo das Condições de Frete</p>
              <p>
                O frete é calculado de acordo com o peso e volume da mercadoria, sendo informado antes da finalização do pedido. 
                Trabalhamos com entregas realizadas via transportadora e correios, os prazos também serão informados antes da 
                finalização do pedido e nos e-mails transacionais. Nas compras, acima de R$ 149,00 para o Sudeste e R$ 250,00 
                para as outras regiões.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Prazo de Entrega</h3>
              <p>
                O prazo de entrega começa a ser contato a partir do despacho da mercadoria, assim que o pedido é faturado.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Tentativas de Entrega</h3>
              <p>
                Serão feitas três tentativas de entrega no endereço informado pelo cliente. Caso a entrega não seja realizada 
                por ausência do cliente ou endereço incorreto, a mercadoria irá retornar para a nossa sede.
              </p>
              <p className="mt-2">
                Nestes casos o custo de reenvio será de inteira responsabilidade do cliente.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Rastreamento</h3>
              <p>
                Para um melhor controle do processo de entrega, enviamos o código de rastreamento para o e-mail cadastrado 
                após a postagem da mercadoria. O acompanhamento da mercadoria através do código de rastreamento é de 
                responsabilidade do cliente. E pode ser feito em nosso site.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">4. Dúvidas</h3>
              <p>
                Caso você ainda tenha alguma dúvida sobre o assunto, entre em contato com nosso Setor de Atendimento ao cliente. 
                Estamos à disposição para esclarecê-la.
              </p>
            </section>

            <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-xs text-amber-900 dark:text-amber-200">
                <strong>* Informativo Fiscal:</strong> Em virtude da emenda constitucional 87/2015 as mercadorias enviadas 
                para o estado do Ceará poderão sofrer atrasos na entrega. Devido à retenção de mercadoria pelos órgãos 
                competentes para o recolhimento de guia de ICMS antecipado. Clientes deste estado deverão considerar o 
                tempo de entrega anunciado no site no ato da compra, desconsiderando o tempo em que a mercadoria ficará 
                parada no posto fiscal. Em caso de dúvidas, entre em contato com nossa central de atendimento.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingPolicyModal;
