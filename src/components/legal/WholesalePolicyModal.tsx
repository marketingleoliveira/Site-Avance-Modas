import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

interface WholesalePolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WholesalePolicyModal = ({ open, onOpenChange }: WholesalePolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Políticas de Atacado
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="text-xs text-muted-foreground/70 space-y-1">
              <p>Última atualização: Janeiro de 2026</p>
              <p className="font-medium">AVANCE MODAS - CNPJ: 61.705.129/0001-90</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-300 font-medium text-sm">
                ⚠️ ATENÇÃO: A área de ATACADO é exclusiva para lojistas, revendedores e 
                pessoas jurídicas. A compra no atacado para uso pessoal ou revenda informal 
                configura infração às políticas da empresa e à legislação brasileira.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-foreground text-sm">
                📦 Composição de Valores e Custos Logísticos
              </p>
              <p className="text-xs">
                Os valores apresentados para produtos e frete podem sofrer ajustes na composição
                final do pedido em função da região de entrega, modalidade de transporte escolhida
                e custos operacionais envolvidos no processo logístico, incluindo separação,
                conferência, embalagem e coleta da transportadora.
              </p>
              <p className="text-xs">
                Dessa forma, os valores individuais de produtos e frete poderão ser redistribuídos
                ou ajustados, sem necessariamente representar alteração no valor total do pedido
                aprovado pelo cliente.
              </p>
              <p className="text-xs">
                O valor final do pedido será sempre informado e confirmado previamente antes da
                conclusão da compra e emissão do faturamento.
              </p>
            </div>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Definição de Venda por Atacado</h3>
              <p>
                Conforme a legislação brasileira (Lei nº 5.474/68 e Código Civil, Art. 710), 
                a venda por atacado caracteriza-se pela comercialização de produtos em grandes 
                quantidades, destinados à revenda por comerciantes estabelecidos, pessoas jurídicas 
                ou profissionais autônomos devidamente registrados.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Requisitos para Compra no Atacado</h3>
              <p>Para efetuar compras na modalidade atacado, o cliente deve:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Possuir CNPJ ativo com atividade de comércio varejista ou similar</li>
                <li>Destinar os produtos exclusivamente para revenda comercial</li>
                <li>Cumprir o pedido mínimo estabelecido pela empresa</li>
                <li>Concordar integralmente com estas políticas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Vedações e Proibições</h3>
              <p className="font-medium text-foreground">É expressamente PROIBIDO:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Adquirir produtos no atacado para uso pessoal ou consumo próprio</li>
                <li>Utilizar CNPJ de terceiros para obter preços de atacado</li>
                <li>Fracionar pedidos para burlar o valor mínimo estabelecido</li>
                <li>Revender produtos em plataformas de marketplace sem autorização</li>
                <li>Praticar concorrência desleal ou revenda abaixo do preço sugerido</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">4. Fiscalização e Penalidades</h3>
              <p>
                A AVANCE MODAS reserva-se o direito de:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Solicitar comprovação de CNPJ e atividade comercial a qualquer momento</li>
                <li>Cancelar pedidos suspeitos de fraude ou uso indevido</li>
                <li>Bloquear permanentemente cadastros que violem estas políticas</li>
                <li>Cobrar a diferença de preço entre atacado e varejo em caso de fraude comprovada</li>
                <li>Adotar medidas judiciais cabíveis, incluindo reparação por danos</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">5. Fundamentação Legal</h3>
              <p>Estas políticas estão fundamentadas em:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Código Civil Brasileiro (Lei 10.406/2002)</strong> - Arts. 421, 422 e 710</li>
                <li><strong>Código de Defesa do Consumidor (Lei 8.078/90)</strong> - Art. 2º (definição de consumidor)</li>
                <li><strong>Lei de Duplicatas (Lei 5.474/68)</strong> - Caracterização de venda mercantil</li>
                <li><strong>Lei de Crimes Contra a Ordem Tributária (Lei 8.137/90)</strong> - Arts. 1º e 2º</li>
                <li><strong>Código Tributário Nacional (Lei 5.172/66)</strong> - Obrigações fiscais</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">6. Política de Trocas no Atacado</h3>
              <p>
                Conforme prática comercial B2B (business-to-business), as trocas de mercadorias 
                adquiridas no atacado são aceitas <strong>EXCLUSIVAMENTE</strong> em casos de:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Defeito de fabricação comprovado</li>
                <li>Divergência entre produto entregue e pedido realizado</li>
                <li>Avaria durante o transporte (mediante laudo da transportadora)</li>
              </ul>
              <p className="mt-2 text-amber-700 dark:text-amber-400 font-medium">
                Não são aceitas trocas por arrependimento, tamanho, cor ou qualquer outra 
                preferência pessoal em compras de atacado.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">7. Frete e Entrega</h3>
              <p>
                O frete grátis é concedido apenas para pedidos acima de R$ 1.500,00. 
                Pedidos abaixo deste valor terão o frete calculado conforme tabela da transportadora.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">8. Declaração de Ciência</h3>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-foreground">
                  Ao realizar uma compra na seção de ATACADO, o cliente declara estar ciente 
                  de que se enquadra como pessoa jurídica ou profissional autônomo com atividade 
                  de revenda, assumindo integral responsabilidade civil, tributária e penal 
                  pela veracidade das informações prestadas.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">9. Composição de Valores e Custos Logísticos</h3>
              <p>
                Os valores apresentados para produtos e frete podem sofrer ajustes na composição
                final do pedido em função da região de entrega, modalidade de transporte escolhida
                e custos operacionais envolvidos no processo logístico, incluindo separação,
                conferência, embalagem e coleta da transportadora.
              </p>
              <p className="mt-2">
                Dessa forma, os valores individuais de produtos e frete poderão ser redistribuídos
                ou ajustados, sem necessariamente representar alteração no valor total do pedido
                aprovado pelo cliente.
              </p>
              <p className="mt-2">
                O valor final do pedido será sempre informado e confirmado previamente antes da
                conclusão da compra e emissão do faturamento.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">10. Foro e Jurisdição</h3>
              <p>
                Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer 
                controvérsias oriundas destas políticas, com renúncia expressa a qualquer outro, 
                por mais privilegiado que seja.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">11. Contato</h3>
              <p>
                Para dúvidas sobre estas políticas ou para cadastro como revendedor autorizado, 
                entre em contato pelo e-mail: atacado@avance.com.br
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default WholesalePolicyModal;
