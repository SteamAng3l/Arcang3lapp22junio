import bibleData from "@/data/bible_categories.json";

export interface VerseResult {
  detected_category: string;
  message: string;
  verse_reference: string;
  verse_text: string;
}

const { categorias, versiculos } = bibleData as {
  categorias: string[];
  versiculos: Record<string, string[]>;
};

const mensajes: Record<string, string> = {
  Confianza: "Pon tu confianza en Dios, Él nunca te fallará.",
  Dios: "Dios es tu refugio y tu fortaleza en todo momento.",
  Amor: "El amor de Dios es infinito e incondicional.",
  Fe: "Tu fe puede mover montañas; confía y cree.",
  Esperanza: "La esperanza en Dios renueva tus fuerzas cada día.",
  Perdón: "El perdón libera el alma y sana el corazón.",
  Salvación: "La salvación es un regalo gratuito de Dios para ti.",
  Gracia: "La gracia de Dios es suficiente para cada necesidad.",
  Paz: "Dios te da paz que sobrepasa todo entendimiento.",
  Justicia: "Dios es justo y endereza todo camino torcido.",
  Sabiduría: "Pide sabiduría a Dios y Él te la dará abundantemente.",
  Oración: "La oración te conecta con el corazón de Dios.",
  Alabanza: "En la alabanza encuentras la presencia de Dios.",
  Misericordia: "Las misericordias de Dios son nuevas cada mañana.",
  Fortaleza: "Dios es tu fortaleza en los momentos más difíciles.",
  Humildad: "El que se humilla ante Dios será enaltecido.",
  Obediencia: "Obedecer a Dios trae bendición a tu vida.",
  Santificación: "Dios te llama a ser santo como Él es santo.",
  Redención: "Cristo te redimió con su preciosa sangre.",
  Gloria: "Toda la gloria pertenece a Dios eternamente.",
  Poder: "El poder de Dios actúa a través de los que creen.",
  Vida: "Cristo vino para darte vida en abundancia.",
  Luz: "Jesús es la luz que ilumina toda oscuridad.",
  Verdad: "La verdad de Dios te hace libre.",
  Juicio: "Dios es el juez justo de toda la tierra.",
  Pecado: "Dios tiene poder para librarte de todo pecado.",
  Arrepentimiento: "El arrepentimiento abre la puerta a la restauración.",
  Bendición: "Dios quiere bendecirte en todas las áreas de tu vida.",
  Profecía: "Las palabras de Dios siempre se cumplen.",
  Milagros: "Dios aún hace milagros para los que creen.",
  Resurrección: "Jesús venció la muerte y vive para siempre.",
  Eternidad: "Dios te ha dado vida eterna en Cristo Jesús.",
  Reino: "Eres ciudadano del reino eterno de Dios.",
  Sacrificio: "Cristo se entregó por amor a ti.",
  "Paz interior": "Entrega tus cargas a Dios y encuentra descanso.",
  "Esperanza viva": "En Cristo tienes una esperanza viva y segura.",
  "Fe activa": "La fe sin obras está muerta; actúa en lo que crees.",
  "Amor incondicional": "Nada puede separarte del amor de Dios.",
  "Gracia divina": "La gracia de Dios actúa donde las fuerzas humanas fallan.",
  "Perdón eterno": "Dios perdona y no recuerda más tus pecados.",
};

function parseVerse(raw: string): { reference: string; text: string } {
  const idx = raw.indexOf(" - ");
  if (idx === -1) return { reference: raw, text: raw };
  return { reference: raw.substring(0, idx), text: raw.substring(idx + 3) };
}

