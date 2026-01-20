// Color variations for smart matching (moved outside component to avoid recreation)
export const COLOR_VARIATIONS: Record<string, string[]> = {
  // Rosas
  'rosa': ['rosa', 'pink', 'rose', 'rosinha'],
  'rosa bebê': ['rosa bebe', 'rosa-bebe', 'rosabebe', 'baby pink', 'rosa claro'],
  'rosa chiclete': ['rosa chiclete', 'rosa-chiclete', 'chiclete', 'bubblegum'],
  'rosa choque': ['rosa choque', 'rosa-choque', 'hot pink', 'pink choque'],
  'rosa antigo': ['rosa antigo', 'rosa-antigo', 'dusty rose', 'rose antigo'],
  'algodão doce': ['algodao doce', 'algodao-doce', 'cotton candy', 'algodaodoce'],
  
  // Pretos e Brancos
  'preto': ['preto', 'black', 'negro', 'dark', 'noir'],
  'branco': ['branco', 'white', 'branquinho', 'snow'],
  'off-white': ['off white', 'offwhite', 'off-white', 'branco gelo', 'gelo'],
  'creme': ['creme', 'cream', 'ivory', 'marfim'],
  
  // Azuis
  'azul': ['azul', 'blue'],
  'azul marinho': ['marinho', 'navy', 'azul marinho', 'azul-marinho', 'naval'],
  'azul royal': ['royal', 'azul royal', 'azul-royal', 'realeza'],
  'azul bebê': ['azul bebe', 'azul-bebe', 'baby blue', 'azul claro', 'celeste'],
  'azul céu': ['azul ceu', 'azul-ceu', 'sky blue', 'celeste'],
  'azul petróleo': ['azul petroleo', 'azul-petroleo', 'petroleo', 'teal'],
  'azul turquesa': ['azul turquesa', 'turquesa', 'turquoise', 'tiffany'],
  'azul piscina': ['azul piscina', 'azul-piscina', 'piscina', 'aqua'],
  'azul cobalto': ['cobalto', 'azul cobalto', 'azul-cobalto', 'cobalt'],
  
  // Verdes
  'verde': ['verde', 'green'],
  'verde limão': ['verde limao', 'verde-limao', 'limao', 'lime', 'lima'],
  'verde água': ['verde agua', 'verde-agua', 'agua', 'aqua', 'mint'],
  'verde menta': ['menta', 'verde menta', 'verde-menta', 'mint'],
  'verde militar': ['militar', 'verde militar', 'verde-militar', 'army', 'army green'],
  'verde musgo': ['musgo', 'verde musgo', 'verde-musgo', 'moss'],
  'verde oliva': ['oliva', 'verde oliva', 'verde-oliva', 'olive'],
  'verde esmeralda': ['esmeralda', 'verde esmeralda', 'verde-esmeralda', 'emerald'],
  'verde bandeira': ['bandeira', 'verde bandeira', 'verde-bandeira'],
  'verde floresta': ['floresta', 'verde floresta', 'verde-floresta', 'forest'],
  
  // Vermelhos
  'vermelho': ['vermelho', 'red', 'rubro', 'encarnado'],
  'vermelho escuro': ['vermelho escuro', 'vermelho-escuro', 'dark red', 'borgonha'],
  'cereja': ['cereja', 'cherry', 'vermelho cereja'],
  'tomate': ['tomate', 'tomato', 'vermelho tomate'],
  
  // Amarelos e Laranjas
  'amarelo': ['amarelo', 'yellow'],
  'amarelo ouro': ['amarelo ouro', 'amarelo-ouro', 'gold yellow', 'mostarda'],
  'amarelo canário': ['canario', 'amarelo canario', 'amarelo-canario'],
  'amarelo bebê': ['amarelo bebe', 'amarelo-bebe', 'baby yellow', 'amarelo claro'],
  'laranja': ['laranja', 'orange'],
  'laranja queimado': ['laranja queimado', 'laranja-queimado', 'burnt orange', 'terracota'],
  'terracota': ['terracota', 'terracotta', 'terra cota'],
  'pêssego': ['pessego', 'peach', 'peach pink'],
  
  // Roxos e Lilás
  'roxo': ['roxo', 'purple', 'violeta', 'violet'],
  'roxo escuro': ['roxo escuro', 'roxo-escuro', 'dark purple', 'uva'],
  'lilás': ['lilas', 'lilac', 'lavanda', 'lavender'],
  'lavanda': ['lavanda', 'lavender', 'lilas claro'],
  'berinjela': ['berinjela', 'eggplant', 'aubergine'],
  'uva': ['uva', 'grape', 'roxo uva'],
  
  // Cinzas
  'cinza': ['cinza', 'gray', 'grey', 'grafite'],
  'cinza claro': ['cinza claro', 'cinza-claro', 'light gray', 'prata'],
  'cinza escuro': ['cinza escuro', 'cinza-escuro', 'dark gray', 'chumbo'],
  'cinza mescla': ['mescla', 'cinza mescla', 'cinza-mescla', 'heather'],
  'grafite': ['grafite', 'graphite', 'charcoal'],
  'chumbo': ['chumbo', 'lead', 'dark grey'],
  
  // Marrons e Beges
  'marrom': ['marrom', 'brown', 'cafe', 'chocolate', 'castanho'],
  'marrom escuro': ['marrom escuro', 'marrom-escuro', 'dark brown', 'cacau'],
  'café': ['cafe', 'coffee', 'marrom cafe'],
  'chocolate': ['chocolate', 'marrom chocolate', 'cacau'],
  'caramelo': ['caramelo', 'caramel', 'toffee'],
  'bege': ['bege', 'beige', 'areia', 'sand'],
  'areia': ['areia', 'sand', 'sandy'],
  'nude': ['nude', 'pele', 'skin', 'neutro'],
  'caqui': ['caqui', 'khaki', 'kaki'],
  
  // Vinhos e Bordôs
  'vinho': ['vinho', 'burgundy', 'bordô', 'bordo', 'wine'],
  'marsala': ['marsala', 'marsalla'],
  'bordô': ['bordo', 'burgundy', 'bordeaux'],
  
  // Corais e Salmões
  'coral': ['coral', 'coral pink'],
  'salmão': ['salmao', 'salmon', 'rosa salmao'],
  
  // Fúcsias e Magentas
  'fucsia': ['fucsia', 'fuchsia', 'magenta', 'pink escuro'],
  'magenta': ['magenta', 'pink magenta'],
  
  // Metálicos
  'dourado': ['dourado', 'gold', 'ouro', 'golden'],
  'prata': ['prata', 'silver', 'prateado'],
  'bronze': ['bronze', 'cobre', 'copper'],
  'rose gold': ['rose gold', 'rosegold', 'ouro rose', 'ouro-rose'],
  
  // Especiais
  'turquesa': ['turquesa', 'turquoise', 'tiffany', 'cyan'],
  'ciano': ['ciano', 'cyan', 'aqua'],
  'neon': ['neon', 'fluorescente', 'fluor'],
  'animal print': ['animal print', 'animal-print', 'onca', 'leopardo', 'zebra'],
  'tie dye': ['tie dye', 'tie-dye', 'tiedye', 'manchado'],
  'estampado': ['estampado', 'estampa', 'print', 'floral'],
};

