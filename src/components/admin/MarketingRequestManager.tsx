import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, FileDown, Clock } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface RequestItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  fabric: string;
}

const MarketingRequestManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<RequestItem[]>([
    { id: '1', sku: '', size: '', color: '', fabric: '' }
  ]);
  const [minTime, setMinTime] = useState('7 dias');
  const [maxTime, setMaxTime] = useState('30 dias');

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), sku: '', size: '', color: '', fabric: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof RequestItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF() as any;
      const now = new Date();
      const dateStr = format(now, "dd/MM/yyyy HH:mm");

      // Header
      doc.setFontSize(18);
      doc.text("SOLICITAÇÃO DE PEÇAS - MARKETING", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.text(`Data de Emissão: ${dateStr}`, 20, 30);
      doc.text(`Prazo Mínimo: ${minTime}`, 20, 35);
      doc.text(`Prazo Máximo: ${maxTime}`, 20, 40);

      // Table
      const tableColumn = ["SKU", "Tamanho", "Cor", "Tipo de Tecido"];
      const tableRows = items.map(item => [
        item.sku,
        item.size,
        item.color,
        item.fabric
      ]);

      doc.autoTable({
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillStyle: 'F', fillColor: [220, 38, 38], textColor: 255 },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 150;

      // Signature Sections
      const drawSignatures = (title: string, yPos: number) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title, 20, yPos);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        // Lines
        const colWidth = 55;
        const startX = 20;
        const lineY = yPos + 20;

        // Marketing
        doc.line(startX, lineY, startX + colWidth, lineY);
        doc.text("Assinatura Marketing", startX + (colWidth/2), lineY + 5, { align: "center" });
        
        // Diretoria
        doc.line(startX + colWidth + 10, lineY, startX + 2*colWidth + 10, lineY);
        doc.text("Assinatura Diretoria", startX + colWidth + 10 + (colWidth/2), lineY + 5, { align: "center" });
        
        // E-commerce
        doc.line(startX + 2*colWidth + 20, lineY, startX + 3*colWidth + 20, lineY);
        doc.text("Assinatura E-commerce", startX + 2*colWidth + 20 + (colWidth/2), lineY + 5, { align: "center" });
      };

      drawSignatures("1. TERMO DE RETIRADA", finalY + 20);
      drawSignatures("2. TERMO DE DEVOLUÇÃO", finalY + 60);

      // Footer disclaimer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Documento interno Avance Modas. As peças devem ser devolvidas em perfeito estado dentro do prazo máximo estipulado.", 105, 285, { align: "center" });

      doc.save(`solicitacao-marketing-${format(now, "yyyy-MM-dd")}.pdf`);
      
      toast({
        title: "PDF Gerado",
        description: "O documento foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Ocorreu um problema ao criar o documento.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min-time">Tempo Mínimo (Permanência)</Label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input 
              id="min-time" 
              value={minTime} 
              onChange={(e) => setMinTime(e.target.value)}
              placeholder="Ex: 7 dias"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-time">Tempo Máximo (Permanência)</Label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input 
              id="max-time" 
              value={maxTime} 
              onChange={(e) => setMaxTime(e.target.value)}
              placeholder="Ex: 30 dias"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Itens da Solicitação</h3>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={item.id} className="relative">
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input 
                  value={item.sku} 
                  onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                  placeholder="Ex: BER-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Input 
                  value={item.size} 
                  onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                  placeholder="Ex: G1"
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input 
                  value={item.color} 
                  onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                  placeholder="Ex: Preto"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Tecido</Label>
                <Input 
                  value={item.fabric} 
                  onChange={(e) => updateItem(item.id, 'fabric', e.target.value)}
                  placeholder="Ex: Suplex"
                />
              </div>
              {items.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-2 -right-2 bg-background border rounded-full h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={generatePDF} className="bg-red-600 hover:bg-red-700">
          <FileDown className="w-4 h-4 mr-2" />
          Gerar PDF de Solicitação
        </Button>
      </div>
    </div>
  );
};

export default MarketingRequestManager;
