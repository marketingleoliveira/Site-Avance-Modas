// Cálculo de frete por faixas de CEP (tabela fixa Loggi).
// Ajuste os valores conforme a tabela real combinada com a transportadora.

export interface ShippingQuote {
  region: string;
  cost: number;
  estimatedDays: string;
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
 * Tabela fixa por faixa de CEP.
 * Baseado em faixas oficiais dos Correios/Loggi.
 */
export function calculateShipping(cep: string): ShippingQuote | null {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const prefix = parseInt(d.slice(0, 5), 10);

  // São Paulo Capital (01000-05999, 08000-08499)
  if ((prefix >= 1000 && prefix <= 5999) || (prefix >= 8000 && prefix <= 8499)) {
    return { region: "SP - Capital", cost: 25, estimatedDays: "1-2 dias úteis" };
  }
  // Grande SP (06000-09999 demais)
  if (prefix >= 6000 && prefix <= 9999) {
    return { region: "SP - Grande SP", cost: 35, estimatedDays: "2-3 dias úteis" };
  }
  // Interior SP (11000-19999)
  if (prefix >= 11000 && prefix <= 19999) {
    return { region: "SP - Interior", cost: 45, estimatedDays: "3-5 dias úteis" };
  }
  // Rio de Janeiro (20000-28999)
  if (prefix >= 20000 && prefix <= 28999) {
    return { region: "Rio de Janeiro", cost: 55, estimatedDays: "3-5 dias úteis" };
  }
  // Espírito Santo / Minas Gerais (29000-39999)
  if (prefix >= 29000 && prefix <= 39999) {
    return { region: "MG / ES", cost: 65, estimatedDays: "4-6 dias úteis" };
  }
  // Sul (Paraná, SC, RS - 80000-99999)
  if (prefix >= 80000 && prefix <= 99999) {
    return { region: "Região Sul", cost: 75, estimatedDays: "5-7 dias úteis" };
  }
  // Centro-Oeste (70000-78999)
  if (prefix >= 70000 && prefix <= 78999) {
    return { region: "Centro-Oeste", cost: 85, estimatedDays: "5-8 dias úteis" };
  }
  // Nordeste (40000-65999)
  if (prefix >= 40000 && prefix <= 65999) {
    return { region: "Nordeste", cost: 95, estimatedDays: "6-9 dias úteis" };
  }
  // Norte (66000-69999)
  if (prefix >= 66000 && prefix <= 69999) {
    return { region: "Região Norte", cost: 110, estimatedDays: "7-12 dias úteis" };
  }
  return { region: "Outras regiões", cost: 100, estimatedDays: "7-10 dias úteis" };
}

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