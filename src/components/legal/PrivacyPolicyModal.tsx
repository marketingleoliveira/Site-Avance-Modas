import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyModal = ({ open, onOpenChange }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Política de Privacidade</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="text-xs text-muted-foreground/70 space-y-1">
              <p>Última atualização: Janeiro de 2026</p>
              <p className="font-medium">AVANCE MODAS - CNPJ: 61.705.129/0001-90</p>
            </div>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Informações que Coletamos</h3>
              <p>
                Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone, 
                endereço de entrega e informações de pagamento quando você realiza uma compra ou se 
                cadastra em nossa newsletter.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Como Usamos suas Informações</h3>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Processar e entregar seus pedidos</li>
                <li>Enviar comunicações sobre promoções e novidades (com seu consentimento)</li>
                <li>Melhorar nossos produtos e serviços</li>
                <li>Prevenir fraudes e garantir a segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Compartilhamento de Dados</h3>
              <p>
                Não vendemos suas informações pessoais. Compartilhamos dados apenas com parceiros 
                essenciais para operação do negócio, como processadores de pagamento e transportadoras, 
                sempre respeitando padrões rigorosos de segurança.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">4. Segurança dos Dados</h3>
              <p>
                Implementamos medidas técnicas e organizacionais para proteger suas informações 
                contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">5. Seus Direitos (LGPD)</h3>
              <p>De acordo com a Lei Geral de Proteção de Dados, você tem direito a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Solicitar portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">6. Cookies</h3>
              <p>
                Utilizamos cookies para melhorar sua experiência de navegação, analisar o tráfego 
                do site e personalizar conteúdo. Você pode configurar seu navegador para recusar 
                cookies, mas isso pode afetar algumas funcionalidades do site.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">7. Contato</h3>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre nossa política de privacidade, 
                entre em contato pelo e-mail: contato@avance.com.br
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
