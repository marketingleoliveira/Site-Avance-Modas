import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsOfUseModal = ({ open, onOpenChange }: TermsOfUseModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Termos de Uso</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="text-xs text-muted-foreground/70 space-y-1">
              <p>Última atualização: Janeiro de 2026</p>
              <p className="font-medium">AVANCE MODAS - CNPJ: 61.705.129/0001-90</p>
            </div>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Aceitação dos Termos</h3>
              <p>
                Ao acessar e utilizar este site, você concorda em cumprir e estar sujeito a estes 
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá 
                utilizar nosso site.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Uso do Site</h3>
              <p>Você concorda em utilizar este site apenas para fins lícitos e de acordo com estes termos. É proibido:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Usar o site de forma que viole qualquer lei aplicável</li>
                <li>Tentar acessar áreas restritas do site sem autorização</li>
                <li>Transmitir vírus ou código malicioso</li>
                <li>Coletar informações de outros usuários sem consentimento</li>
                <li>Usar o site para fins comerciais não autorizados</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Produtos e Preços</h3>
              <p>
                Nos reservamos o direito de modificar preços, descrições e disponibilidade de 
                produtos a qualquer momento. Imagens são ilustrativas e podem haver pequenas 
                variações de cor devido às configurações de monitor.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">4. Compras e Pagamento</h3>
              <p>
                Ao realizar uma compra, você declara que as informações fornecidas são verdadeiras 
                e que está autorizado a usar o método de pagamento escolhido. Todas as transações 
                são processadas de forma segura através de parceiros certificados.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">5. Entrega e Frete</h3>
              <p>
                Os prazos de entrega são estimativas e podem variar de acordo com a localidade e 
                disponibilidade dos produtos. Não nos responsabilizamos por atrasos causados por 
                terceiros ou eventos de força maior.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">6. Trocas e Devoluções</h3>
              <p>
                Aceitamos trocas e devoluções em até 7 dias corridos após o recebimento do produto, 
                conforme previsto no Código de Defesa do Consumidor. O produto deve estar em sua 
                embalagem original, sem sinais de uso.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">7. Propriedade Intelectual</h3>
              <p>
                Todo o conteúdo deste site, incluindo textos, imagens, logotipos e design, é 
                protegido por direitos autorais e não pode ser reproduzido sem autorização prévia.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">8. Limitação de Responsabilidade</h3>
              <p>
                Não nos responsabilizamos por danos indiretos, incidentais ou consequentes 
                decorrentes do uso ou impossibilidade de uso deste site.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">9. Alterações nos Termos</h3>
              <p>
                Podemos atualizar estes termos periodicamente. As alterações entram em vigor 
                imediatamente após a publicação no site. O uso continuado do site após alterações 
                constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">10. Contato</h3>
              <p>
                Para dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail: 
                contato@avance.com.br
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseModal;
