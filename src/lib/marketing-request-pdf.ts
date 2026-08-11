import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import logo from "@/assets/logo-avance.png";

export interface RequestItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  fabric: string;
}

export interface RequestSignatures {
  withdrawal: { marketing: string; direction: string; ecommerce: string };
  return: { marketing: string; direction: string; ecommerce: string };
}

export interface MarketingRequestRecord {
  id?: string;
  request_number: string;
  requester_name: string | null;
  purpose: string | null;
  items: RequestItem[];
  min_time: string;
  max_time: string;
  status: string;
  withdrawal_date: string | null;
  return_date: string | null;
  signatures: RequestSignatures;
  notes: string | null;
  created_at?: string;
}

export const emptySignatures = (): RequestSignatures => ({
  withdrawal: { marketing: "", direction: "", ecommerce: "" },
  return: { marketing: "", direction: "", ecommerce: "" },
});

export const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  retirado: "Retirado",
  devolvido: "Devolvido",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

const safeDate = (value?: string | null) => {
  if (!value) return "____/____/______";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm");
  } catch {
    return "____/____/______";
  }
};

export const generateRequestPDF = (request: MarketingRequestRecord) => {
  const doc = new jsPDF();
  const createdAt = request.created_at ? new Date(request.created_at) : new Date();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SOLICITAÇÃO DE PEÇAS - MARKETING", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº da Solicitação: ${request.request_number}`, 20, 30);
  doc.text(`Emissão: ${format(createdAt, "dd/MM/yyyy HH:mm")}`, 20, 36);
  doc.text(`Solicitante: ${request.requester_name || "-"}`, 20, 42);
  doc.text(`Status: ${statusLabels[request.status] || request.status}`, 130, 30);
  doc.text(`Prazo mínimo: ${request.min_time || "-"}`, 130, 36);
  doc.text(`Prazo máximo: ${request.max_time || "-"}`, 130, 42);
  if (request.purpose) {
    doc.text(`Finalidade: ${request.purpose}`, 20, 48);
  }

  autoTable(doc, {
    startY: request.purpose ? 54 : 50,
    head: [["SKU", "Tamanho", "Cor", "Tipo de Tecido"]],
    body: request.items.map((item) => [item.sku, item.size, item.color, item.fabric]),
    theme: "grid",
    headStyles: { fillColor: [220, 38, 38], textColor: 255 },
    styles: { fontSize: 10 },
  });

  let cursorY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;
  cursorY += 14;

  const drawSignatures = (
    title: string,
    dateLabel: string,
    dateValue: string,
    names: { marketing: string; direction: string; ecommerce: string },
    yPos: number,
  ) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${dateLabel}: ${dateValue}`, 20, yPos + 6);

    const colWidth = 52;
    const gap = 8;
    const lineY = yPos + 24;
    const entries: Array<[string, string]> = [
      ["Marketing", names.marketing],
      ["Diretoria", names.direction],
      ["E-commerce", names.ecommerce],
    ];

    entries.forEach(([role, name], index) => {
      const x = 20 + index * (colWidth + gap);
      if (name) {
        doc.setFont("helvetica", "italic");
        doc.text(name, x + colWidth / 2, lineY - 2, { align: "center" });
        doc.setFont("helvetica", "normal");
      }
      doc.line(x, lineY, x + colWidth, lineY);
      doc.text(`Assinatura ${role}`, x + colWidth / 2, lineY + 5, { align: "center" });
    });
  };

  drawSignatures(
    "1. TERMO DE RETIRADA",
    "Data da retirada",
    safeDate(request.withdrawal_date),
    request.signatures.withdrawal,
    cursorY,
  );
  drawSignatures(
    "2. TERMO DE DEVOLUÇÃO",
    "Data da devolução",
    safeDate(request.return_date),
    request.signatures.return,
    cursorY + 50,
  );

  if (request.notes) {
    doc.setFontSize(9);
    doc.text(`Observações: ${request.notes}`, 20, cursorY + 108, { maxWidth: 170 });
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Documento interno Avance Modas. As peças devem ser devolvidas em perfeito estado dentro do prazo máximo estipulado.",
    105,
    287,
    { align: "center" },
  );

  doc.save(`solicitacao-${request.request_number}.pdf`);
};