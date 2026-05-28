import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface CartItemData {
  title: string;
  variantTitle?: string;
  sku?: string | null;
  quantity: number;
  price: string;
  currencyCode?: string;
  selectedOptions?: Array<{ name: string; value: string }>;
}

interface ShippingAddress {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface OrderForExport {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  customer_document?: string | null;
  payment_method?: string | null;
  shipping_address?: ShippingAddress | null;
  shipping_cost?: number | null;
  shipping_region?: string | null;
  total_amount: number;
  currency_code?: string;
  cart_items: CartItemData[];
}

const fmtMoney = (v: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(v || 0);

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  credit_card_3x: "Cartão de Crédito 3x",
};

const safeFilename = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "_");

function pickOption(item: CartItemData, name: string) {
  return item.selectedOptions?.find(
    (o) => o.name?.toLowerCase() === name.toLowerCase()
  )?.value || "";
}

/** PDF guide with all customer info from a wholesale order. */
export function downloadOrderGuidePdf(order: OrderForExport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AVANCE MODAS", margin, 28);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Guia de Pedido — Atacado", margin, 46);
  doc.setFontSize(9);
  doc.text(
    `Pedido #${order.id.slice(0, 8).toUpperCase()}  |  ${fmtDate(order.created_at)}`,
    pageWidth - margin,
    46,
    { align: "right" }
  );

  y = 90;
  doc.setTextColor(0);

  const section = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(title, margin, y);
    y += 4;
    doc.setDrawColor(220, 38, 38);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const kv = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const valueLines = doc.splitTextToSize(value || "—", pageWidth - margin * 2 - 110);
    doc.text(valueLines, margin + 110, y);
    y += 14 * Math.max(1, valueLines.length);
  };

  section("Dados do Cliente");
  kv("Nome", order.customer_name);
  kv("E-mail", order.customer_email);
  kv("WhatsApp", order.customer_whatsapp);
  kv("CPF/CNPJ", order.customer_document || "—");

  y += 8;
  section("Endereço de Entrega");
  const addr = order.shipping_address || {};
  kv("CEP", addr.cep || "—");
  kv(
    "Logradouro",
    [addr.street, addr.number].filter(Boolean).join(", ") +
      (addr.complement ? ` — ${addr.complement}` : "")
  );
  kv("Bairro", addr.neighborhood || "—");
  kv("Cidade/UF", [addr.city, addr.state].filter(Boolean).join(" / ") || "—");

  y += 8;
  section("Pagamento e Frete");
  kv("Forma de pagamento", order.payment_method ? paymentLabels[order.payment_method] || order.payment_method : "—");
  kv("Região de frete", order.shipping_region || "—");
  kv("Valor do frete", fmtMoney(order.shipping_cost ?? 0, order.currency_code));

  y += 12;
  section("Itens do Pedido");

  autoTable(doc, {
    startY: y,
    head: [["SKU", "Produto", "Tam.", "Cor", "Qtd", "Valor"]],
    body: order.cart_items.map((item) => [
      item.sku || "—",
      item.title,
      pickOption(item, "Tamanho") || pickOption(item, "Tamanho Superior") || "—",
      pickOption(item, "Cor") || "—",
      String(item.quantity),
      fmtMoney(parseFloat(item.price) * item.quantity, item.currencyCode),
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: "auto" },
      4: { halign: "center", cellWidth: 35 },
      5: { halign: "right", cellWidth: 65 },
    },
  });

  // Total
  // @ts-expect-error – lastAutoTable is added by jspdf-autotable
  const endY = (doc as any).lastAutoTable.finalY + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL DO PEDIDO:", pageWidth - margin - 150, endY);
  doc.setTextColor(220, 38, 38);
  doc.text(
    fmtMoney(order.total_amount, order.currency_code),
    pageWidth - margin,
    endY,
    { align: "right" }
  );

  doc.save(`guia_pedido_${safeFilename(order.customer_name)}_${order.id.slice(0, 8)}.pdf`);
}

/** Excel report (estoque) — SKU, Produto, Tamanho, Cor, Qntd, Valor. */
export function downloadOrderStockXlsx(order: OrderForExport) {
  const rows = order.cart_items.map((item) => ({
    SKU: item.sku || "",
    Produto: item.title,
    Tamanho:
      pickOption(item, "Tamanho") || pickOption(item, "Tamanho Superior") || "",
    Cor: pickOption(item, "Cor") || "",
    Qntd: item.quantity,
    Valor: parseFloat(item.price),
  }));

  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ["SKU", "Produto", "Tamanho", "Cor", "Qntd", "Valor"],
  });

  // Format currency on column F (Valor)
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = 1; R <= range.e.r; R++) {
    const cell = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
    if (cell) cell.z = '"R$" #,##0.00';
  }

  ws["!cols"] = [
    { wch: 10 },
    { wch: 45 },
    { wch: 10 },
    { wch: 14 },
    { wch: 6 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Controle de Estoque");

  XLSX.writeFile(
    wb,
    `estoque_pedido_${safeFilename(order.customer_name)}_${order.id.slice(0, 8)}.xlsx`
  );
}