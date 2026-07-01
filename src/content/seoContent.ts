// Central SEO copy for category pages and commercial landings.
export interface FaqItem { q: string; a: string; }
export interface SeoBlock {
  intro: string;
  sections: { h2: string; body: string }[];
  bullets?: string[];
  faq: FaqItem[];
  internalLinks?: { label: string; href: string }[];
}

export const categorySeo: Record<string, SeoBlock> = {
  leggings: {
    intro: "As leggings Avance Modas são fabricadas em poliamida premium com elastano, o tecido tecnológico preferido por academias, estúdios de pilates, corrida e treinos funcionais. Cada peça passa por teste de transparência em agachamento, garantindo cobertura total, alta compressão modeladora e caimento perfeito na cintura alta — sem marcar e sem apertar. É a legging feminina certa para quem procura conforto, durabilidade e um visual valorizado do PP ao EXGG.",
    sections: [
      { h2: "Legging de poliamida com compressão inteligente", body: "A poliamida grossa Avance oferece compressão graduada que sustenta glúteos, abdômen e coxas sem restringir o movimento. Tecido com elasticidade multidirecional, respirabilidade e proteção UV 50+, ideal para treinos ao ar livre. A costura reforçada evita rasgos em agachamentos profundos e a cintura alta com franzido interno se mantém no lugar durante todo o treino." },
      { h2: "Cintura alta que valoriza a silhueta", body: "A modelagem cintura alta afina a silhueta, sustenta o abdômen e alonga as pernas visualmente. Nossas leggings cintura alta foram desenvolvidas com bordas duplas de 8 cm que não enrolam nem descem durante o treino, resolvendo o problema clássico das leggings comuns." },
      { h2: "Sem transparência, sem marcar e com toque macio", body: "O grande diferencial da legging Avance é a garantia de zero transparência mesmo em cores claras. Utilizamos poliamida com gramatura acima da média do mercado e a tecnologia Aloe Vera libera micro-hidratação no contato com a pele — o resultado é conforto contínuo, sem alergias, com sensação de segunda pele." },
      { h2: "Para academia, corrida, pilates ou uso casual", body: "Da musculação pesada ao yoga, do pilates ao dia a dia, a legging fitness feminina Avance Modas acompanha qualquer rotina. Combine com nossos tops fitness ou blusas para montar um look esportivo completo, ou use no casual com tênis e camisetão oversized." }
    ],
    bullets: ["Poliamida premium com elastano e proteção UV 50+","Compressão modeladora sem apertar","Cintura alta que não enrola nem desce","Testadas contra transparência em agachamento","Fabricação própria no Brasil — atacado e varejo","Tamanhos do PP ao EXGG"],
    faq: [
      { q: "A legging Avance Modas é transparente quando agacha?", a: "Não. Todas as leggings passam pelo teste de agachamento com poliamida grossa e cobertura total, mesmo em cores claras como bege e off-white." },
      { q: "Qual a diferença entre legging de poliamida e de suplex?", a: "A poliamida com elastano tem compressão superior, maior durabilidade da cor, secagem mais rápida e é mais respirável que o suplex tradicional. Também oferece proteção UV 50+, o que o suplex comum não garante." },
      { q: "A legging cintura alta serve para academia e corrida?", a: "Sim. A cintura alta com 8 cm foi projetada para não descer durante agachamentos, corridas e treinos funcionais, com franzido interno anti-deslizamento." },
      { q: "Como escolher o tamanho ideal da legging?", a: "Consulte a tabela de medidas de cada produto. Nossas peças acompanham gradação do PP ao EXGG e a poliamida tem elasticidade que se adapta ao corpo mantendo a modelagem original." },
      { q: "Como lavar a legging para durar mais?", a: "Lave à mão ou máquina em ciclo delicado com água fria, sem alvejante e sem amaciante. Seque à sombra. Isso preserva a elasticidade e a tecnologia UV/Aloe Vera do tecido." },
      { q: "Vocês vendem legging no atacado para revenda?", a: "Sim. Somos fabricantes de moda fitness feminina e atendemos revendedoras em todo o Brasil com condições especiais. Acesse a loja Atacado ou fale com nossa equipe pelo WhatsApp." }
    ],
    internalLinks: [
      { label: "Ver Conjuntos Fitness", href: "/categoria/conjuntos" },
      { label: "Ver Tops Fitness", href: "/categoria/tops" },
      { label: "Guia: como escolher legging fitness", href: "/guias/guia-legging-fitness" },
      { label: "Atacado para revendedoras", href: "/atacado" }
    ]
  },
  shorts: {
    intro: "Os shorts fitness femininos da Avance Modas combinam compressão, liberdade de movimento e caimento impecável. Fabricados em poliamida com elastano de alta gramatura, são a escolha certa para academia, musculação, corrida e treinos ao ar livre — com cintura alta que sustenta o abdômen e tecido com proteção UV 50+ para dias de sol.",
    sections: [
      { h2: "Short fitness com poliamida premium", body: "A poliamida Avance tem elasticidade multidirecional, secagem rápida e não desbota após lavagens. Os shorts oferecem compressão suave nos glúteos e coxas sem marcar, com costura interna reforçada para evitar atrito nos treinos mais intensos." },
      { h2: "Modelagem cintura alta e sem transparência", body: "Todos os nossos shorts fitness passam pelo teste de agachamento — não são transparentes nem enrolam durante o treino. A cintura alta afina a silhueta e sustenta o abdômen, garantindo conforto do início ao fim." },
      { h2: "Versatilidade da academia ao casual", body: "Combine os shorts com nossos tops fitness ou camisetas oversized para um look esportivo completo. Servem para musculação, funcional, crossfit, corrida, ciclismo indoor e também para o dia a dia no verão." }
    ],
    bullets: ["Poliamida com elastano de alta gramatura","Cintura alta modeladora","Compressão sem marcar","Proteção UV 50+","Ideal para academia, corrida e crossfit"],
    faq: [
      { q: "O short fitness Avance sobe durante o treino?", a: "Não. A cintura alta com franzido interno mantém a peça no lugar em agachamentos, corridas e saltos." },
      { q: "Qual o tecido dos shorts?", a: "Poliamida com elastano — tecido tecnológico com compressão, respirabilidade, proteção UV 50+ e Aloe Vera." },
      { q: "Serve para musculação pesada?", a: "Sim, a costura é reforçada para agachamentos, levantamento terra e movimentos amplos, sem risco de rasgar." },
      { q: "Compro no atacado para revender?", a: "Sim. Trabalhamos com atacado para revendedoras em todo o Brasil. Acesse a loja Atacado." }
    ],
    internalLinks: [
      { label: "Ver Bermudas", href: "/categoria/bermudas" },
      { label: "Ver Leggings", href: "/categoria/leggings" },
      { label: "Ver Tops Fitness", href: "/categoria/tops" }
    ]
  },
  tops: {
    intro: "Os tops fitness Avance Modas oferecem sustentação real, modelagem valorizada e conforto de segunda pele. Feitos em poliamida com elastano, são indicados para treinos de baixo, médio e alto impacto — do yoga à musculação e corrida — com bojo removível e costura anatômica que não marca.",
    sections: [
      { h2: "Sustentação para todos os tipos de treino", body: "Nossos tops têm modelagens variadas: nadador, cropped, com alça larga ou fina, com e sem bojo. Cada modelagem foi pensada para uma intensidade de treino específica." },
      { h2: "Poliamida macia e respirável", body: "O tecido tem toque suave, alta respirabilidade e não retém suor. A tecnologia Aloe Vera hidrata a pele durante o treino e a proteção UV 50+ acompanha em atividades ao ar livre." },
      { h2: "Combine com leggings ou shorts", body: "Os tops fitness Avance combinam com toda a nossa linha de leggings, shorts e bermudas. Monte conjuntos coordenados ou aposte em contrastes para um visual autêntico." }
    ],
    bullets: ["Bojo removível em vários modelos","Modelagens para baixo, médio e alto impacto","Poliamida com elastano e Aloe Vera","Proteção UV 50+"],
    faq: [
      { q: "Os tops têm bojo?", a: "A maioria dos modelos vem com bojo removível. Confira a descrição de cada produto." },
      { q: "Servem para corrida?", a: "Sim. Os modelos nadador e com alças largas oferecem sustentação para alto impacto." },
      { q: "O tecido é respirável?", a: "Sim, a poliamida Avance tem alta respirabilidade e não retém suor." }
    ],
    internalLinks: [
      { label: "Ver Conjuntos Fitness", href: "/categoria/conjuntos" },
      { label: "Ver Leggings", href: "/categoria/leggings" },
      { label: "Ver Blusas", href: "/categoria/blusas" }
    ]
  },
  conjuntos: {
    intro: "Os conjuntos fitness Avance Modas são a solução prática para quem quer um look esportivo completo e coordenado. Top + legging, top + short, top + bermuda: cada conjunto é fabricado em poliamida premium, com sustentação, compressão e caimento pensados como uma peça só.",
    sections: [
      { h2: "Conjunto fitness coordenado do PP ao EXGG", body: "Escolha a modelagem do top e da parte de baixo separadamente para garantir o encaixe perfeito ao seu corpo. Todos os conjuntos são feitos em lotes casados de tecido, garantindo tonalidade idêntica entre as peças." },
      { h2: "Perfeito para academia, viagem e uso casual", body: "Um conjunto fitness resolve o look esportivo do dia — praticidade, estilo e conforto em uma peça só. Ideal para academia, pilates, viagens, home office ativo e passeios casuais." }
    ],
    bullets: ["Top + bottom coordenados em lotes casados","Escolha tamanhos separadamente","Poliamida com Aloe Vera e UV 50+"],
    faq: [
      { q: "Posso escolher tamanhos diferentes para top e bottom?", a: "Sim. Cada conjunto permite selecionar o tamanho do top e da parte de baixo separadamente." },
      { q: "O conjunto vem embalado junto?", a: "Sim, cada conjunto é enviado embalado como uma peça única, pronto para presente ou revenda." }
    ],
    internalLinks: [
      { label: "Ver Tops Fitness", href: "/categoria/tops" },
      { label: "Ver Leggings", href: "/categoria/leggings" },
      { label: "Ver Shorts", href: "/categoria/shorts" }
    ]
  },
  bermudas: {
    intro: "As bermudas fitness Avance Modas têm o comprimento intermediário perfeito entre o short e a legging — cobrem a coxa sem prender o joelho. Em poliamida com elastano, oferecem compressão, respirabilidade e proteção UV 50+ para treinos e uso diário.",
    sections: [
      { h2: "Bermuda fitness com bolso", body: "Muitos dos nossos modelos incluem bolso lateral ou traseiro para guardar celular e chaves durante o treino ou passeio. A cintura alta com franzido interno mantém a peça no lugar." },
      { h2: "Ideal para quem prefere mais cobertura", body: "A bermuda é a escolha certa para quem quer mais cobertura que o short, mas mais liberdade que a legging. Perfeita para funcional, musculação, corrida e caminhada." }
    ],
    bullets: ["Comprimento intermediário","Modelos com bolso","Poliamida com UV 50+"],
    faq: [
      { q: "A bermuda cobre até onde?", a: "Até aproximadamente meia coxa, variando conforme o tamanho selecionado." },
      { q: "Tem bolso?", a: "Vários modelos têm bolso lateral. Confira a descrição do produto." }
    ],
    internalLinks: [
      { label: "Ver Shorts", href: "/categoria/shorts" },
      { label: "Ver Leggings", href: "/categoria/leggings" }
    ]
  },
  blusas: {
    intro: "As blusas fitness Avance Modas complementam o look esportivo com estilo. Camisetas, baby looks, tapa-bumbum e cropped em poliamida ou algodão premium, com modelagens que valorizam a silhueta e acompanham qualquer treino.",
    sections: [
      { h2: "Camisetas e cropped fitness", body: "Tecido leve, respirável e com secagem rápida. Vestem bem sem apertar e são ideais para sobreposição em treinos ou uso casual." }
    ],
    bullets: ["Tecidos leves e respiráveis","Modelagens variadas","Combinam com toda a linha fitness"],
    faq: [
      { q: "As blusas encolhem na lavagem?", a: "Não. Seguimos os padrões de pré-encolhimento e recomendamos lavagem em água fria, sem secadora." }
    ],
    internalLinks: [
      { label: "Ver Tops Fitness", href: "/categoria/tops" },
      { label: "Ver Conjuntos", href: "/categoria/conjuntos" }
    ]
  },
  camisetas: {
    intro: "Camisetas fitness femininas em poliamida e algodão, com modelagens confortáveis para treino e dia a dia. Toque macio, secagem rápida e caimento valorizado.",
    sections: [
      { h2: "Camiseta fitness respirável", body: "Ideal para treinos indoor e outdoor. Tecido leve, absorve o suor e seca rápido, com modelagens que não ficam apertadas na axila." }
    ],
    faq: [{ q: "Serve para correr?", a: "Sim, o tecido é leve e respirável — ideal para corrida e caminhada." }]
  },
  promocoes: {
    intro: "Ofertas selecionadas de moda fitness feminina Avance Modas: leggings, shorts, tops, bermudas e conjuntos com desconto especial. Mesma qualidade da poliamida premium com preços únicos, enquanto durarem os estoques.",
    sections: [
      { h2: "Descontos reais em moda fitness Avance", body: "Aproveite as promoções ativas para renovar seu guarda-roupa esportivo com peças originais Avance Modas: poliamida premium, sem transparência, com proteção UV 50+ e Aloe Vera." }
    ],
    faq: [{ q: "Produtos em promoção têm troca?", a: "Sim, a política de troca segue o Código de Defesa do Consumidor: até 7 dias após o recebimento." }],
    internalLinks: [
      { label: "Ver todas as Leggings", href: "/categoria/leggings" },
      { label: "Ver Conjuntos", href: "/categoria/conjuntos" }
    ]
  }
};

