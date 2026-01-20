import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Key, 
  Settings, 
  ShoppingCart, 
  Image, 
  Video, 
  Tag, 
  Megaphone, 
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lightbulb,
  BookOpen,
  Wrench,
  Users,
  Truck,
  CreditCard,
  Globe,
  Smartphone,
  ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Tutorial images - Updated for Shopify 2025 Dashboard
import tutorialStep1 from "@/assets/tutorial/shopify-2025-step1-settings.jpg";
import tutorialStep2 from "@/assets/tutorial/shopify-2025-step2-apps.jpg";
import tutorialStep3 from "@/assets/tutorial/shopify-2025-step3-create-app.jpg";
import tutorialStep4 from "@/assets/tutorial/shopify-2025-step4-storefront.jpg";
import tutorialStep5 from "@/assets/tutorial/shopify-2025-step5-permissions.jpg";
import tutorialStep6 from "@/assets/tutorial/shopify-2025-step6-token.jpg";

const DocumentationPage = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Central de Documentação</h2>
          <p className="text-muted-foreground">Guias completos para configurar e gerenciar sua loja</p>
        </div>
      </div>

      <Tabs defaultValue="shopify" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
          <TabsTrigger value="shopify" className="gap-2">
            <Store className="w-4 h-4" />
            Shopify
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Image className="w-4 h-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-2">
            <Megaphone className="w-4 h-4" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="gap-2">
            <Wrench className="w-4 h-4" />
            Problemas
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        {/* Shopify Documentation */}
        <TabsContent value="shopify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-green-600" />
                Configuração do Shopify
              </CardTitle>
              <CardDescription>
                Passo a passo completo para conectar sua loja Shopify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Você precisa ter uma conta Shopify ativa e ser proprietário ou ter permissões de desenvolvedor na loja.
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">1</Badge>
                      <span>Acessar o Painel do Shopify</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11 space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group rounded-lg overflow-hidden border border-border">
                          <img 
                            src={tutorialStep1} 
                            alt="Menu lateral do Shopify com Configurações destacado" 
                            className="w-full h-auto object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <img src={tutorialStep1} alt="Menu lateral do Shopify" className="w-full h-auto" />
                      </DialogContent>
                    </Dialog>
                    
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>Acesse <a href="https://admin.shopify.com" target="_blank" rel="noopener" className="text-primary hover:underline inline-flex items-center gap-1">admin.shopify.com <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Faça login com suas credenciais da loja</li>
                      <li>No menu lateral, procure por <strong>"Settings"</strong> ou <strong>"Configurações"</strong></li>
                    </ol>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <Lightbulb className="w-4 h-4 inline mr-1" />
                        O URL da sua loja será algo como: <code className="bg-background px-2 py-1 rounded">sua-loja.myshopify.com</code>
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step2">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">2</Badge>
                      <span>Criar um App Personalizado</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative cursor-pointer group rounded-lg overflow-hidden border border-border">
                            <img 
                              src={tutorialStep2} 
                              alt="Página de configurações com Apps e canais de vendas" 
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img src={tutorialStep2} alt="Apps e canais de vendas" className="w-full h-auto" />
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative cursor-pointer group rounded-lg overflow-hidden border border-border">
                            <img 
                              src={tutorialStep3} 
                              alt="Página Desenvolver apps com botão Criar um app" 
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img src={tutorialStep3} alt="Criar um app" className="w-full h-auto" />
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <ol className="list-decimal pl-4 space-y-3">
                      <li>Dentro de Configurações, clique em <strong>"Apps e canais de vendas"</strong></li>
                      <li>Clique em <strong>"Desenvolver apps"</strong> no canto superior</li>
                      <li>Se for a primeira vez, clique em <strong>"Permitir desenvolvimento de apps personalizados"</strong></li>
                      <li>Clique no botão verde <strong>"Criar um app"</strong></li>
                      <li>Dê um nome ao app (ex: "Avance Modas Integration")</li>
                      <li>Clique em <strong>"Criar app"</strong></li>
                    </ol>
                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        Apenas usuários com permissão de "Proprietário" ou "Colaborador com acesso a apps" podem criar apps.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step3">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">3</Badge>
                      <span>Configurar Permissões da Storefront API</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative cursor-pointer group rounded-lg overflow-hidden border border-border">
                            <img 
                              src={tutorialStep4} 
                              alt="Aba Configuração com Storefront API integration" 
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Aba Configuração</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img src={tutorialStep4} alt="Storefront API integration" className="w-full h-auto" />
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative cursor-pointer group rounded-lg overflow-hidden border border-border">
                            <img 
                              src={tutorialStep5} 
                              alt="Seleção de permissões da Storefront API" 
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Permissões</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img src={tutorialStep5} alt="Permissões da API" className="w-full h-auto" />
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <ol className="list-decimal pl-4 space-y-3">
                      <li>Após criar o app, vá para a aba <strong>"Configuration"</strong> (Configuração)</li>
                      <li>Role a página até encontrar a seção <strong>"Storefront API integration"</strong></li>
                      <li>Clique em <strong>"Configure"</strong></li>
                      <li>Marque as seguintes permissões:</li>
                    </ol>
                    
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-medium text-sm mb-3">Permissões obrigatórias:</p>
                      <div className="grid gap-2">
                        {[
                          { scope: "unauthenticated_read_product_listings", desc: "Ler listagens de produtos" },
                          { scope: "unauthenticated_read_product_inventory", desc: "Ler inventário" },
                          { scope: "unauthenticated_write_checkouts", desc: "Criar checkouts" },
                          { scope: "unauthenticated_read_checkouts", desc: "Ler checkouts" },
                          { scope: "unauthenticated_read_product_tags", desc: "Ler tags de produtos" },
                        ].map((item) => (
                          <div key={item.scope} className="flex items-center justify-between bg-background p-2 rounded">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <code className="text-xs">{item.scope}</code>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(item.scope)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <ol className="list-decimal pl-4 space-y-2" start={5}>
                      <li>Clique em <strong>"Save"</strong></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step4">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">4</Badge>
                      <span>Instalar o App e Obter o Token</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11 space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group rounded-lg overflow-hidden border border-border">
                          <img 
                            src={tutorialStep6} 
                            alt="API credentials e Storefront token" 
                            className="w-full h-auto object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">API Credentials</span>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <img src={tutorialStep6} alt="API credentials" className="w-full h-auto" />
                      </DialogContent>
                    </Dialog>
                    
                    <ol className="list-decimal pl-4 space-y-3">
                      <li>Na página do app, clique no botão verde <strong>"Install app"</strong></li>
                      <li>Confirme a instalação na janela que aparecer</li>
                      <li>Após instalado, vá para a aba <strong>"API credentials"</strong></li>
                      <li>Na seção <strong>"Storefront API access token"</strong>:</li>
                    </ol>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-medium text-sm">Para copiar o token:</p>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                        <li>Clique em <strong>"Reveal token once"</strong> para revelar</li>
                        <li>Ou clique no ícone de copiar ao lado do token</li>
                        <li>O token começa com <code className="bg-background px-2 py-0.5 rounded">shpat_</code></li>
                      </ul>
                    </div>

                    <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                      <Shield className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>ATENÇÃO:</strong> O token só pode ser revelado UMA VEZ! Copie e guarde em local seguro antes de sair da página. Se perder, terá que criar um novo app.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step5">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">5</Badge>
                      <span>Configurar no Painel Avance</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11 space-y-4">
                    <ol className="list-decimal pl-4 space-y-3">
                      <li>No painel admin, vá para a aba <strong>"Loja"</strong></li>
                      <li>Selecione a sub-aba <strong>"Shopify"</strong></li>
                      <li>Preencha os campos:
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                          <li><strong>Domínio da Loja:</strong> sua-loja.myshopify.com</li>
                          <li><strong>Storefront Access Token:</strong> Cole o token copiado</li>
                          <li><strong>Versão da API:</strong> 2025-07 (recomendado)</li>
                        </ul>
                      </li>
                      <li>Clique em <strong>"Testar Conexão"</strong></li>
                      <li>Se aparecer indicador verde ✓, clique em <strong>"Salvar"</strong></li>
                    </ol>

                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg dark:bg-green-950 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Conexão bem-sucedida!</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Seus produtos do Shopify agora serão exibidos automaticamente na loja.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Documentation */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Hero Banners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Os banners Hero são as imagens principais que aparecem no topo da página.
                </p>
                <div className="space-y-3">
                  <h4 className="font-medium">Dimensões recomendadas:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li><strong>Desktop:</strong> 1920 x 800 pixels</li>
                    <li><strong>Mobile:</strong> 768 x 600 pixels</li>
                    <li><strong>Formato:</strong> JPG ou WebP (melhor compressão)</li>
                    <li><strong>Tamanho máximo:</strong> 2MB por imagem</li>
                  </ul>
                </div>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Use imagens de alta qualidade mas otimizadas para web para garantir carregamento rápido.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Vídeos de Modelos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vídeos verticais que aparecem na seção de modelos.
                </p>
                <div className="space-y-3">
                  <h4 className="font-medium">Especificações:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li><strong>Proporção:</strong> 9:16 (vertical/retrato)</li>
                    <li><strong>Resolução ideal:</strong> 1080 x 1920 pixels</li>
                    <li><strong>Formato:</strong> MP4 (H.264)</li>
                    <li><strong>Duração:</strong> 5-30 segundos</li>
                    <li><strong>Tamanho:</strong> Sem limite (armazenado no servidor)</li>
                  </ul>
                </div>
                <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
                  <Video className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800 dark:text-purple-200">
                    Vídeos são reproduzidos automaticamente sem som para não incomodar os visitantes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-600" />
                  Banner Promocional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Banner destacado para promoções especiais.
                </p>
                <div className="space-y-3">
                  <h4 className="font-medium">Campos disponíveis:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li><strong>Tag:</strong> Pequeno texto destacado (ex: "Oferta Especial")</li>
                    <li><strong>Título:</strong> Mensagem principal da promoção</li>
                    <li><strong>Descrição:</strong> Detalhes adicionais</li>
                    <li><strong>Botão:</strong> Texto e link de destino</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-pink-600" />
                  Barra de Anúncios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Mensagens rotativas no topo do site.
                </p>
                <div className="space-y-3">
                  <h4 className="font-medium">Como funciona:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Adicione múltiplas mensagens</li>
                    <li>Defina o intervalo de rotação (em milissegundos)</li>
                    <li>Mensagens alternam automaticamente</li>
                    <li>Limite de caracteres: ~60 para melhor visualização mobile</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketing Documentation */}
        <TabsContent value="marketing" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gerencie sua lista de emails para campanhas de marketing.
                </p>
                <div className="space-y-3">
                  <h4 className="font-medium">Funcionalidades:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Visualizar todos os inscritos</li>
                    <li>Exportar lista em formato CSV</li>
                    <li>Ativar/desativar inscritos individualmente</li>
                    <li>Ver data e fonte da inscrição</li>
                  </ul>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Respeite a LGPD: só envie emails para quem consentiu receber.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-pink-600" />
                  Instagram
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exiba seu feed do Instagram na loja.
                </p>
                <div className="space-y-3">
                  <h4 className="font-medium">Configuração:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Informe seu @usuário do Instagram</li>
                    <li>Configure o ID do Curator (feed embedado)</li>
                    <li>Personalize textos do botão</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Configurações de Atacado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure as regras para vendas no atacado.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Pedido Mínimo:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li>Defina o valor mínimo para finalizar pedido</li>
                      <li>Barra de progresso mostra quanto falta</li>
                      <li>Carrinho fica bloqueado até atingir o mínimo</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Mensagens:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li>Personalize a mensagem de pedido mínimo</li>
                      <li>Configure aviso no checkout</li>
                      <li>Ative/desative notificações</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Documentation */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-600" />
                  Identidade da Marca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-4 space-y-2 text-sm">
                  <li><strong>Logo:</strong> Imagem PNG transparente, 200x80px recomendado</li>
                  <li><strong>Favicon:</strong> Ícone 32x32px ou 64x64px, formato ICO ou PNG</li>
                  <li><strong>Nome da loja:</strong> Aparece no título do navegador</li>
                  <li><strong>Cor primária:</strong> Cor principal dos botões e destaques</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  Frete e Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-4 space-y-2 text-sm">
                  <li><strong>Frete grátis:</strong> Valor mínimo para frete grátis</li>
                  <li><strong>Prazo de entrega:</strong> Estimativa em dias úteis</li>
                  <li><strong>Mensagem:</strong> Texto exibido sobre entregas</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-4 space-y-2 text-sm">
                  <li><strong>WhatsApp:</strong> Número com DDD para botão flutuante</li>
                  <li><strong>Instagram:</strong> @usuario para link no rodapé</li>
                  <li><strong>Facebook:</strong> URL da página</li>
                  <li><strong>TikTok:</strong> @usuario</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Informações Legais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-4 space-y-2 text-sm">
                  <li><strong>CNPJ:</strong> Número do CNPJ da empresa</li>
                  <li><strong>Razão Social:</strong> Nome registrado da empresa</li>
                  <li><strong>Endereço:</strong> Endereço comercial completo</li>
                  <li><strong>Termos:</strong> Link para termos de uso</li>
                  <li><strong>Privacidade:</strong> Link para política de privacidade</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Troubleshooting */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                Solução de Problemas
              </CardTitle>
              <CardDescription>
                Problemas comuns e como resolvê-los
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="p1">
                  <AccordionTrigger>Produtos não aparecem na loja</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>Verifique se a conexão Shopify está ativa (indicador verde)</li>
                      <li>Confirme que os produtos estão <strong>publicados</strong> no Shopify</li>
                      <li>Verifique se o canal de vendas "Online Store" está ativo</li>
                      <li>Aguarde alguns minutos para sincronização</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="p2">
                  <AccordionTrigger>Erro "Token inválido" ao conectar Shopify</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Verifique se copiou o token <strong>Storefront</strong> (não o Admin API)</li>
                      <li>Confirme que o app foi <strong>instalado</strong> na loja</li>
                      <li>Tente gerar um novo token no Shopify</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="p3">
                  <AccordionTrigger>Erro "Loja não encontrada"</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Verifique o domínio: deve ser <code>sua-loja.myshopify.com</code></li>
                      <li>Não inclua "https://" no campo</li>
                      <li>Confirme que a loja está ativa (não pausada)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="p4">
                  <AccordionTrigger>Imagens não carregam</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Verifique o tamanho do arquivo (máx 2MB)</li>
                      <li>Use formatos suportados: JPG, PNG, WebP</li>
                      <li>Tente limpar o cache do navegador (Ctrl+F5)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="p5">
                  <AccordionTrigger>Alterações não aparecem no site</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Confirme que clicou em <strong>"Salvar"</strong> após as alterações</li>
                      <li>Limpe o cache do navegador</li>
                      <li>Aguarde 1-2 minutos para propagação</li>
                      <li>Tente acessar em aba anônima</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="p6">
                  <AccordionTrigger>Erro 402 - Pagamento necessário</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Sua loja Shopify precisa de um plano pago ativo</li>
                      <li>Acesse <a href="https://admin.shopify.com" target="_blank" className="text-primary hover:underline">admin.shopify.com</a> e ative um plano</li>
                      <li>Lojas em trial limitado não têm acesso à API</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq1">
                  <AccordionTrigger>Preciso ter conhecimento técnico?</AccordionTrigger>
                  <AccordionContent>
                    Não! O painel foi desenvolvido para ser intuitivo. Todas as configurações podem ser feitas através de formulários simples, sem necessidade de programação.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq2">
                  <AccordionTrigger>Os produtos sincronizam automaticamente?</AccordionTrigger>
                  <AccordionContent>
                    Sim! Após conectar sua loja Shopify, os produtos são carregados automaticamente. Qualquer alteração feita no Shopify reflete na loja em poucos minutos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq3">
                  <AccordionTrigger>Posso ter múltiplos administradores?</AccordionTrigger>
                  <AccordionContent>
                    Sim! Na aba "Administradores" você pode adicionar novos usuários admin com e-mail e senha. Cada um terá acesso completo ao painel.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq4">
                  <AccordionTrigger>O que é o modo de manutenção?</AccordionTrigger>
                  <AccordionContent>
                    O modo de manutenção exibe uma página temporária para os visitantes enquanto você faz atualizações. Você pode agendar quando ele será desativado automaticamente.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq5">
                  <AccordionTrigger>Como funciona o atacado vs varejo?</AccordionTrigger>
                  <AccordionContent>
                    A loja tem duas "portas de entrada": atacado (para lojistas com pedido mínimo) e varejo (para consumidor final). Cada uma pode ter banners e configurações diferentes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq6">
                  <AccordionTrigger>Onde vejo os pedidos?</AccordionTrigger>
                  <AccordionContent>
                    Os pedidos são processados diretamente no Shopify. Acesse <a href="https://admin.shopify.com/orders" target="_blank" className="text-primary hover:underline">admin.shopify.com/orders</a> para gerenciar pedidos, envios e reembolsos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq7">
                  <AccordionTrigger>Posso usar meu próprio domínio?</AccordionTrigger>
                  <AccordionContent>
                    Sim! Entre em contato com o suporte técnico para configurar seu domínio personalizado (ex: www.suamarca.com.br).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationPage;