const kw: Record<string, string[]> = {
  Confianza: ["confia", "segur", "refugi", "amparo", "escud"],
  Dios: ["dios", "señor", "jehov", "padre", "altísimo", "todopoderoso"],
  Amor: ["amor", "ama", "caridad", "benignidad"],
  Fe: ["fe ", "creer", "creyen", "fiel", "fidelidad"],
  Esperanza: ["esperan", "espera", "aguarda"],
  Perdón: ["perdó", "perdon", "remisión"],
  Salvación: ["salva", "salvo", "redimi", "liberación"],
  Gracia: ["gracia", "dádiva"],
  Paz: ["paz ", "paz.", "paz,"],
  Justicia: ["justicia", "justo", "rectitud"],
  Sabiduría: ["sabiduría", "sabio", "entendimiento", "prudencia"],
  Oración: ["oración", "orar", "orad", "clama", "pedid"],
  Alabanza: ["alabanza", "alaba", "glorifica", "gozo", "cántico"],
  Misericordia: ["misericordia", "compasión", "piadoso"],
  Fortaleza: ["fortaleza", "fuerza", "esfuerzo", "valiente"],
  Humildad: ["humildad", "humilla", "manso", "humilde"],
  Obediencia: ["obede", "mandamiento", "guardar", "cumplir"],
  Santificación: ["santi", "puro", "limpio", "santo", "consagra"],
  Redención: ["redención", "redencion", "rescata"],
  Gloria: ["gloria", "glorificad", "honra", "magnificencia"],
  Poder: ["poder", "poderoso", "omnipotente", "todopoderoso"],
  Vida: ["vida", "vivir", "vivo"],
  Luz: ["luz ", "luz,", "luz.", "lumbre", "alumbra"],
  Verdad: ["verdad", "verdadero", "certeza"],
  Juicio: ["juicio", "juzgar", "tribunal"],
  Pecado: ["pecado", "maldad", "transgresión", "iniquidad"],
  Arrepentimiento: ["arrepent", "convertíos", "vuélvete", "volveos"],
  Bendición: ["bendición", "bienaventurado", "bendito"],
  Profecía: ["profec", "profeta", "anuncia", "vendrá"],
  Milagros: ["milagro", "maravilla", "portento", "prodigio"],
  Resurrección: ["resurrecc", "resucit", "levantó de los muertos"],
  Eternidad: ["eterno", "eterna", "para siempre", "perpetuo"],
  Reino: ["reino", "rey ", "trono", "reinar"],
  Sacrificio: ["sacrificio", "ofrenda", "holocausto", "sangre"],
  "Paz interior": ["reposa", "consuela", "no temas", "no se turbe", "quieto"],
  "Esperanza viva": ["esperanza viva", "nueva criatura", "renovar"],
  "Fe activa": ["obras", "frutos", "hacer bien", "no nos cansemos"],
  "Amor incondicional": ["nunca te dejará", "nunca me olvidar", "amor eterno"],
  "Gracia divina": ["gracia divina", "gracia de dios"],
  "Perdón eterno": ["perdonará", "borrado", "olvidado", "nunca más"],
};

function detectCategory(text: string): string {
  const low = text.toLowerCase();
  for (const cat of categorias) {
    const keys = kw[cat] || [];
    if (keys.some((k) => low.includes(k))) return cat;
  }
  return categorias[Math.floor(Math.random() * categorias.length)];
}

export function findVerse(query: string): VerseResult {
  const q = query.toLowerCase();
  let matched: string[] = [];
  let detectedCat = "";
  for (const cat of categorias) {
    const keys = kw[cat] || [];
    if (keys.some((k) => q.includes(k)) || q.includes(cat.toLowerCase())) {
      matched = versiculos[cat] || [];
      detectedCat = cat;
      break;
    }
  }
  if (!matched.length) {
    detectedCat = categorias[Math.floor(Math.random() * categorias.length)];
    matched = versiculos[detectedCat] || [];
  }
  const raw = matched[Math.floor(Math.random() * matched.length)];
  const { reference, text } = parseVerse(raw);
  return {
    detected_category: detectedCat,
    message: mensajes[detectedCat] || "La Palabra de Dios habla a tu corazón.",
    verse_reference: reference,
    verse_text: text,
  };
}

export function randomVerse(): VerseResult {
  const cat = categorias[Math.floor(Math.random() * categorias.length)];
  const list = versiculos[cat] || [];
  const raw = list[Math.floor(Math.random() * list.length)];
  const { reference, text } = parseVerse(raw);
  return {
    detected_category: cat,
    message: mensajes[cat] || "La Palabra de Dios habla a tu corazón.",
    verse_reference: reference,
    verse_text: text,
  };
}

export function getAllCategories() {
  return categorias.map((cat) => ({
    id: cat.toLowerCase().replace(/\s+/g, "-"),
    label: cat,
    count: (versiculos[cat] || []).length,
  }));
}