// Color map for badge styling
export const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  // Pretos e Brancos
  'preto': { bg: '#000000', text: '#fff' },
  'black': { bg: '#000000', text: '#fff' },
  'branco': { bg: '#ffffff', text: '#000' },
  'white': { bg: '#ffffff', text: '#000' },
  'off-white': { bg: '#f5f5dc', text: '#000' },
  'offwhite': { bg: '#f5f5dc', text: '#000' },
  'creme': { bg: '#fffdd0', text: '#000' },
  'cream': { bg: '#fffdd0', text: '#000' },
  
  // Rosas
  'rosa': { bg: '#ff69b4', text: '#000' },
  'pink': { bg: '#ff69b4', text: '#000' },
  'rosa bebê': { bg: '#f4c2c2', text: '#000' },
  'rosa bebe': { bg: '#f4c2c2', text: '#000' },
  'rosa claro': { bg: '#ffb6c1', text: '#000' },
  'rosa chiclete': { bg: '#ff1493', text: '#fff' },
  'rosa choque': { bg: '#ff007f', text: '#fff' },
  'rosa antigo': { bg: '#c08081', text: '#fff' },
  'algodão doce': { bg: '#ffbcd9', text: '#000' },
  'algodao doce': { bg: '#ffbcd9', text: '#000' },
  
  // Azuis
  'azul': { bg: '#0066cc', text: '#fff' },
  'blue': { bg: '#0066cc', text: '#fff' },
  'azul marinho': { bg: '#000080', text: '#fff' },
  'marinho': { bg: '#000080', text: '#fff' },
  'navy': { bg: '#000080', text: '#fff' },
  'azul royal': { bg: '#4169e1', text: '#fff' },
  'royal': { bg: '#4169e1', text: '#fff' },
  'azul bebê': { bg: '#89cff0', text: '#000' },
  'azul bebe': { bg: '#89cff0', text: '#000' },
  'azul claro': { bg: '#add8e6', text: '#000' },
  'azul céu': { bg: '#87ceeb', text: '#000' },
  'azul ceu': { bg: '#87ceeb', text: '#000' },
  'azul petróleo': { bg: '#008080', text: '#fff' },
  'azul petroleo': { bg: '#008080', text: '#fff' },
  'petroleo': { bg: '#008080', text: '#fff' },
  'azul turquesa': { bg: '#40e0d0', text: '#000' },
  'azul piscina': { bg: '#00CED1', text: '#000' },
  'piscina': { bg: '#00CED1', text: '#000' },
  'azul cobalto': { bg: '#0047ab', text: '#fff' },
  'cobalto': { bg: '#0047ab', text: '#fff' },
  
  // Verdes
  'verde': { bg: '#228b22', text: '#fff' },
  'green': { bg: '#228b22', text: '#fff' },
  'verde limão': { bg: '#32cd32', text: '#000' },
  'verde limao': { bg: '#32cd32', text: '#000' },
  'limao': { bg: '#32cd32', text: '#000' },
  'verde água': { bg: '#7fffd4', text: '#000' },
  'verde agua': { bg: '#7fffd4', text: '#000' },
  'verde menta': { bg: '#98ff98', text: '#000' },
  'menta': { bg: '#98ff98', text: '#000' },
  'verde militar': { bg: '#4b5320', text: '#fff' },
  'militar': { bg: '#4b5320', text: '#fff' },
  'verde musgo': { bg: '#556b2f', text: '#fff' },
  'musgo': { bg: '#556b2f', text: '#fff' },
  'verde oliva': { bg: '#808000', text: '#fff' },
  'oliva': { bg: '#808000', text: '#fff' },
  'verde esmeralda': { bg: '#50c878', text: '#000' },
  'esmeralda': { bg: '#50c878', text: '#000' },
  'verde bandeira': { bg: '#009739', text: '#fff' },
  'bandeira': { bg: '#009739', text: '#fff' },
  'verde floresta': { bg: '#228B22', text: '#fff' },
  
  // Vermelhos
  'vermelho': { bg: '#ff0000', text: '#fff' },
  'red': { bg: '#ff0000', text: '#fff' },
  'vermelho escuro': { bg: '#8b0000', text: '#fff' },
  'cereja': { bg: '#de3163', text: '#fff' },
  'tomate': { bg: '#ff6347', text: '#000' },
  
  // Amarelos e Laranjas
  'amarelo': { bg: '#ffd700', text: '#000' },
  'yellow': { bg: '#ffd700', text: '#000' },
  'amarelo ouro': { bg: '#daa520', text: '#000' },
  'mostarda': { bg: '#ffdb58', text: '#000' },
  'amarelo canário': { bg: '#ffef00', text: '#000' },
  'amarelo bebê': { bg: '#fffacd', text: '#000' },
  'laranja': { bg: '#ff8c00', text: '#000' },
  'orange': { bg: '#ff8c00', text: '#000' },
  'laranja queimado': { bg: '#cc5500', text: '#fff' },
  'terracota': { bg: '#E2725B', text: '#fff' },
  'pêssego': { bg: '#ffcba4', text: '#000' },
  'pessego': { bg: '#ffcba4', text: '#000' },
  
  // Roxos e Lilás
  'roxo': { bg: '#800080', text: '#fff' },
  'purple': { bg: '#800080', text: '#fff' },
  'violeta': { bg: '#8b00ff', text: '#fff' },
  'roxo escuro': { bg: '#4b0082', text: '#fff' },
  'lilás': { bg: '#c8a2c8', text: '#000' },
  'lilas': { bg: '#c8a2c8', text: '#000' },
  'lavanda': { bg: '#e6e6fa', text: '#000' },
  'berinjela': { bg: '#614051', text: '#fff' },
  'uva': { bg: '#6f2da8', text: '#fff' },
  
  // Cinzas
  'cinza': { bg: '#808080', text: '#fff' },
  'gray': { bg: '#808080', text: '#fff' },
  'grey': { bg: '#808080', text: '#fff' },
  'cinza claro': { bg: '#d3d3d3', text: '#000' },
  'cinza escuro': { bg: '#696969', text: '#fff' },
  'cinza mescla': { bg: '#a9a9a9', text: '#000' },
  'mescla': { bg: '#a9a9a9', text: '#000' },
  'grafite': { bg: '#474747', text: '#fff' },
  'chumbo': { bg: '#36454f', text: '#fff' },
  
  // Marrons e Beges
  'marrom': { bg: '#8b4513', text: '#fff' },
  'brown': { bg: '#8b4513', text: '#fff' },
  'marrom escuro': { bg: '#5c4033', text: '#fff' },
  'café': { bg: '#6f4e37', text: '#fff' },
  'cafe': { bg: '#6f4e37', text: '#fff' },
  'chocolate': { bg: '#7b3f00', text: '#fff' },
  'caramelo': { bg: '#ffd59a', text: '#000' },
  'bege': { bg: '#f5f5dc', text: '#000' },
  'beige': { bg: '#f5f5dc', text: '#000' },
  'areia': { bg: '#c2b280', text: '#000' },
  'nude': { bg: '#e3bc9a', text: '#000' },
  'caqui': { bg: '#c3b091', text: '#000' },
  'khaki': { bg: '#c3b091', text: '#000' },
  
  // Vinhos e Bordôs
  'vinho': { bg: '#722f37', text: '#fff' },
  'burgundy': { bg: '#800020', text: '#fff' },
  'marsala': { bg: '#955251', text: '#fff' },
  'bordô': { bg: '#800020', text: '#fff' },
  'bordo': { bg: '#800020', text: '#fff' },
  
  // Corais e Salmões
  'coral': { bg: '#ff7f50', text: '#000' },
  'salmão': { bg: '#fa8072', text: '#000' },
  'salmao': { bg: '#fa8072', text: '#000' },
  'salmon': { bg: '#fa8072', text: '#000' },
  
  // Fúcsias e Magentas
  'fucsia': { bg: '#ff00ff', text: '#fff' },
  'fúcsia': { bg: '#ff00ff', text: '#fff' },
  'fuchsia': { bg: '#ff00ff', text: '#fff' },
  'magenta': { bg: '#ff00ff', text: '#fff' },
  
  // Turquesas e Cianos
  'turquesa': { bg: '#40e0d0', text: '#000' },
  'turquoise': { bg: '#40e0d0', text: '#000' },
  'tiffany': { bg: '#0ABAB5', text: '#000' },
  'ciano': { bg: '#00ffff', text: '#000' },
  'cyan': { bg: '#00ffff', text: '#000' },
  'aqua': { bg: '#00FFFF', text: '#000' },
  
  // Metálicos
  'dourado': { bg: '#d4af37', text: '#000' },
  'gold': { bg: '#d4af37', text: '#000' },
  'ouro': { bg: '#d4af37', text: '#000' },
  'prata': { bg: '#c0c0c0', text: '#000' },
  'silver': { bg: '#c0c0c0', text: '#000' },
  'bronze': { bg: '#CD7F32', text: '#000' },
  'cobre': { bg: '#B87333', text: '#fff' },
  'rose gold': { bg: '#B76E79', text: '#fff' },
  'rosegold': { bg: '#B76E79', text: '#fff' },
  
  // Especiais
  'neon': { bg: '#39FF14', text: '#000' },
  'fluorescente': { bg: '#39FF14', text: '#000' },
};

// Size order constant
export const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'EXGG'] as const;

// Normalize text for color matching
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sort sizes in correct order
export function sortSizes(sizesArray: string[]): string[] {
  return [...sizesArray].sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a.toUpperCase() as typeof SIZE_ORDER[number]);
    const bIndex = SIZE_ORDER.indexOf(b.toUpperCase() as typeof SIZE_ORDER[number]);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

// Get color style for badge
export function getColorStyle(colorName: string | undefined): { bg: string; text: string } | null {
  if (!colorName) return null;
  const lowerColor = colorName.toLowerCase();
  return COLOR_MAP[lowerColor] || { bg: '#6b7280', text: '#fff' };
}
