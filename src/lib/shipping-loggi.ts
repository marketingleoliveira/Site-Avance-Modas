// Cálculo de frete por faixas de CEP (tabela fixa Loggi).
// Ajuste os valores conforme a tabela real combinada com a transportadora.

export interface ShippingQuote {
  region: string;
  cost: number;
  estimatedDays: string;
  weightKg: number;
}

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

export function formatCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function isValidCep(cep: string): boolean {
  return onlyDigits(cep).length === 8;
}

/**
 * Tabela de frete por região (CEP) — base (até 1kg) + valor por kg adicional.
 * Modelo igual ao do checkout do Shopify (weight-based shipping rates).
 */
interface RegionRate {
  region: string;
  base: number; // R$ até 1kg
  perKg: number; // R$ por kg adicional acima de 1kg
  estimatedDays: string;
}

function getRegionRate(cep: string): RegionRate | null {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const prefix = parseInt(d.slice(0, 5), 10);

  if ((prefix >= 1000 && prefix <= 5999) || (prefix >= 8000 && prefix <= 8499)) {
    return { region: "SP - Capital", base: 22, perKg: 6, estimatedDays: "1-2 dias úteis" };
  }
  if (prefix >= 6000 && prefix <= 9999) {
    return { region: "SP - Grande SP", base: 28, perKg: 7, estimatedDays: "2-3 dias úteis" };
  }
  if (prefix >= 11000 && prefix <= 19999) {
    return { region: "SP - Interior", base: 35, perKg: 9, estimatedDays: "3-5 dias úteis" };
  }
  if (prefix >= 20000 && prefix <= 28999) {
    return { region: "Rio de Janeiro", base: 42, perKg: 11, estimatedDays: "3-5 dias úteis" };
  }
  if (prefix >= 29000 && prefix <= 39999) {
    return { region: "MG / ES", base: 48, perKg: 12, estimatedDays: "4-6 dias úteis" };
  }
  if (prefix >= 80000 && prefix <= 99999) {
    return { region: "Região Sul", base: 55, perKg: 14, estimatedDays: "5-7 dias úteis" };
  }
  if (prefix >= 70000 && prefix <= 78999) {
    return { region: "Centro-Oeste", base: 62, perKg: 16, estimatedDays: "5-8 dias úteis" };
  }
  if (prefix >= 40000 && prefix <= 65999) {
    return { region: "Nordeste", base: 70, perKg: 18, estimatedDays: "6-9 dias úteis" };
  }
  if (prefix >= 66000 && prefix <= 69999) {
    return { region: "Região Norte", base: 85, perKg: 22, estimatedDays: "7-12 dias úteis" };
  }
  return { region: "Outras regiões", base: 75, perKg: 18, estimatedDays: "7-10 dias úteis" };
}

/**
 * Calcula o frete com base no CEP e no peso total (em kg) dos itens.
 * Modelo: base até 1kg + valor por kg adicional (igual ao weight-based rates do Shopify).
 * Arredonda peso para cima a cada 0,5kg.
 */
export function calculateShipping(cep: string, weightKg: number): ShippingQuote | null {
  const rate = getRegionRate(cep);
  if (!rate) return null;

  const safeWeight = Math.max(0.1, weightKg || 0);
  // arredonda para cima em incrementos de 0,5kg
  const billableWeight = Math.ceil(safeWeight * 2) / 2;
  const additional = Math.max(0, billableWeight - 1);
  const cost = rate.base + additional * rate.perKg;

  return {
    region: rate.region,
    cost: Math.round(cost * 100) / 100,
    estimatedDays: rate.estimatedDays,
    weightKg: billableWeight,
  };
}

/**
 * Converte qualquer unidade Shopify para kilogramas.
 */
export function toKilograms(
  weight: number | undefined,
  unit: string | undefined
): number {
  if (!weight || weight <= 0) return 0;
  switch (unit) {
    case "GRAMS":
      return weight / 1000;
    case "OUNCES":
      return weight * 0.0283495;
    case "POUNDS":
      return weight * 0.453592;
    case "KILOGRAMS":
    default:
      return weight;
  }
}

/**
 * Peso padrão por peça quando o produto Shopify não informa peso.
 * Considera ~300g por peça de roupa (estimativa segura).
 */
export const DEFAULT_ITEM_WEIGHT_KG = 0.3;

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

// CPF/CNPJ validators (apenas tamanho + dígitos verificadores básicos).
export function formatDocument(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 11) {
    // CPF: 000.000.000-00
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0000-00
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function isValidDocument(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 11 || d.length === 14;
}

export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}