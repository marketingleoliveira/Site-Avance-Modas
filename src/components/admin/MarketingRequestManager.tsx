import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface RequestItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  fabric: string;
}

const MarketingRequestManager = () => {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<RequestItem, "id">>({
    sku: "",
    size: "",
    color: "",
    fabric: "",
  });
  const [minTime, setMinTime] = useState("2 dias");
  const [maxTime, setMaxTime] = useState("7 dias");

  const addItem = () => {
    if (!newItem.sku || !newItem.size) {
      toast.error("Preencha ao menos SKU e Tamanho");
      return;
    }
    setItems((prev) => [...prev, { ...newItem, id: Math.random().toString(36).substr(2, 9) }]);
    setNewItem({ sku: "", size: "", color: "", fabric: "" });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const generatePDF = () => {
    if (items.length === 0) {
      toast.error("Adicione ao menos um item à solicitação");
      return;
    }

    const doc = new jsPDF();
    const now = new Date().toLocaleDateString("pt-BR");

    // Header
    doc.setFontSize(18);
    doc.text("Solicitação de Peças - Marketing", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${now}`, 20, 30);
    doc.text(`Prazo de Permanência: Mínimo ${minTime} / Máximo ${maxTime}`, 20, 35);

    // Table
    autoTable(doc, {
      startY: 45,
      head: [["SKU", "Tamanho", "Cor", "Tecido"]],
      body: items.map(item => [item.sku, item.size, item.color, item.fabric]),
      headStyles: { fillStyle: 'F', fillColor: [0, 0, 0] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;

    // Signatures - Phase 1: Withdrawal
    doc.setFontSize(12);
    doc.text("ETAPA 1: RETIRADA DO ESTOQUE", 20, finalY);
    
    doc.setFontSize(8);
    // Marketing
    doc.line(20, finalY + 15, 70, finalY + 15);
    doc.text("Assinatura Marketing", 20, finalY + 20);
    
    // Diretoria
    doc.line(80, finalY + 15, 130, finalY + 15);
    doc.text("Assinatura Diretoria", 80, finalY + 20);
    
    // E-commerce
    doc.line(140, finalY + 15, 190, finalY + 15);
    doc.text("Assinatura E-commerce", 140, finalY + 20);

    // Signatures - Phase 2: Return
    const returnY = finalY + 40;
    doc.setFontSize(12);
    doc.text("ETAPA 2: DEVOLUÇÃO AO ESTOQUE", 20, returnY);
    
    doc.setFontSize(8);
    // Marketing
    doc.line(20, returnY + 15, 70, returnY + 15);
    doc.text("Assinatura Marketing", 20, returnY + 20);
    
    // Diretoria
    doc.line(80, returnY + 15, 130, returnY + 15);
    doc.text("Assinatura Diretoria", 80, returnY + 20);
    
    // E-commerce
    doc.line(140, returnY + 15, 190, returnY + 15);
    doc.text("Assinatura E-commerce", 140, returnY + 20);

    doc.save(`Solicitacao_Marketing_${now.replace(/\//g, "-")}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Nova Solicitação de Peças (Marketing)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tempo Mínimo com Marketing</Label>
              <Input 
                value={minTime} 
                onChange={(e) => setMinTime(e.target.value)} 
                placeholder="Ex: 2 dias"
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo Máximo com Marketing</Label>
              <Input 
                value={maxTime} 
                onChange={(e) => setMaxTime(e.target.value)} 
                placeholder="Ex: 7 dias"
              />
            </div>
          </div>

          <div className="border p-4 rounded-lg bg-muted/30 space-y-4">
            <h3 className="font-medium text-sm">Adicionar Item</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">SKU</Label>
                <Input 
                  value={newItem.sku} 
                  onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tamanho</Label>
                <Input 
                  value={newItem.size} 
                  onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cor</Label>
                <Input 
                  value={newItem.color} 
                  onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tecido</Label>
                <Input 
                  value={newItem.fabric} 
                  onChange={(e) => setNewItem({...newItem, fabric: e.target.value})}
                  className="h-8"
                />
              </div>
            </div>
            <Button onClick={addItem} size="sm" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Adicionar à Lista
            </Button>
          </div>

          {items.length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Tam</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Tecido</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2">{item.sku}</TableCell>
                      <TableCell className="py-2">{item.size}</TableCell>
                      <TableCell className="py-2">{item.color}</TableCell>
                      <TableCell className="py-2">{item.fabric}</TableCell>
                      <TableCell className="py-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={generatePDF} 
              disabled={items.length === 0}
              className="bg-black hover:bg-black/90 text-white"
            >
              <Download className="w-4 h-4 mr-2" /> Gerar PDF de Solicitação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingRequestManager;