export interface LandingConfig {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  storeType: "VAREJO" | "ATACADO";
  filterKeywords: string[];
  content: SeoBlock;
}

export const landingPages: LandingConfig[] = [
  {
    slug: "legging-poliamida",
    h1: "Legging de Poliamida Premium — Feminina",
    metaTitle: "Legging de Poliamida Premium | Sem Transparência | Avance Modas",
    metaDescription: "Legging de poliamida com elastano, compressão modeladora, cintura alta e proteção UV 50+. Sem transparência. Compre no varejo ou atacado.",
    storeType: "VAREJO",
    filterKeywords: ["legging","leggings"],
    content: {
      intro: "A legging de poliamida Avance Modas foi criada para quem exige o melhor tecido fitness do mercado. Poliamida grossa com elastano, compressão graduada, cintura alta modeladora e cobertura total mesmo em agachamentos profundos — a peça definitiva para academia, corrida, pilates, musculação e uso casual.",
      sections: [
        { h2: "Por que a poliamida é o tecido fitness ideal", body: "A poliamida tem elasticidade multidirecional, secagem rápida, durabilidade superior ao suplex, respirabilidade e não desbota após lavagens. Combinada com elastano, forma o tecido perfeito para leggings de alta compressão." },
        { h2: "Legging sem transparência garantida", body: "Todas as leggings Avance passam pelo teste de agachamento com iluminação natural, garantindo cobertura total mesmo em cores claras como bege, off-white e nude. A gramatura é maior que a média do mercado." },
        { h2: "Cintura alta modeladora que não desce", body: "A cintura alta de 8 cm com franzido interno afina a silhueta, sustenta o abdômen e não enrola durante o treino. Uma solução para o problema clássico das leggings comuns." },
        { h2: "Feito no Brasil — atacado e varejo", body: "A Avance Modas é fabricante própria em São Paulo, com mais de uma década de experiência em moda fitness feminina. Atendemos consumidoras finais no varejo e revendedoras no atacado com condições especiais." }
      ],
      bullets: ["Poliamida com elastano premium","Compressão modeladora","Cintura alta que não desce","Zero transparência garantida","Proteção UV 50+ e Aloe Vera","Fabricação própria — direto da fábrica"],
      faq: [
        { q: "Qual a diferença entre legging de poliamida e legging de suplex?", a: "A poliamida com elastano oferece compressão superior, secagem mais rápida, maior durabilidade da cor e é mais respirável que o suplex tradicional. Também é mais resistente a puxões e não desfia." },
        { q: "A legging de poliamida é transparente?", a: "As leggings Avance passam pelo teste de agachamento e não são transparentes em nenhuma cor, incluindo bege e off-white." },
        { q: "Vocês vendem legging de poliamida no atacado?", a: "Sim. Somos fabricantes e atendemos revendedoras em todo o Brasil com preços de atacado. Acesse a loja Atacado." },
        { q: "Como lavar a legging de poliamida?", a: "Lavagem à mão ou máquina em ciclo delicado, água fria, sem alvejante, sem amaciante e sem secadora." }
      ],
      internalLinks: [
        { label: "Legging cintura alta", href: "/legging-cintura-alta" },
        { label: "Legging sem transparência", href: "/legging-sem-transparencia" },
        { label: "Guia da poliamida", href: "/guias/guia-poliamida-moda-fitness" },
        { label: "Comprar no atacado", href: "/atacado" }
      ]
    }
  },
  {
    slug: "legging-cintura-alta",
    h1: "Legging Cintura Alta Feminina — Modeladora",
    metaTitle: "Legging Cintura Alta Modeladora | Não Desce | Avance Modas",
    metaDescription: "Legging cintura alta de poliamida com franzido interno anti-deslizamento. Modeladora, sem marcar, sem descer. Varejo e atacado.",
    storeType: "VAREJO",
    filterKeywords: ["legging"],
    content: {
      intro: "A legging cintura alta Avance Modas é a resposta para quem cansou de leggings que descem, marcam ou enrolam. Nossa cintura tem 8 cm de altura, franzido interno anti-deslizamento e afina a silhueta enquanto sustenta o abdômen.",
      sections: [
        { h2: "Cintura alta que realmente sustenta", body: "O diferencial é o franzido interno em elástico duplo, que abraça a cintura e não deixa a peça descer nem em agachamentos profundos, corridas ou saltos." },
        { h2: "Modeladora sem apertar", body: "A compressão da poliamida modela sem apertar, criando efeito visual afinador sem prejudicar a respiração ou a mobilidade." },
        { h2: "Para academia, corrida e pilates", body: "Ideal para musculação, funcional, corrida, pilates e crossfit." }
      ],
      bullets: ["Cintura de 8 cm com franzido interno","Não desce em agachamentos","Modeladora sem apertar"],
      faq: [
        { q: "A cintura marca o abdômen?", a: "Não. A poliamida abraça sem apertar e não marca." },
        { q: "Serve para grávidas?", a: "Nos primeiros meses sim. Depois recomendamos consultar o médico." }
      ],
      internalLinks: [
        { label: "Ver todas as leggings", href: "/categoria/leggings" },
        { label: "Legging de poliamida", href: "/legging-poliamida" }
      ]
    }
  },
  {
    slug: "legging-sem-transparencia",
    h1: "Legging Sem Transparência Garantida",
    metaTitle: "Legging Sem Transparência | Testada em Agachamento | Avance Modas",
    metaDescription: "Legging de poliamida grossa testada contra transparência em agachamento. Cobertura total mesmo em cores claras. Varejo e atacado.",
    storeType: "VAREJO",
    filterKeywords: ["legging"],
    content: {
      intro: "Todas as leggings Avance Modas passam pelo teste rigoroso de agachamento com luz natural. Usamos poliamida com gramatura acima da média do mercado, garantindo cobertura total mesmo em cores claras como bege, off-white e nude.",
      sections: [
        { h2: "Como testamos a transparência", body: "Cada peça produzida é testada por uma modeladora que faz agachamento profundo em frente a fonte de luz natural. Só aprovamos peças com opacidade 100%." },
        { h2: "Poliamida grossa e gramatura elevada", body: "Enquanto o mercado usa gramaturas leves para reduzir custo, nossa poliamida tem espessura superior — mais durabilidade, mais compressão e zero transparência." }
      ],
      faq: [
        { q: "Mesmo em cor clara?", a: "Sim, incluindo bege, off-white e nude." },
        { q: "E depois de várias lavagens?", a: "A opacidade se mantém desde que você siga as recomendações de lavagem." }
      ],
      internalLinks: [
        { label: "Legging de poliamida", href: "/legging-poliamida" },
        { label: "Legging cintura alta", href: "/legging-cintura-alta" }
      ]
    }
  },
  {
    slug: "calca-fitness",
    h1: "Calça Fitness Feminina — Poliamida Premium",
    metaTitle: "Calça Fitness Feminina | Poliamida Premium | Avance Modas",
    metaDescription: "Calças fitness femininas Avance Modas: poliamida com elastano, cintura alta, compressão modeladora. Do PP ao EXGG. Varejo e atacado.",
    storeType: "VAREJO",
    filterKeywords: ["legging","calça"],
    content: {
      intro: "A calça fitness feminina Avance Modas é sinônimo de conforto, estilo e performance. Fabricada em poliamida premium com elastano, oferece compressão modeladora, cintura alta e caimento perfeito para academia, corrida e uso casual.",
      sections: [
        { h2: "Calça legging para todos os treinos", body: "Da musculação ao pilates, do funcional à corrida, a calça fitness Avance acompanha qualquer intensidade com liberdade de movimento total." }
      ],
      faq: [{ q: "Serve como calça de dia a dia?", a: "Sim. Muitas clientes usam como calça casual pela versatilidade da poliamida." }],
      internalLinks: [
        { label: "Leggings", href: "/categoria/leggings" },
        { label: "Ver Conjuntos", href: "/categoria/conjuntos" }
      ]
    }
  },
  {
    slug: "short-fitness",
    h1: "Short Fitness Feminino — Poliamida Grossa",
    metaTitle: "Short Fitness Feminino | Cintura Alta | Avance Modas",
    metaDescription: "Shorts fitness em poliamida grossa, cintura alta, sem transparência. Ideal para academia, corrida e crossfit. Varejo e atacado.",
    storeType: "VAREJO",
    filterKeywords: ["short","shorts"],
    content: {
      intro: "Shorts fitness femininos Avance Modas em poliamida grossa com elastano, cintura alta modeladora e cobertura total. Para academia, corrida, crossfit e verão.",
      sections: [
        { h2: "Short que não sobe e não marca", body: "Costura interna reforçada, cintura alta com franzido e compressão sem apertar." }
      ],
      faq: [{ q: "Serve para correr?", a: "Sim, o corte anatômico evita atrito e a cintura alta sustenta o abdômen." }],
      internalLinks: [{ label: "Bermudas fitness", href: "/categoria/bermudas" }]
    }
  },
  {
    slug: "conjunto-fitness",
    h1: "Conjunto Fitness Feminino — Top + Legging Coordenados",
    metaTitle: "Conjunto Fitness Feminino | Top + Bottom Coordenados | Avance Modas",
    metaDescription: "Conjuntos fitness Avance Modas: top + legging, short ou bermuda em poliamida premium, lotes casados. Do PP ao EXGG.",
    storeType: "VAREJO",
    filterKeywords: ["conjunto","conjuntos"],
    content: {
      intro: "Os conjuntos fitness Avance Modas são coordenados em lotes casados de tecido, garantindo tonalidade idêntica entre top e parte de baixo. Escolha tamanhos separados para encaixe perfeito.",
      sections: [
        { h2: "Conjunto pronto para o treino", body: "Praticidade e estilo em uma peça só. Ideal para academia, viagem e uso casual." }
      ],
      faq: [{ q: "Posso escolher tamanhos diferentes?", a: "Sim, top e bottom são selecionados separadamente." }],
      internalLinks: [
        { label: "Ver Tops", href: "/categoria/tops" },
        { label: "Ver Leggings", href: "/categoria/leggings" }
      ]
    }
  },
  {
    slug: "roupa-fitness-feminina",
    h1: "Roupa Fitness Feminina — Poliamida Premium Avance",
    metaTitle: "Roupa Fitness Feminina | Poliamida Premium | Avance Modas",
    metaDescription: "Roupa fitness feminina com poliamida premium, UV 50+ e Aloe Vera. Leggings, tops, shorts, conjuntos. Fabricante brasileira. Varejo e atacado.",
    storeType: "VAREJO",
    filterKeywords: ["legging","top","short","conjunto","bermuda"],
    content: {
      intro: "A Avance Modas é referência em roupa fitness feminina no Brasil. Produzimos leggings, tops, shorts, bermudas e conjuntos em poliamida premium, com sustentação, compressão e conforto pensados para o corpo feminino.",
      sections: [
        { h2: "Fabricação própria — direto da fábrica", body: "Somos fábrica com sede em São Paulo, produzindo cada peça com controle de qualidade rigoroso. Isso permite oferecer preço competitivo tanto no varejo quanto no atacado." },
        { h2: "Tecido tecnológico com UV 50+ e Aloe Vera", body: "Nossa poliamida tem elasticidade multidirecional, secagem rápida, proteção solar UV 50+ e tecnologia Aloe Vera para hidratação natural da pele durante o treino." }
      ],
      faq: [
        { q: "Vocês são fabricantes?", a: "Sim, somos fábrica própria com mais de uma década de experiência." },
        { q: "Atendem revendedoras?", a: "Sim, temos loja de atacado com condições especiais." }
      ],
      internalLinks: [
        { label: "Ver Leggings", href: "/categoria/leggings" },
        { label: "Ver Tops", href: "/categoria/tops" },
        { label: "Atacado para revendedoras", href: "/atacado" }
      ]
    }
  },
  {
    slug: "moda-fitness",
    h1: "Moda Fitness Feminina — Fabricante Avance Modas",
    metaTitle: "Moda Fitness Feminina | Fabricante Brasileira | Avance Modas",
    metaDescription: "Moda fitness feminina direto da fábrica: poliamida premium, UV 50+, Aloe Vera. Leggings, tops, conjuntos. Varejo e atacado.",
    storeType: "VAREJO",
    filterKeywords: ["legging","top","short","conjunto"],
    content: {
      intro: "Moda fitness feminina Avance Modas: leggings, tops, shorts, bermudas e conjuntos em poliamida premium com Aloe Vera e UV 50+. Fabricação própria, qualidade premium, atacado e varejo.",
      sections: [
        { h2: "Coleção completa de moda fitness", body: "Peças para academia, corrida, pilates, funcional e uso casual." },
        { h2: "Do PP ao EXGG", body: "Modelagem inclusiva pensada para todos os corpos femininos." }
      ],
      faq: [{ q: "Tem tamanho plus size?", a: "Sim, atendemos até EXGG e trabalhamos com modelagem inclusiva." }],
      internalLinks: [
        { label: "Fornecedor moda fitness", href: "/fornecedor-moda-fitness" },
        { label: "Moda fitness atacado", href: "/moda-fitness-atacado" }
      ]
    }
  },
  {
    slug: "moda-fitness-atacado",
    h1: "Moda Fitness Atacado — Fábrica Avance",
    metaTitle: "Moda Fitness Atacado | Fábrica Direto | Avance Modas",
    metaDescription: "Moda fitness atacado direto da fábrica: leggings, tops, conjuntos em poliamida premium. Preço de atacado, envio para todo Brasil.",
    storeType: "ATACADO",
    filterKeywords: [],
    content: {
      intro: "A Avance Modas é fabricante brasileira de moda fitness feminina e atende revendedoras em todo o país com preço de atacado direto da fábrica. Poliamida premium, sem transparência, com proteção UV 50+ e Aloe Vera.",
      sections: [
        { h2: "Preço de fábrica, qualidade premium", body: "Sem atravessadores. Você compra direto da fábrica em São Paulo, com garantia de qualidade, prazo e reposição." },
        { h2: "Envio para todo o Brasil", body: "Enviamos por Loggi e Correios com rastreio. Prazo médio 2 a 10 dias úteis." },
        { h2: "Mix ideal para revenda", body: "Nossa curadoria de atacado prioriza os best-sellers: leggings pretas, cinturas altas, tops nadador e conjuntos coordenados." }
      ],
      bullets: ["Fábrica própria em São Paulo","Preço direto de fábrica","Poliamida premium testada","Envio nacional com rastreio","Suporte comercial via WhatsApp"],
      faq: [
        { q: "Qual o pedido mínimo?", a: "Trabalhamos com pedido mínimo baixo para facilitar o início da revenda. Consulte nosso time comercial." },
        { q: "Vocês emitem nota fiscal?", a: "Sim, todas as vendas são com nota fiscal (CNPJ 61.705.129/0001-90)." },
        { q: "Como funciona a política de troca?", a: "Trocas apenas em caso de defeito de fabricação, conforme política vigente." }
      ],
      internalLinks: [
        { label: "Loja Atacado", href: "/atacado" },
        { label: "Guia da revenda fitness", href: "/guias/revenda-moda-fitness-atacado" },
        { label: "Fornecedor de moda fitness", href: "/fornecedor-moda-fitness" }
      ]
    }
  },
  {
    slug: "fornecedor-moda-fitness",
    h1: "Fornecedor de Moda Fitness Feminina — Avance Modas",
    metaTitle: "Fornecedor de Moda Fitness Feminina | Fábrica Brasil | Avance Modas",
    metaDescription: "Fornecedor brasileiro de moda fitness feminina para revenda: poliamida premium, preços de fábrica, envio nacional. Fale com o comercial.",
    storeType: "ATACADO",
    filterKeywords: [],
    content: {
      intro: "A Avance Modas é fornecedor de moda fitness feminina para revendedoras, lojas físicas, e-commerces e influenciadoras em todo o Brasil. Fabricação própria, curadoria de best-sellers e suporte comercial próximo.",
      sections: [
        { h2: "Por que ter a Avance como fornecedor", body: "Mais de 10 anos de mercado, produção nacional, controle de qualidade e uma linha de produtos consolidada como best-sellers em academias e revendas." },
        { h2: "Atendimento comercial direto", body: "Nosso time comercial atende diretamente pelo WhatsApp, orienta na formação do mix, tira dúvidas de modelagem e ajuda a montar a primeira grade de revenda." }
      ],
      faq: [
        { q: "Como me tornar revendedora?", a: "Cadastre-se na loja Atacado e nosso time entra em contato para validar." },
        { q: "Vocês fazem private label?", a: "Sim, oferecemos serviço de private label (marca própria). Consulte a página Private Label." }
      ],
      internalLinks: [
        { label: "Moda fitness atacado", href: "/moda-fitness-atacado" },
        { label: "Private Label", href: "/private-label" },
        { label: "Loja Atacado", href: "/atacado" }
      ]
    }
  }
];
