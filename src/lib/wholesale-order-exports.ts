import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/logo-avance.png";

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

const RED: [number, number, number] = [220, 38, 38];

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

let cachedLogo: { dataUrl: string; w: number; h: number } | null = null;

async function loadLogo(): Promise<typeof cachedLogo> {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    cachedLogo = { dataUrl, w: dims.w, h: dims.h };
    return cachedLogo;
  } catch {
    return null;
  }
}

/* ---------------- Shared layout helpers ---------------- */

interface DrawCtx {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
}

function drawHeader(ctx: DrawCtx, logo: typeof cachedLogo, title: string, subtitle: string, orderRef: string) {
  const { doc, pageWidth, margin } = ctx;
  // Red band
  doc.setFillColor(...RED);
  doc.rect(0, 0, pageWidth, 80, "F");

  // Logo on white pill (left)
  if (logo) {
    const logoBoxW = 90;
    const logoBoxH = 56;
    const ratio = logo.h / logo.w;
    let drawW = logoBoxW;
    let drawH = drawW * ratio;
    if (drawH > logoBoxH) {
      drawH = logoBoxH;
      drawW = drawH / ratio;
    }
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 12, logoBoxW, logoBoxH, 4, 4, "F");
    doc.addImage(
      logo.dataUrl,
      "PNG",
      margin + (logoBoxW - drawW) / 2,
      12 + (logoBoxH - drawH) / 2,
      drawW,
      drawH
    );
  }

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, margin + (logo ? 110 : 0), 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitle, margin + (logo ? 110 : 0), 56);
  doc.setFontSize(9);
  doc.text(orderRef, pageWidth - margin, 56, { align: "right" });
  doc.setTextColor(0);
}

function drawSignatureBlocks(
  ctx: DrawCtx,
  startY: number,
  labels: string[]
) {
  const { doc, pageWidth, margin, pageHeight } = ctx;
  const usableW = pageWidth - margin * 2;
  const gap = 24;
  const boxW = (usableW - gap * (labels.length - 1)) / labels.length;
  const boxH = 90;
  // Push to bottom if there's room
  const y = Math.max(startY, pageHeight - margin - boxH - 30);

  doc.setDrawColor(180);
  doc.setLineWidth(0.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);

  labels.forEach((label, i) => {
    const x = margin + i * (boxW + gap);
    // Signature line
    const lineY = y + boxH - 22;
    doc.line(x + 10, lineY, x + boxW - 10, lineY);
    // Label
    doc.text(label, x + boxW / 2, lineY + 14, { align: "center" });
  });
  doc.setTextColor(0);
}

function drawFooterMeta(ctx: DrawCtx) {
  const { doc, pageWidth, margin, pageHeight } = ctx;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text(
    "Avance Modas — CNPJ 61.705.129/0001-90 — Documento interno gerado automaticamente",
    pageWidth / 2,
    pageHeight - 18,
    { align: "center" }
  );
  doc.setTextColor(0);
}

/* ---------------- PDF 1 — Controle de Disponibilidade ---------------- */

export async function downloadOrderStockPdf(order: OrderForExport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const ctx: DrawCtx = { doc, pageWidth, pageHeight, margin };

  const logo = await loadLogo();

  drawHeader(
    ctx,
    logo,
    "CONTROLE DE ESTOQUE",
    "Check de disponibilidade — Pedido Atacado",
    `Pedido #${order.id.slice(0, 8).toUpperCase()}  •  ${fmtDate(order.created_at)}`
  );

  let y = 110;

  // Customer ref (single line)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Cliente:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.customer_name, margin + 50, y);
  y += 18;

  autoTable(doc, {
    startY: y,
    head: [["SKU", "Produto", "Tam.", "Cor", "Qtd", "Check"]],
    body: order.cart_items.map((item) => [
      item.sku || "—",
      item.title,
      pickOption(item, "Tamanho") || pickOption(item, "Tamanho Superior") || "—",
      pickOption(item, "Cor") || "—",
      String(item.quantity),
      "",
    ]),
    styles: { fontSize: 9, cellPadding: 5, lineColor: [200, 200, 200], lineWidth: 0.3 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: margin, right: margin, bottom: 160 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 40 },
      3: { cellWidth: 70 },
      4: { halign: "center", cellWidth: 35 },
      5: { cellWidth: 50 },
    },
    didDrawPage: () => drawFooterMeta(ctx),
  });

  const afterTable =
    ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 30;

  // Totals strip (qty)
  const totalQty = order.cart_items.reduce((s, i) => s + i.quantity, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Total de peças: ${totalQty}`, margin, afterTable);

  drawSignatureBlocks(ctx, afterTable + 40, ["E-commerce"]);

  doc.save(
    `controle_estoque_${safeFilename(order.customer_name)}_${order.id.slice(0, 8)}.pdf`
  );
}

/* ---------------- PDF 2 — Confirmação de Pedido (valores) ---------------- */

export async function downloadOrderGuidePdf(order: OrderForExport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const ctx: DrawCtx = { doc, pageWidth, pageHeight, margin };

  const logo = await loadLogo();

  drawHeader(
    ctx,
    logo,
    "CONFIRMAÇÃO DE PEDIDO",
    "Resumo Financeiro — Pedido Atacado",
    `Pedido #${order.id.slice(0, 8).toUpperCase()}  •  ${fmtDate(order.created_at)}`
  );

  let y = 110;

  const sectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...RED);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
  };

  const labelCol = 90;
  const kv = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "—", pageWidth - margin * 2 - labelCol);
    doc.text(lines, margin + labelCol, y);
    y += 13 * Math.max(1, lines.length);
  };

  // Two-column layout for short fields
  sectionTitle("Dados do Cliente");
  kv("Nome", order.customer_name);
  kv("CPF/CNPJ", order.customer_document || "—");
  kv("E-mail", order.customer_email);
  kv("WhatsApp", order.customer_whatsapp);

  y += 6;
  sectionTitle("Endereço de Entrega");
  const addr = order.shipping_address || {};
  kv("CEP", addr.cep || "—");
  kv(
    "Logradouro",
    [addr.street, addr.number].filter(Boolean).join(", ") +
      (addr.complement ? ` — ${addr.complement}` : "") || "—"
  );
  kv("Bairro", addr.neighborhood || "—");
  kv("Cidade/UF", [addr.city, addr.state].filter(Boolean).join(" / ") || "—");

  y += 6;
  sectionTitle("Pagamento e Frete");
  kv(
    "Forma de pagamento",
    order.payment_method ? paymentLabels[order.payment_method] || order.payment_method : "—"
  );
  kv("Região de frete", order.shipping_region || "—");
  kv("Valor do frete", fmtMoney(order.shipping_cost ?? 0, order.currency_code));

  y += 6;
  sectionTitle("Resumo dos Itens");

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
    styles: { fontSize: 9, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.3 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: margin, right: margin, bottom: 200 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { halign: "center", cellWidth: 35 },
      3: { cellWidth: 60 },
      4: { halign: "center", cellWidth: 35 },
      5: { halign: "right", cellWidth: 75 },
    },
    didDrawPage: () => drawFooterMeta(ctx),
  });

  // TOTAL block (own row, no overlap)
  const afterTable =
    ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 14;
  const totalBoxH = 32;
  doc.setFillColor(...RED);
  doc.rect(margin, afterTable, pageWidth - margin * 2, totalBoxH, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL DO PEDIDO", margin + 14, afterTable + 21);
  doc.setFontSize(14);
  doc.text(
    fmtMoney(order.total_amount, order.currency_code),
    pageWidth - margin - 14,
    afterTable + 22,
    { align: "right" }
  );
  doc.setTextColor(0);

  drawSignatureBlocks(ctx, afterTable + totalBoxH + 50, ["Marketing", "Diretoria"]);

  doc.save(
    `pedido_${safeFilename(order.customer_name)}_${order.id.slice(0, 8)}.pdf`
  );
}